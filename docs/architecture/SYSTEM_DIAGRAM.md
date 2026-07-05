# Agentopia System Diagram

> **Living document.** Update this diagram in the same PR as any change that adds/removes a service, view, or integration. It is the shared spatial map for humans and agents — referenced from `CLAUDE.md` (agent context) and `README.md` (human context).
> Target-state decisions live in `openspec/changes/` (currently: `adopt-modern-agent-architecture`); when a change is archived, fold its boxes into the Current diagram here.

## Current system (as running)

```mermaid
flowchart LR
    subgraph Browser["Browser — React CRA (:3000)"]
        NAV["LCARS Nav (App.tsx)"]
        BRIDGE["🚀 BRIDGE<br/>CommanderDashboard"]
        CREW["👥 CREW<br/>ManifestView"]
        ACCESS["📊 ACCESS<br/>AccessView + useSystemMetrics"]
        SYSTEMS["⚙️ SYSTEMS<br/>AgentShowcase"]
        THEATER["🎭 THEATER<br/>TheaterDemo + Stage/Performer"]
        NAV --> BRIDGE & CREW & ACCESS & SYSTEMS & THEATER
        WSC["WebSocket client<br/>(reconnecting)"]
    end

    subgraph Backend["FastAPI backend (:8000, Docker)"]
        API["REST API<br/>/api/agents /api/bridge/state /api/llm/test"]
        WSM["websocket_manager<br/>broadcasts state + chat"]
        AM["agent_manager<br/>personas · ambient movement loop · monitoring"]
        LLM["llm_service (LangChain)<br/>providers: ollama* | openai | anthropic | mock"]
        SS["spaceship_service<br/>grid positions, stations"]
        CFG["config_service<br/>config/agentopia.json"]
        DB[("SQLite<br/>spaceship_bridge.db")]
        MCPC["mcp_client<br/>(configs only — no live servers)"]
        API --> AM
        WSM <--> AM
        AM --> LLM & SS & MCPC
        AM --> DB
        CFG --> AM
    end

    OLLAMA["Ollama on host (:11434)<br/>llama3.2 (default) · qwen3"]
    MCPS["MCP servers (stubs)<br/>calendar :3001 · tasks :3002<br/>files :3003 · datetime :3004"]

    WSC <-->|"ws://:8000/ws<br/>positions ~1Hz, chat, state"| WSM
    Browser -->|REST| API
    LLM -->|"OpenAI-compat API<br/>host.docker.internal"| OLLAMA
    MCPC -.->|planned| MCPS
```

`*` ollama is the default provider (`DEFAULT_LLM_PROVIDER`, docker-compose.yml).

## Target architecture (per `adopt-modern-agent-architecture` OpenSpec change)

```mermaid
flowchart LR
    subgraph Browser2["Browser — Vite SPA"]
        PIXI["PixiJS v8 stage<br/>sprites + snapshot interpolation<br/>(1Hz ticks → 60fps)"]
        DOM["React DOM overlay<br/>chat · dashboards (unchanged views)"]
        ZS["zustand store<br/>transient WS updates"]
        ZS --> PIXI
        ZS --> DOM
    end

    subgraph Backend2["FastAPI backend"]
        WSM2["websocket_manager"]
        AM2["agent_manager (kept)<br/>personas · ambient loops · rituals scheduler"]
        PAI["PydanticAI runtime<br/>one Agent per persona<br/>validate + retry tool calls"]
        ROUTER["two-tier router<br/>planner (qwen3) → executors (llama3.2)"]
        REG["FastMCP client registry<br/>namespaced, allowlisted ≤10 tools"]
        AM2 --> PAI --> ROUTER
        ROUTER --> REG
        WSM2 <--> AM2
    end

    OLLAMA2["Ollama (local)"]
    subgraph MCP2["MCP servers (stdio, local)"]
        EK["Apple EventKit<br/>calendar + reminders"]
        FS["filesystem (scoped)"]
        TD["Todoist (optional)"]
    end

    ZS <-->|WebSocket| WSM2
    PAI --> OLLAMA2
    REG --> EK & FS & TD
```

## View → component map (quick agent reference)

| Tab | Component | Data source |
|-----|-----------|-------------|
| BRIDGE | `components/CommanderDashboard.tsx` | WS bridge state |
| CREW | `components/ManifestView.tsx` | static + WS |
| ACCESS | `components/AccessView.tsx`, `MetricDetailModal.tsx` | `hooks/useSystemMetrics.ts` |
| SYSTEMS | `AgentShowcase.tsx` | local demo state |
| THEATER | `TheaterDemo.tsx` + `components/Stage/Performer/Character` | local demo state |

Orphaned but improved (worldbuilding merge): `components/CharacterShowcase.tsx` — no tab renders it; candidate to fold into CREW or delete.
