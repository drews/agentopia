"""
LLM Service using PydanticAI for the Ollama-backed agent runtime.
Provides a unified interface for generating persona responses, with a
lightweight mock provider kept for tests and offline development.
"""

from typing import Dict, Any, Optional, List
import logging

from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

from backend.core.config import Settings

logger = logging.getLogger(__name__)


class FakeListLLM:
    """
    Minimal stand-in for langchain_community's FakeListLLM: cycles through a
    list of canned responses. Kept dependency-free so `mock` works without
    langchain installed. Name/shape ("fake" in type, `.responses`) preserved
    for test compatibility.
    """

    def __init__(self, responses: List[str]):
        self.responses = responses
        self._index = 0

    async def ainvoke(self, *_args, **_kwargs) -> str:
        response = self.responses[self._index % len(self.responses)]
        self._index += 1
        return response

    def invoke(self, *args, **kwargs) -> str:
        return self.responses[self._index % len(self.responses)]


class LLMService:
    """Service for generating LLM responses via PydanticAI (Ollama) or mock."""

    def __init__(self, settings: Settings, websocket_manager: Optional[Any] = None):
        self.settings = settings
        # Optional WebSocketManager, used to broadcast `agent_activity` events
        # (thinking/responding) around PydanticAI calls. None in tests/mock-only use.
        self.websocket_manager = websocket_manager
        # One PydanticAI Agent per distinct system prompt (i.e. per persona) -
        # created lazily and cached so each persona gets exactly one Agent.
        self._ollama_agents: Dict[str, Agent] = {}
        self._mock_provider: Optional[FakeListLLM] = None

    async def _broadcast_activity(self, agent_id: Optional[str], state: str) -> None:
        """Broadcast an `agent_activity` WS event. Best-effort: never breaks a chat response."""
        if not self.websocket_manager or not agent_id:
            return
        try:
            await self.websocket_manager.broadcast({
                "type": "agent_activity",
                "data": {"agent_id": agent_id, "state": state},
            })
        except Exception as e:
            logger.warning(f"Failed to broadcast agent_activity({state}) for {agent_id}: {e}")

    def _get_ollama_agent(self, system_prompt: Optional[str]) -> Agent:
        """Get (or create) the PydanticAI Agent for a given persona system prompt."""
        key = system_prompt or "__default__"
        if key not in self._ollama_agents:
            provider = OllamaProvider(base_url=f"{self.settings.ollama_base_url}/v1")
            model = OpenAIChatModel(self.settings.ollama_model, provider=provider)
            self._ollama_agents[key] = Agent(
                model,
                system_prompt=system_prompt or "You are a helpful AI assistant on a starship bridge.",
            )
        return self._ollama_agents[key]

    def get_provider(self, provider_name: Optional[str] = None):
        """
        Get the underlying provider object for a given provider name.
        Returns a PydanticAI Agent for "ollama", or the mock provider for "mock".
        """
        provider_name = (provider_name or self.settings.default_llm_provider).lower()

        if provider_name == "ollama":
            return self._get_ollama_agent(None)

        # Everything else (mock, and any unconfigured/unknown provider) uses mock.
        return self._create_mock_provider()

    def _create_mock_provider(self) -> FakeListLLM:
        """Create (or reuse) an intelligent mock provider for testing."""
        if self._mock_provider is None:
            self._mock_provider = FakeListLLM(responses=[
                "Aye Captain, I've analyzed the situation and recommend we proceed with strategic planning. My tactical systems show optimal mission parameters.",
                "Science Officer reporting: I've conducted a thorough analysis of the data. The patterns suggest we should examine the temporal fluctuations more closely.",
                "Operations here - I've optimized our workflow efficiency by 23%. All systems are running at peak performance and ready for the next task.",
                "Command acknowledged. I've reviewed our mission objectives and recommend prioritizing the high-impact items first. Setting course for maximum productivity.",
                "Fascinating. The data indicates several interesting correlations. I recommend we gather additional research before proceeding with implementation.",
                "All stations report ready, Captain. I've coordinated the task execution pipeline and we're operating at optimal efficiency levels.",
                "Strategic analysis complete. Based on current mission parameters, I suggest we focus on the critical path items to ensure success.",
                "Research protocols initiated. I'm detecting some anomalous patterns in the data that warrant further investigation using our analysis tools.",
                "Workflow optimization engaged. I've streamlined the process and eliminated three bottlenecks. Ready to execute on your command.",
                "Mission status: All systems nominal. I've prepared the tactical briefing and await your orders to proceed with the operation."
            ])
        return self._mock_provider

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider_name: Optional[str] = None,
        agent_id: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate a response from the LLM with automatic fallback to mock.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt (selects/creates the persona's PydanticAI Agent)
            provider_name: Specific provider to use
            agent_id: Optional agent id, used to broadcast `agent_activity` WS events

        Returns:
            str: Generated response
        """
        provider_name = (provider_name or self.settings.default_llm_provider).lower()

        try:
            response = await self._try_generate_response(prompt, system_prompt, provider_name, agent_id)
            if response and not response.startswith("I apologize"):
                return response
        except Exception as e:
            logger.warning(f"Primary provider {provider_name} failed: {e}")

        # Fall back to mock if the primary provider errors or produces nothing usable.
        if provider_name != "mock":
            try:
                logger.info("Trying fallback provider: mock")
                return await self._try_generate_response(prompt, system_prompt, "mock", agent_id)
            except Exception as e:
                logger.warning(f"Fallback provider mock failed: {e}")

        return "I apologize, but I'm currently unable to process your request. Please try again later."

    async def _try_generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider_name: str = "mock",
        agent_id: Optional[str] = None,
    ) -> str:
        """Try to generate a response from a specific provider."""
        if provider_name == "ollama":
            agent = self._get_ollama_agent(system_prompt)
            await self._broadcast_activity(agent_id, "thinking")
            try:
                result = await agent.run(prompt)
            finally:
                # Always clear "thinking" even on failure, so the UI doesn't get stuck.
                await self._broadcast_activity(agent_id, "responding")
            return result.output

        # mock (and any other/unsupported provider name) falls through to mock.
        mock = self._create_mock_provider()
        return await mock.ainvoke(prompt)

    async def is_provider_available(self, provider_name: str) -> bool:
        """Check if a provider is available and configured."""
        try:
            if provider_name == "ollama":
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(f"{self.settings.ollama_base_url}/api/tags")
                    if response.status_code != 200:
                        logger.warning(f"Ollama server not responding: {response.status_code}")
                        return False

                    models = response.json().get("models", [])
                    model_names = [model.get("name", "").split(":")[0] for model in models]
                    available = self.settings.ollama_model.split(":")[0] in model_names

                    if not available:
                        logger.warning(f"Ollama model '{self.settings.ollama_model}' not found. Available: {model_names}")
                        logger.info(f"To install: ollama pull {self.settings.ollama_model}")

                    return available

            elif provider_name == "openai":
                return bool(self.settings.openai_api_key)

            elif provider_name == "anthropic":
                return bool(self.settings.anthropic_api_key)

            elif provider_name == "mock":
                return True

            else:
                return False

        except Exception as e:
            logger.debug(f"Provider {provider_name} availability check failed: {e}")
            return False

    def list_available_providers(self) -> List[str]:
        """List all available provider names."""
        return ["openai", "anthropic", "ollama", "mock"]

    def get_provider_info(self, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a provider."""
        provider_name = provider_name or self.settings.default_llm_provider

        provider_info = {
            "name": provider_name,
            "configured": False,
            "available": False,
        }

        if provider_name == "openai":
            provider_info["configured"] = bool(self.settings.openai_api_key)
            provider_info["model"] = self.settings.default_llm_model
        elif provider_name == "anthropic":
            provider_info["configured"] = bool(self.settings.anthropic_api_key)
            provider_info["model"] = self.settings.default_llm_model.replace("gpt-", "claude-")
        elif provider_name == "ollama":
            provider_info["configured"] = True  # Ollama doesn't need API keys
            provider_info["model"] = self.settings.ollama_model
            provider_info["base_url"] = self.settings.ollama_base_url
        elif provider_name == "mock":
            provider_info["configured"] = True
            provider_info["model"] = "mock-model"

        return provider_info
