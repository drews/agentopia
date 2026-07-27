# Design: Make the Bridge Scene-First

## Context

The July 2026 arc gave the bridge real crew brains (PydanticAI + Ollama), real tools (FastMCP registry, EventKit calendar), a Vite build, a zustand WS store, and a WIP Pixi stage behind a toggle. The UI, however, still presents as five dashboard tabs full of fabricated numbers. User direction: the main viewport is always a *scene*; interfaces are summoned rarely; ambient motion should represent actual agent activity; drop the heavy-handed production metaphors. User answers (2026-07-27 interview): pixel-art interior · dossier/ops/showcase/attention-HUD overlays · purge fake data now.

## Goals / Non-Goals

**Goals:** one always-on scene; activity you can read at a glance without reading; overlays as brief, dismissable excursions; only truthful signals; ADHD attention scaffolding as a first-class scene element.
**Non-Goals:** new agent capabilities; multiplayer/spectator; mobile; pixel-perfect art (legible beats beautiful).

## Decisions

### D1: Scene composition — rooms are stations, stations are tool surfaces
One ship interior tilemap with 4–6 rooms mapped to the existing backend station grid (command, science, ops, plus a "vault" for filesystem and a comms nook for calendar). Each room owns a console sprite; MCP tool namespaces map to consoles (`eventkit_*` → comms console, `filesystem_*` → vault). The existing backend grid coordinates keep working — the tilemap is a skin over the same coordinate space, so no backend movement changes are required.

### D2: Assets — adapt ai-town's MIT-licensed spritesheets
Pixel-art characters with 4-direction walk cycles + idle frames, recolored per agent (red/blue/yellow). Tileset: a small starship interior set (adapted or minimal custom). Assets live in `frontend/spaceship-bridge/public/assets/`. Fallback if adaptation stalls: colored-circle sprites with the same animation hooks — choreography code is asset-agnostic.

### D3: Activity choreography — a WS activity-event vocabulary
Backend broadcasts small typed events; the scene maps them to animations:

| event | payload | scene response |
|---|---|---|
| `agent_movement_intent` (exists) | target, hint | pathed walk (interpolated per adopt-modern 3.4) |
| `agent_activity` (new) | `thinking\|responding\|idle` | thought glyph / speech glyph / idle cycle |
| `tool_activity` (new) | tool name, server, ok/fail | owning console pulses (glow; red blink on fail) |
| `chat_message` (exists) | agent, text | speech bubble excerpt, fades; full text in dossier |

Backend emission points: PydanticAI call start/finish in llm_service (agent_activity), registry `call_tool` (tool_activity). Both are two-line hooks into the existing websocket_manager broadcast path.

### D4: Overlay architecture — one modal layer over a live scene
A single React overlay host above the canvas; scene keeps ticking, dimmed 40%. Esc or scene-click closes. Content components are *mined* from the tab views then the tab shells are deleted: dossier ← ManifestView cards + chat; ops console ← AccessView's real tiles (WS, MCP servers, agent states) + a real activity log (ring buffer of the D3 events); showcase ← AgentShowcase behind a small dev affordance (long-press on the ship's name plate). No router — overlay state is one zustand field.

### D5: Attention HUD — diegetic, tiny, always-on
A slim ribbon docked bottom: **Now** (current focus, user-set or inferred from last command), **Next** (top upcoming item — wired to real calendar via `eventkit_list_upcoming_events` when the host server is up, else hidden), and a **breadcrumb** ("last: asked Commander to plan day · 4m ago"). One-click summon of the dossier of the agent handling your last request. This is the ADHD scaffolding: externalized working memory, zero navigation. Styled as part of the ship (a status strip), not a floating app widget.

### D6: Truthful-data rule
Delete fabricated metrics with the tab shells. Rule going forward: a number renders only if it traces to a real source (WS state, registry status, actual events, actual calendar). Empty is acceptable; fake is not. This encodes the user's "purge now" decision as a standing constraint.

## Risks / Trade-offs

- **Asset pipeline is new territory** → D2 fallback keeps choreography unblocked; art can iterate.
- **Losing dashboard glanceability** → the ops overlay is one click away; the attention HUD carries the two numbers that matter.
- **Backend event hooks touch llm_service mid-flight with 2.4/2.5 work** → events are additive broadcast calls; coordinate so the router lane lands its hooks with the same vocabulary.
- **Scene-first with sparse real activity may feel empty initially** → idle life (wandering, station visits) already exists via ambient movement; more real activity arrives with 2.6/rituals.

## Migration Plan

Phase order in tasks.md: shell inversion + purge first (immediate visible win, deletes the most code), then choreography events, then art, then overlays, then HUD. Each phase is a revertable commit; the old tab UI survives in git history only.

## Open Questions

- Idle behavior richness (wander frequency, station dwell) — tune by feel once visible.
- Whether the showcase dev affordance is worth keeping long-term — decide at implementation.
