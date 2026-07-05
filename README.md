# Agentopia

**AI Spaceship Bridge - Executive Functioning Assistant**

Agentopia is an AI-powered executive functioning tool that embodies AI agents as a virtual starship crew, creating an engaging, gamified productivity environment specifically designed for ADHD-friendly workflows. The spaceship bridge metaphor provides narrative cohesion while agents manage real-world tasks through MCP integrations.

## Vision

A collaborative AI system that makes abstract productivity concepts concrete and engaging through:

- **Spaceship Bridge Interface** - Visual, intuitive command center for productivity
- **Embodied AI Agents** - Specialized crew members with distinct personalities  
- **Real-World Integration** - Direct connection to your digital life via MCP
- **ADHD-Friendly Design** - Visual feedback, gamification, and adaptive pacing

## Core Features

### 🚀 Spaceship Bridge Interface
- Real-time agent visualization and status monitoring
- Interactive station-based workflow management
- WebSocket-powered live updates and agent communication
- Debug mode with agent trails and performance metrics

### 🤖 Configuration-Driven Agents
- **Commander** (red_agent) - Strategic planning and mission coordination
- **Science Officer** (blue_agent) - Research, analysis, and data processing
- **Operations Officer** (yellow_agent) - Task execution and workflow optimization
- JSON-configurable personalities, capabilities, and behaviors

### 💬 LLM Integration
- Real-time chat with individual agents
- Personality-driven responses based on agent roles
- Mock responses for development (OpenAI integration ready)
- WebSocket broadcasting of agent thoughts and responses

### 🔗 MCP Connectivity (Planned)
- Calendar integration (Google Calendar, Outlook)
- Task management (Todoist, Notion, Apple Reminders)
- File systems (Google Drive, local files)
- Communication platforms (Email, Slack)

## Technology Stack

- **Backend**: FastAPI with async support, WebSocket communication
- **Frontend**: React with TypeScript, real-time WebSocket client
- **Database**: SQLite with aiosqlite for async operations
- **LLM**: OpenAI API (with mock fallback for development)
- **Development**: Docker Compose with hot reload
- **Testing**: Playwright with BDD scenarios

## Getting Started

### Quick Start with Docker (Recommended)

1. **Clone and setup**:
```bash
git clone https://github.com/your-username/agentopia.git
cd agentopia
```

2. **Start development environment**:
```bash
./dev.sh start
```

This will start both backend (port 8000) and frontend (port 3000) with hot reload.

### Development Commands

```bash
./dev.sh start      # Start all services
./dev.sh backend    # Backend only
./dev.sh frontend   # Frontend only
./dev.sh stop       # Stop all services
./dev.sh logs       # View logs
./dev.sh shell      # Open shell in container
```

### Manual Setup (Alternative)

1. **Python environment**:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Start backend**:
```bash
cd backend
python main.py
```

3. **Start frontend** (new terminal):
```bash
cd frontend/spaceship-bridge
npm install
npm start
```

## Project Structure

```
agentopia/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry
│   ├── services/           # Business logic services
│   │   ├── agent_manager.py    # Agent lifecycle management
│   │   ├── llm_client.py       # LLM integration
│   │   ├── config_service.py   # Configuration management
│   │   └── websocket_manager.py # Real-time communication
│   └── models/             # Data models
├── frontend/spaceship-bridge/  # React frontend
├── config/                 # Agent configurations
│   └── agents.json         # Agent personalities and roles
├── characters/             # Legacy agent definitions
├── e2e/                    # Playwright tests
├── docker-compose.yml      # Development environment
└── dev.sh                  # Development helper script
```

## Configuration

Agent personalities and capabilities are defined in `config/agents.json`:

```json
{
  "red_agent": {
    "name": "Commander Data",
    "role": "commander",
    "system_prompt": "You are the Commander...",
    "personality": {
      "communication_style": "formal",
      "specialization_focus": ["strategy", "leadership"]
    }
  }
}
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/bridge/state` - Current bridge status
- `GET /api/agents` - List all agents
- `POST /api/agents/{agent_id}/chat` - Chat with agent
- `GET /api/config/agents` - Get agent configurations
- `POST /api/config/reload` - Reload configurations
- `WS /ws` - WebSocket for real-time updates

## Testing

⚠️ **IMPORTANT**: This project uses Docker Compose for ALL testing. Do not run tests directly in local environments.

```bash
# Recommended: Fast Docker-orchestrated smoke tests
npm run docker:smoke

# Full test suites
npm run docker:test       # Full Docker test suite with complete rebuild
npm run test:e2e          # Run Playwright E2E tests (requires Docker services)
npm run test:e2e:headed   # Run with browser visible
npm run test:mcp          # Run full test suite with MCP integration

# Test management
npm run docker:test:clean # Clean up Docker test containers
./dev.sh logs backend     # View backend logs

# Available but not recommended for regular use
npm test                  # Fallback basic health tests (use Docker commands instead)
```

### Common Command Errors to Avoid

❌ **These commands do NOT exist and will fail:**
- `npm run lint` 
- `npm run typecheck`
- `npm run build`
- `npm run dev`

✅ **Use these Docker-orchestrated commands instead:**
- `npm run docker:smoke` (testing)
- `npm run dev:full` (development with MCP)
- `./dev.sh start` (development)

## Architecture

See [docs/architecture/SYSTEM_DIAGRAM.md](docs/architecture/SYSTEM_DIAGRAM.md) for the living system diagram (current + target state), [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for detailed system architecture, and [docs/planning/SIMPLE_PLAN.md](docs/planning/SIMPLE_PLAN.md) for the current development roadmap. Architectural changes are proposed and tracked as [OpenSpec](openspec/) changes.

## Contributing

We welcome contributions! See [docs/development/CONTRIBUTING.md](docs/development/CONTRIBUTING.md) for detailed guidelines.

The project uses:
- Conventional commits (`feat:`, `fix:`, `docs:`)
- Docker for consistent development environment
- Configuration-driven design for easy customization
- BDD testing with Playwright
- Narrative-driven, ADHD-friendly design patterns

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.