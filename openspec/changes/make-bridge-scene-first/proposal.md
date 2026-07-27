# Make the Bridge Scene-First

## Why

User verdict on the current UI (2026-07-27): too many screens, not enough ambient motion representing the crew's actual activity, production metaphors too heavy-handed (fabricated fleet metrics, mock missions). A five-tab interface fragments attention — the opposite of the project's ADHD executive-function mission. The bridge should feel like a *place you glance at*, not an app you navigate.

## What Changes

1. **Scene is the only screen.** The PixiJS stage becomes the root, always-on viewport: a pixel-art ship interior (ai-town style — tiled rooms, spritesheet characters) where the crew visibly lives. The five-tab LCARS nav is removed.
2. **Ambient activity choreography.** Real backend events drive the scene: movement intents → walking (interpolated), chat/LLM activity → speech/thought glyphs, MCP tool calls → the relevant station pulses, idle → idle cycles. The crew's busyness is *seen*, not charted.
3. **Overlays, summoned rarely.** In-scene interactions open dismissable overlays over the live (dimmed) scene, Esc returns: **agent dossier** (click an agent: persona, activity, chat), **ops console** (click a console: real WS/MCP/LLM status + activity log — merges old BRIDGE/ACCESS), **showcase** (kept, reachable via a dev affordance), and an **attention HUD** — a small persistent now/next ribbon plus a "what was I doing" breadcrumb, the ADHD scaffolding the metaphor exists to serve.
4. **Purge fabricated data now.** All mock metrics (crew efficiency %, fake missions, invented ETAs) deleted. Overlays show only real signals, however sparse today.
5. **Retire the THEATER route** (code stays in history).

## Impact

- Affected specs: `bridge-frontend` (heavily modified), `agent-runtime` (adds activity-event broadcasting the choreography needs)
- Affected code: `frontend/spaceship-bridge/src/App.tsx` (shell inversion), `BridgeStage.tsx` (grows into the scene), CommanderDashboard/AccessView/ManifestView (mined for overlay content, then removed), `backend/services/websocket_manager.py` + agent_manager (activity events)
- Supersedes tasks 3.3–3.5 of `adopt-modern-agent-architecture` (that change's backend work is unaffected and continues)
- Not in scope: gamification, new agent behaviors, mobile layout
