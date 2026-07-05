# Adopt Modern Agent Architecture

## Why

The soft launch (commit 22ec122) proved the bridge works end-to-end with local Ollama brains, but the stack underneath is drifting from the project's goals:

- **Raw LangChain** (`ChatOpenAI`/`OllamaLLM` + homegrown loop) gives us no tool-calling repair loop — the exact failure mode of llama3.2-class local models. All productivity value (calendar, tasks, files) is still mock strings.
- **MCP servers are config-only stubs**; the "Plan my day" canonical flow (SIMPLE_PLAN.md) has never run against real data.
- **Create React App is deprecated** (React team, Feb 2025); the frontend renders spatial movement via DOM/CSS with no interpolation, so 1Hz server ticks look like teleporting.
- Mid-2026 research (four-agent landscape review, 2026-07-04) identified proven, lightweight replacements that respect this project's anti-over-engineering discipline (PERSONAL_LOG, every entry).

## What Changes

1. **Agent runtime**: Replace the raw LangChain LLM+tool loop with **PydanticAI** as the per-agent runtime. The homegrown `agent_manager` stays as orchestrator (personas, ambient loops, scheduling, WebSocket). No graph framework — LangGraph/CrewAI/AG2 rejected as structurally task-oriented or too heavy (see design.md).
2. **MCP tooling**: Add a **FastMCP 2.x client** in FastAPI lifespan, aggregating stdio MCP servers into one namespaced tool registry. First servers: Apple EventKit (calendar/reminders), official filesystem, Todoist. Curated flat tool surface (~10 tools max exposed to the model).
3. **Local-model reliability**: Two-tier router — a planner model decomposes intent; small executor models make single tool calls. Structured decoding (Ollama structured outputs) + schema validation + 1–2 retry self-correction loop.
4. **Frontend**: Migrate CRA → **Vite**; render the spatial bridge with **PixiJS v8 + @pixi/react**; feed agent state through a **zustand** store with **snapshot interpolation** (1Hz ticks → 60fps); chat/dashboards stay plain React DOM over the canvas. Reference architecture: a16z ai-town.

## Impact

- Affected specs: `agent-runtime` (new), `mcp-tools` (new), `bridge-frontend` (new)
- Affected code: `backend/services/llm_service.py`, `backend/services/agent_manager.py`, `backend/main.py` (lifespan), `requirements.txt`, `frontend/spaceship-bridge/**` (build tooling + stage view)
- Removed: `langchain-*` dependencies (after cutover), CRA `react-scripts`
- Not in scope: gamification/XP systems (explicitly deferred, SIMPLE_PLAN.md), Strange Loop, Google/Gmail MCP (needs OAuth flow — follow-up change), multi-user/enterprise
