# Frontend Brief - Agentopia

## Project Overview
React-based spaceship bridge interface for AI agent management and visualization.

## Tech Stack
- **Framework**: React 19.1.0 with TypeScript 4.9.5
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Testing**: Jest + React Testing Library + Playwright E2E
- **Styling**: CSS3 with CSS Custom Properties (CSS Variables)
- **Communication**: WebSocket + REST API

## Architecture

### Core Component: Spaceship Bridge (`/frontend/spaceship-bridge/`)
Single-page application displaying real-time agent positions and station status.

#### Key Interfaces
```typescript
interface Agent {
  id: string;
  name: string;
  position: Position;
  status: string;
  avatar: string;
}

interface Station {
  id: string;
  name: string;
  position: Position;
  dimensions: Dimensions;
  icon: string;
  color: string;
}

interface BridgeState {
  bridge_id: string;
  status: string;
  agents: Agent[];
  stations: Station[];
  layout: { width: number; height: number; };
}
```

#### Component Structure
- **App.tsx**: Main bridge component with WebSocket integration
- **App.css**: Sci-fi themed styling with animations
- **Grid Layout**: CSS Grid for positioning agents and stations

## Backend Integration
- **REST API**: `GET /api/bridge/state` (localhost:8000)
- **WebSocket**: `ws://localhost:8000/ws` for real-time updates
- **Message Types**: `initial_state` for bridge state updates

## Styling Theme
- **Color Scheme**: Dark theme with terminal green (`#00ff00`)
- **Typography**: Courier New monospace font
- **Animations**: Pulse, thinking, working, moving states for agents
- **Layout**: Responsive grid with sidebar panels

## Development Commands
```bash
# Frontend development
cd frontend/spaceship-bridge
npm start                    # Development server
npm run build               # Production build
npm test                    # Unit tests

# E2E testing (from root)
npm run test:e2e            # Full E2E suite
npm run test:health         # Simple health check
```

## Key Features
- Real-time agent position tracking
- Station status monitoring
- WebSocket connection status
- Responsive grid layout
- Animated agent states (active, thinking, working, moving)
- Sidebar panels for crew and system status

## File Structure
```
frontend/spaceship-bridge/
├── src/
│   ├── App.tsx             # Main component
│   ├── App.css             # Styling
│   ├── index.tsx           # Entry point
│   └── ...
├── public/                 # Static assets
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Testing Strategy
- **Unit Tests**: React Testing Library for component testing
- **E2E Tests**: Playwright with BDD (Gherkin) feature files
- **Test Reports**: Generated in `/playwright-report/`
- **Screenshots**: Captured in `/e2e/screenshots/`