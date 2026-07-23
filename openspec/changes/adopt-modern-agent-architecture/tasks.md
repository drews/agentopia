# Tasks: Adopt Modern Agent Architecture

## 1. Agent runtime cutover (backend)

- [x] 1.1 Add `pydantic-ai` to requirements; create one PydanticAI `Agent` per persona in `llm_service` (system prompt = persona prompt), Ollama provider, behind existing `DEFAULT_LLM_PROVIDER` config
- [x] 1.2 Route `agent_manager` chat + `/api/llm/test` through the PydanticAI path; keep mock provider working for tests
- [x] 1.3 Verify end-to-end: `curl /api/llm/test` and `POST /api/agents/red_agent/chat` both return real Ollama-generated text via PydanticAI (`docker compose logs` shows `POST http://host.docker.internal:11434/v1/chat/completions`)
- [x] 1.4 Remove `langchain-*` imports and requirements once 1.3 passes

## 2. MCP tool access (backend)

- [x] 2.1 Add FastMCP 2.x client to FastAPI lifespan; multi-server config in `config/agentopia.json`; namespaced tool registry with an allowlist filter (≤10 tools)
- [x] 2.2 Wire `@modelcontextprotocol/server-filesystem` (scoped dir) as the first server; agent can list/read a file on request
- [x] 2.3 Add Apple EventKit server (built minimal PyObjC one, host-side over streamable-http); registry-level calendar/reminders reads verified with real data — model-driven reads land with 2.4/2.5
- [ ] 2.4 Implement validate/retry tool-call loop: structured decoding, JSON-schema arg validation, ≤2 self-correction retries; log failure rates
- [ ] 2.5 Implement two-tier router: planner model decomposes intent → executor makes single tool calls; persona voice applied at rendering
- [ ] 2.6 Milestone: "Plan my day" — Commander reads real calendar + reminders and returns a prioritized brief (the SIMPLE_PLAN.md canonical flow)

## 3. Frontend modernization (independent; can trail backend)

- [x] 3.1 Migrate CRA → Vite (swap react-scripts, move index.html, env vars → `import.meta.env`, jest → vitest); Docker dev server + smoke tests green
- [ ] 3.2 Add zustand store fed by the existing WebSocket client (transient updates for positions)
- [ ] 3.3 Add PixiJS v8 + @pixi/react stage view behind the existing SHIP tab; sprites read positions from store in ticker
- [ ] 3.4 Add snapshot interpolation buffer (~150ms render delay, lerp per frame); verify smooth motion at 1Hz server ticks
- [ ] 3.5 Port idle/walk/emote personality animations; remove dead DOM-based movement components

## 4. Rituals (first calm-crew behavior)

- [ ] 4.1 Morning briefing: scheduled backend job runs the "Plan my day" flow at bridge-open and posts it to the bridge chat as the Commander
- [ ] 4.2 Validate ritual output stays under a bounded token budget and completes < 30s warm
