# bridge-frontend Spec Delta

## ADDED Requirements

### Requirement: Frontend builds on a maintained toolchain

The frontend SHALL build and run with Vite (dev server and production build), replacing the deprecated Create React App toolchain, with existing Docker dev workflow and smoke tests passing.

#### Scenario: Dev workflow unchanged for the user

- **WHEN** the developer runs `./dev.sh start` after the migration
- **THEN** the bridge is served with hot reload and `npm run docker:smoke` passes

### Requirement: Spatial bridge view renders smoothly from server ticks

The ship view SHALL render agent avatars on a PixiJS stage, reading positions from a zustand store fed by WebSocket, using snapshot interpolation so ~1Hz server position updates produce visually smooth motion at the display refresh rate.

#### Scenario: No teleporting avatars

- **WHEN** the backend broadcasts agent positions at approximately 1Hz
- **THEN** avatars move smoothly between positions with no visible jumps or teleporting

#### Scenario: Movement does not thrash React

- **WHEN** position updates arrive over WebSocket
- **THEN** React components do not re-render per tick; the Pixi ticker reads positions via transient store subscriptions

### Requirement: Conversational UI stays in the DOM

Chat panels and status dashboards SHALL remain standard React DOM components layered above the canvas, not rendered inside WebGL.

#### Scenario: Chat overlays the stage

- **WHEN** a user opens a chat panel while the ship view is active
- **THEN** the panel renders as an accessible DOM overlay (selectable text, native scrolling) above the Pixi canvas
