"""
Two-tier planner/executor router for model-driven MCP tool use.

adopt-modern-agent-architecture 2.4 (validate/retry) + 2.5 (two-tier router):

- Planner (largest local model, e.g. qwen3:8b, thinking allowed) decomposes a
  user message into an ordered list of single-tool steps, using PydanticAI's
  `output_type` structured-output validation (native retry on malformed JSON).
- Executor (fast small model, e.g. llama3.2) fills in one tool's JSON
  arguments per step. Arguments are validated against the tool's JSON Schema;
  on failure the executor is re-prompted with the validation error, up to
  `router_max_retries` times, then the step fails gracefully (no exception
  bubbles up - callers render the failure in-persona).
- Persona voice is applied by the caller when rendering the final reply from
  the raw tool results, so persona prompts never compete with tool-use
  instructions.
"""

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import jsonschema
from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

from backend.core.config import Settings

logger = logging.getLogger(__name__)

_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
_FENCE_RE = re.compile(r"^```(?:json)?|```$", re.MULTILINE)


def strip_think(text: Optional[str]) -> str:
    """Remove qwen3-style <think>...</think> reasoning blocks from model output."""
    return _THINK_RE.sub("", text or "").strip()


class PlanStep(BaseModel):
    tool: str
    arguments: Dict[str, Any] = {}
    intent: str = ""  # what this step is trying to accomplish, for executor context


class Plan(BaseModel):
    steps: List[PlanStep] = []


@dataclass
class StepResult:
    tool: str
    ok: bool
    result: Any = None
    error: Optional[str] = None


class ToolRouter:
    """Planner/executor router. Caches PydanticAI Agents per persona/tool and
    tracks an attempt/failure tally for the 2.4 failure-rate log."""

    def __init__(self, settings: Settings, tool_registry: Optional[Any]):
        self.settings = settings
        self.tool_registry = tool_registry
        self._planner_agent: Optional[Agent] = None
        self._executor_agents: Dict[str, Agent] = {}
        self.call_attempts = 0
        self.call_failures = 0

    @property
    def failure_rate(self) -> float:
        if self.call_attempts == 0:
            return 0.0
        return self.call_failures / self.call_attempts

    # ---- routing heuristic: config flag, default ON for tool-shaped chat (2.5) ----

    def looks_tool_shaped(self, message: str) -> bool:
        if not self.settings.router_enabled:
            return False
        lowered = (message or "").lower()
        return any(kw in lowered for kw in self.settings.router_trigger_keywords)

    # ---- planner ----

    def _get_planner_agent(self) -> Agent:
        if self._planner_agent is None:
            provider = OllamaProvider(base_url=f"{self.settings.ollama_base_url}/v1")
            model = OpenAIChatModel(self.settings.router_planner_model, provider=provider)
            self._planner_agent = Agent(
                model,
                output_type=Plan,
                retries=self.settings.router_max_retries,
                system_prompt=(
                    "You decompose a user request into an ordered list of steps, each "
                    "using exactly one tool from the given catalog. Only reference tools "
                    "that appear in the catalog. If nothing in the catalog is relevant, "
                    "return an empty steps list. Do not invent tools or arguments."
                ),
            )
        return self._planner_agent

    async def plan(self, user_message: str) -> Plan:
        tools = self.tool_registry.list_tools() if self.tool_registry else []
        if not tools:
            return Plan(steps=[])

        tool_catalog = "\n".join(
            f"- {t['name']}: {t.get('description') or ''} (schema: {json.dumps(t.get('input_schema') or {})})"
            for t in tools
        )
        prompt = f"Available tools:\n{tool_catalog}\n\nUser request: {user_message}"
        agent = self._get_planner_agent()
        result = await agent.run(prompt)
        plan = result.output
        for step in plan.steps:
            step.intent = strip_think(step.intent)
        return plan

    # ---- executor ----

    def _get_executor_agent(self, tool_name: str, input_schema: Dict[str, Any]) -> Agent:
        if tool_name not in self._executor_agents:
            provider = OllamaProvider(base_url=f"{self.settings.ollama_base_url}/v1")
            model = OpenAIChatModel(self.settings.router_executor_model, provider=provider)
            self._executor_agents[tool_name] = Agent(
                model,
                system_prompt=(
                    f"You produce ONLY a JSON object of arguments for the tool '{tool_name}'. "
                    f"Its JSON Schema is: {json.dumps(input_schema)}. "
                    "Reply with the JSON object and nothing else - no prose, no markdown fences."
                ),
            )
        return self._executor_agents[tool_name]

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        cleaned = _FENCE_RE.sub("", strip_think(text)).strip()
        return json.loads(cleaned)

    async def execute_step(self, step: PlanStep) -> StepResult:
        """Fill + validate a single tool call's arguments, retrying against the
        tool's JSON Schema up to `router_max_retries` times before failing
        gracefully. Tallies attempts/failures for observability (2.4)."""
        tools = self.tool_registry.list_tools() if self.tool_registry else []
        tool_info = next((t for t in tools if t["name"] == step.tool), None)
        if not tool_info:
            return StepResult(tool=step.tool, ok=False, error=f"Unknown tool '{step.tool}'")

        schema = tool_info.get("input_schema") or {}
        agent = self._get_executor_agent(step.tool, schema)

        arguments: Optional[Dict[str, Any]] = step.arguments or None
        last_error: Optional[str] = None
        max_attempts = self.settings.router_max_retries + 1

        for attempt in range(1, max_attempts + 1):
            self.call_attempts += 1

            if arguments is None:
                fill_prompt = step.intent or f"Call {step.tool}"
                if last_error:
                    fill_prompt += f"\nPrevious arguments were invalid: {last_error}. Return corrected JSON."
                try:
                    result = await agent.run(fill_prompt)
                    arguments = self._extract_json(result.output)
                except Exception as e:
                    last_error = f"executor could not produce valid JSON arguments: {e}"
                    self.call_failures += 1
                    logger.warning(
                        f"[router] executor arg-fill failed for '{step.tool}' "
                        f"(attempt {attempt}/{max_attempts}): {e}"
                    )
                    if attempt >= max_attempts:
                        break
                    continue

            try:
                if schema:
                    jsonschema.validate(arguments, schema)
            except jsonschema.ValidationError as e:
                last_error = str(e)
                self.call_failures += 1
                logger.warning(
                    f"[router] tool-arg validation failed for '{step.tool}' "
                    f"(attempt {attempt}/{max_attempts}): {e}. "
                    f"Cumulative failure rate: {self.failure_rate:.0%} "
                    f"({self.call_failures}/{self.call_attempts})"
                )
                arguments = None  # force re-generation with the error on the next attempt
                if attempt >= max_attempts:
                    break
                continue

            try:
                result = await self.tool_registry.call_tool(step.tool, arguments)
                return StepResult(tool=step.tool, ok=True, result=result)
            except Exception as e:
                last_error = str(e)
                self.call_failures += 1
                logger.warning(f"[router] tool call failed for '{step.tool}': {e}")
                break  # execution failure, not a schema issue - don't burn retries on it

        logger.info(
            f"[router] step '{step.tool}' failed after {max_attempts} attempt(s). "
            f"Cumulative failure rate: {self.failure_rate:.0%} ({self.call_failures}/{self.call_attempts})"
        )
        return StepResult(tool=step.tool, ok=False, error=last_error or "unknown error")

    async def execute_plan(self, plan: Plan) -> List[StepResult]:
        return [await self.execute_step(step) for step in plan.steps]
