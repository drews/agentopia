# Contributing to Agentopia

Welcome to the Agentopia development community! This guide will help you contribute effectively to our AI-powered executive functioning tool.

## Development Philosophy

Agentopia is built around **narrative-driven, self-accommodating design** with a focus on:
- **Immersive spaceship bridge metaphor** for productivity
- **ADHD-friendly cognitive scaffolding** through game mechanics
- **Docker-first development** for consistency
- **Parallel development** with minimal integration overhead

## Getting Started

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+ (for local development)
- Python 3.13+ (for local development)
- Git configured with conventional commits

### Initial Setup
```bash
git clone https://github.com/drews/agentopia.git
cd agentopia
npm install
```

### Development Workflow

⚠️ **IMPORTANT**: This project uses Docker Compose for ALL development and testing.

#### Starting Development
```bash
# Start full development environment
./dev.sh start

# Or start specific services
./dev.sh backend    # Backend only
./dev.sh frontend   # Frontend only
```

#### Running Tests
```bash
# Recommended: Fast smoke tests
npm run docker:smoke

# Full test suite
npm run docker:test

# E2E tests (requires Docker services running)
npm run test:e2e
```

#### Quality Checks
- **No traditional lint/typecheck commands** - quality is managed through Docker
- **Frontend linting**: Handled within React development container
- **Backend linting**: Handled within FastAPI development container
- **All testing**: Docker-orchestrated for consistency

## Code Organization

### Frontend (`/frontend/spaceship-bridge/`)
- **Three-tab system**: Screen (mechanics), Ship (bridge), Manifest (roster)
- **LCARS design system**: Star Trek-inspired UI components
- **Character-driven interface**: Agent personalities drive interactions
- **Real-time WebSocket**: Live updates from backend

### Backend (`/backend/`)
- **FastAPI architecture**: Async Python with WebSocket support
- **Agent management**: Role-based agent system with personalities
- **Database**: SQLite with aiosqlite for async operations
- **MCP integration**: Docker-orchestrated external tool connections

### Key Files
- `frontend/spaceship-bridge/src/types/character.ts` - Core character interfaces
- `backend/services/agent_manager.py` - Agent lifecycle management
- `backend/database.py` - Database schema and operations
- `backend/main.py` - FastAPI application and WebSocket endpoints

## Contribution Guidelines

### Commit Convention
Use conventional commits with context:
```bash
feat: add new agent personality system
fix: resolve WebSocket connection issues
docs: update MCP integration guide
refactor: consolidate character types
```

### Branch Naming
Use descriptive names that encode task context:
```bash
feature/agent-personality-system
fix/websocket-connection-stability
docs/mcp-integration-guide
```

### Code Style
- **No comments unless necessary** - code should be self-documenting
- **Follow existing patterns** - check neighboring files for conventions
- **Security first** - never commit secrets or expose sensitive data
- **ADHD-friendly** - clear, consistent, predictable interfaces

## Testing Strategy

### Docker-First Testing
All tests run in containers to ensure consistency:
```bash
npm run docker:smoke     # Health checks and basic functionality
npm run docker:test      # Full test suite with rebuild
npm run test:e2e         # Playwright BDD tests
```

### Test Types
- **Smoke tests**: curl-based health verification
- **BDD tests**: Playwright + Gherkin scenarios
- **Health checks**: Automated service dependency management

### Common Issues
- **Database errors**: Check `npm run docker:test:logs` for backend issues
- **WebSocket failures**: Verify both frontend and backend are running
- **Test timeouts**: Increase timeout or check service health

## Architecture Patterns

### MCP Integration
- **Docker-orchestrated**: All MCP servers run in containers
- **Agent capabilities**: Role-based access to MCP tools
- **Configuration-driven**: JSON files define server connections

### Character System
- **Agent personalities**: Executive Officer, Science Officer, Operations Officer
- **Station assignments**: Command, Engineering, Science stations
- **Real-time updates**: WebSocket broadcasts for agent state changes

### Bridge Metaphor
- **Three-tab navigation**: Separates concerns while maintaining narrative
- **LCARS aesthetics**: Consistent visual language
- **Ambient behavior**: Agents move and act autonomously

## Debugging and Troubleshooting

### Common Commands
```bash
# View logs
npm run docker:test:logs

# Clean containers
npm run docker:test:clean

# Restart services
./dev.sh stop && ./dev.sh start

# Check MCP status
npm run mcp:status
```

### Debug Patterns
- **Backend issues**: Check FastAPI logs in Docker container
- **Frontend issues**: Check React development server output
- **Database issues**: Verify schema migrations in logs
- **WebSocket issues**: Check connection status in browser DevTools

## Getting Help

### Documentation
- **Architecture**: `docs/architecture/ARCHITECTURE.md`
- **MCP Integration**: `docs/mcp/MCP_INTEGRATION_PLAN.md`
- **Game Mechanics**: `docs/design/GAME_MECHANICS.md`
- **Narrative Roles**: `docs/design/NARRATIVE_ROLES.md`

### Community
- **Issues**: GitHub issues for bugs and feature requests
- **Discussions**: GitHub discussions for questions and ideas
- **PRs**: Pull requests for code contributions

## Next Steps

1. Read the [Game Mechanics](../design/GAME_MECHANICS.md) to understand the user experience
2. Review [Narrative Roles](../design/NARRATIVE_ROLES.md) for character context
3. Check [MCP Integration Plan](../mcp/MCP_INTEGRATION_PLAN.md) for extending functionality
4. Start with a small contribution to get familiar with the workflow

Remember: Agentopia is designed to be accommodating and supportive. Our development process should reflect the same principles we build into the user experience.