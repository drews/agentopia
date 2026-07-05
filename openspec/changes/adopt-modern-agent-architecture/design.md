# Design: Adopt Modern Agent Architecture

## Context

Agentopia is a local-first, ADHD executive-function copilot styled as a spaceship bridge: 3–6 persistent persona agents (Ollama-backed), FastAPI + WebSocket backend, React frontend with spatial agent movement. The project has a documented history of over-engineering followed by forced simplification (PERSONAL_LOG entries 2, 4, 5, 7) — any adopted architecture must minimize imposed structure.

Decision inputs: four-agent research sweep (2026-07-04) covering the agent-framework landscape, MCP ecosystem, local-model tool-calling reliability, and spatial-frontend stacks. Key findings summarized here; the goal state is user answers from the soft-launch interview: **real executive-function copilot · local model brains · calm crew with scheduled rituals**.

## Goals / Non-Goals

**Goals**
- Real tool use (calendar, reminders, tasks, files) via MCP with local models
- Reliable tool calls from 3–8B models (validate/retry, not hope)
- Smooth 60fps spatial bridge on a maintained build toolchain
- Preserve the homegrown orchestrator (personas, ambient loops, rituals) — it is the product's differentiator and no framework provides it

**Non-Goals**
- Durable/checkpointed workflow engine (revisit only if rituals need crash-resume)
- Cloud LLM dependency; multi-user; gamification systems

## Decisions

### D1: PydanticAI as per-agent runtime (not LangGraph, CrewAI, AG2, smolagents, or raw MCP SDK)

- **PydanticAI**: lightest footprint, native Ollama, built-in MCP client, and a validator-driven tool loop that auto-retries malformed output — precisely the small-model failure mode. Agent-centric, imposes no session/orchestration model, so `agent_manager` keeps owning personas and loops.
- **LangGraph**: best persistence/checkpointing, but heavy; graph model is overkill for persona chat; state-management cost with 6 always-on loops. Escape hatch: PydanticAI agents can drop into LangGraph nodes later if rituals need durable resume.
- **CrewAI / AG2**: kickoff→finish task pipelines, structural mismatch with persistent ambient agents. Original AutoGen in maintenance mode since Feb 2026.
- **Claude Agent SDK**: deepest MCP but provider-native to Claude; fights the local-first constraint.
- **No framework (raw MCP python-sdk)**: viable, but re-hand-rolls the tool-call/JSON-schema/retry plumbing PydanticAI already solved — unpaid work in the least fun place.

### D2: FastMCP 2.x client aggregating stdio servers

Single long-lived client in FastAPI lifespan; multi-server config dict; auto-namespaced tools (`calendar_list_events`, `todoist_add_task`). Ollama does not speak MCP — the backend is the bridge, translating MCP tool schemas → OpenAI-format tools for Ollama. Pin against the pre-2026-07-28-spec line if v2 churn hits.

First servers (all local/stdio, no cloud OAuth):
1. Apple EventKit server (calendar + reminders; filter its tool list to ~6)
2. `@modelcontextprotocol/server-filesystem` (scoped to a vault dir)
3. Todoist MCP server (optional; only if user actually uses Todoist)

Google Calendar/Gmail deferred to a follow-up change (OAuth flow).

### D3: Two-tier router for tool-calling reliability

2026 consensus: 7B is borderline, 14B+ is the floor for reliable multi-tool MCP. Mitigation on 8B-class hardware:
- **Planner** (largest model that fits — e.g. `qwen3:8b`, thinking allowed here) decomposes user intent into single-tool steps
- **Executors** (fast small model — `llama3.2`) each make one flat tool call
- Flat schemas only; ≤10 tools exposed; structured decoding via Ollama structured outputs; schema-validate args; on failure re-prompt with the error, max 2 retries
- Persona voice is applied at the response-rendering step, so persona prompts never compete with tool instructions

### D4: Vite + PixiJS v8 + zustand + snapshot interpolation

- **Vite** replaces deprecated CRA (local-first SPA, no SSR — frameworks rejected as dead weight). Matches the devx experiment's direction.
- **PixiJS v8 + @pixi/react** renders the stage: ~10 sprites, WebGL batching, ticker-driven personality animations. Konva is the documented lower-effort fallback; r3f/Phaser rejected (3D overkill / awkward embedding).
- **zustand** store fed by WebSocket using transient subscriptions — Pixi's ticker reads positions directly, React never re-renders on movement ticks.
- **Snapshot interpolation** (à la `@geckos.io/snapshot-interpolation`): buffer 2–3 server snapshots, render ~150ms in the past, lerp per frame. This is what turns 1Hz ticks into smooth motion.
- Chat/dashboard UI stays plain React DOM layered over the canvas.
- Reference implementation to steal from: a16z ai-town (MIT; PixiJS agent town with Ollama support).

## Risks / Trade-offs

- **PydanticAI lacks built-in persistence** → we already own SQLite persistence; acceptable.
- **EventKit MCP servers are community-maintained** → wrap behind our tool registry so a server swap is config, not code.
- **8B planner is still fallible** → rituals (morning briefing) are deterministic scheduled prompts, not open-ended agency; the router only faces bounded intents.
- **Two migrations at once (backend runtime + frontend build)** → sequenced in tasks.md; frontend migration is independent and can trail.

## Migration Plan

Backend first (value), frontend second (polish): cut `llm_service` over to PydanticAI behind the existing `DEFAULT_LLM_PROVIDER` config, keep the mock provider for tests; land MCP client + one server; then CRA→Vite as a standalone commit; then Pixi stage behind the existing view tabs. Rollback: each phase is a single revertable commit; LangChain deps removed only after PydanticAI path has run the "Plan my day" flow against real calendar data.

## Open Questions

- Which Apple EventKit server: all-in-one (83 tools, filter hard) vs minimal PyObjC (hackable, fewer tools)? Decide at implementation by trying the minimal one first.
- Todoist vs Apple Reminders as the canonical task store — needs a user answer during implementation.
