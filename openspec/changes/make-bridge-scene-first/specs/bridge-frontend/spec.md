# bridge-frontend Spec Delta

## ADDED Requirements

### Requirement: The scene is the primary and only persistent view

The application SHALL boot directly into a full-viewport pixel-art ship scene rendered on the PixiJS stage, with no tab or route navigation. All other interfaces SHALL be overlays summoned from within the scene and dismissed back to it.

#### Scenario: Boot lands in the scene

- **WHEN** the app loads
- **THEN** the ship scene fills the viewport with agents visible, and no tab bar or navigation chrome is present

#### Scenario: Overlays always return to the scene

- **WHEN** any overlay (dossier, ops console, showcase) is open and the user presses Esc or clicks the scene
- **THEN** the overlay closes and the live scene — which kept animating while dimmed — is restored

### Requirement: Ambient motion reflects real agent activity

The scene SHALL visually express actual backend activity: interpolated walking for movement intents, a thinking glyph while an agent's LLM call is in flight, a fading speech bubble on reply, and a pulse on the owning station's console when an MCP tool is called (with a distinct failure indication).

#### Scenario: Chat is visible as scene activity

- **WHEN** a user sends a chat message to an agent
- **THEN** that agent shows a thinking glyph until the reply arrives, then a speech bubble excerpt that fades

#### Scenario: Tool calls animate their station

- **WHEN** an MCP tool executes (e.g. an eventkit_* tool)
- **THEN** the console mapped to that tool's server pulses, and a failed call shows the failure indication instead

### Requirement: In-scene interaction summons contextual overlays

Clicking an agent SHALL open that agent's dossier (persona, live activity, chat); clicking a console SHALL open the ops overlay showing only real system signals (WebSocket state, MCP server status and tools, recent activity log).

#### Scenario: Agent dossier

- **WHEN** the user clicks an agent sprite
- **THEN** a dossier overlay opens for that agent and a chat round-trip works from within it

#### Scenario: Ops console truthfulness

- **WHEN** the ops overlay is open
- **THEN** every displayed value traces to a live source and matches /api/mcp/status and connection state

### Requirement: No fabricated data anywhere

The UI SHALL NOT render invented metrics, mock missions, or fabricated progress values. A datum renders only if it traces to a real source; absent data renders as absence.

#### Scenario: Sparse but honest

- **WHEN** no real data exists for a tile or region (e.g. EventKit host server down)
- **THEN** the region is hidden or shows an explicit unavailable state, never a placeholder number

### Requirement: Attention HUD provides ADHD scaffolding

A persistent slim ribbon SHALL show the user's current focus (Now), the next real upcoming calendar item when available (Next), and a breadcrumb of the last interaction with its age, with one-click summon of the responsible agent's dossier.

#### Scenario: Externalized working memory

- **WHEN** the user returns to the bridge after time away
- **THEN** the ribbon shows what they were last doing and how long ago, and one click reaches the agent that handled it

#### Scenario: Next degrades gracefully

- **WHEN** the EventKit host server is not running
- **THEN** the Next slot is hidden or marked unavailable rather than showing stale or invented content


### Requirement: First boarding offers character creation

On first run (no saved player profile), the app SHALL present a character creation overlay — callsign, avatar customization, and a small set of executive-function preference prompts — before entering the scene. The resulting profile SHALL persist, be reflected in the player avatar and greetings, and be editable later from the player's dossier.

#### Scenario: New captain creates their character

- **WHEN** the app runs with no saved player profile
- **THEN** the creation overlay appears first, and completing it lands in the scene with the chosen avatar and a greeting by callsign

#### Scenario: Returning captain skips creation

- **WHEN** a saved profile exists
- **THEN** the app boots directly into the scene with the saved avatar, and creation is reachable only by choice via the player dossier

## REMOVED Requirements

### Requirement: Conversational UI stays in the DOM

**Reason**: Superseded — chat now lives inside the dossier overlay (still DOM, but the standalone requirement described the tabbed layout being removed).
**Migration**: Dossier overlay hosts chat as DOM above the canvas; accessibility properties preserved.
