# Agentopia Development Guide

AI agent development platform with longitudinal task performance optimization.

See @README.md for project overview and @package.json for available npm commands.

## Current Architecture
- **Ship Operations Interface**: Three-tab system (Ship View, Roster, Game Mechanics)
- **Bridge Operations**: Real-time ship status, crew positioning, system monitoring
- **Character-Driven Roster**: Personnel profiles with operational context
- **MCP Integration**: Props represent tool capabilities with character associations

## Context Management Strategy

## Key Context
- @docs/index.md - Documentation navigation
- @docs/architecture/ - System design and technical decisions  
- @docs/mcp/ - MCP integration guides and setup
- @backend/BACKLOG.md - Backend development priorities
- @frontend/BACKLOG.md - Frontend development priorities

## Development Patterns
- Docker-first architecture: All dev/test commands use containers
- MCP integration: Agents connect to real-world data via MCP servers
- Conventional commits: Use `feat:`, `fix:`, `docs:`, `refactor:`
- Branch naming: Use descriptive names encoding task context

## Commands

### Testing (Docker-Orchestrated)
⚠️ **IMPORTANT**: This project uses Docker Compose for ALL testing. Do not run tests directly in local environments.

- `npm run docker:smoke` - **RECOMMENDED**: Fast Docker-orchestrated smoke tests with health checks
- `npm run docker:test` - Full Docker test suite with complete rebuild
- `npm run test:e2e` - Run Playwright E2E tests (requires Docker services running)
- `npm run docker:test:clean` - Clean up Docker test containers
- `npm test` - Fallback basic health tests (use Docker commands instead)

### Development
⚠️ **IMPORTANT**: This project uses Docker Compose for development. Traditional `npm run dev`, `npm run build`, `npm run lint`, and `npm run typecheck` commands are NOT available.

- `npm run dev:full` - Start development server + MCP servers (Docker-orchestrated)
- `./dev.sh start` - Start all development services (see README.md)
- `./dev.sh backend` - Backend only development mode
- `./dev.sh frontend` - Frontend only development mode
- `./dev.sh stop` - Stop all development services

**Code Quality**: This project does not have traditional lint/typecheck npm scripts. Code quality is managed through:
- Docker-orchestrated testing (`npm run docker:smoke`, `npm run docker:test`)
- Frontend-specific linting within the React development container
- Backend Python linting through the FastAPI development container

### MCP Server Management (Docker-Orchestrated)
🐳 **MCP servers run as isolated Docker containers for consistency and security**

- `npm run mcp:start` - Start all MCP server containers
- `npm run mcp:stop` - Stop all MCP server containers
- `npm run mcp:status` - Show status of all MCP servers
- `npm run mcp:logs` - Show logs from MCP servers
- `npm run mcp:scale` - Start only essential MCP servers
- `npm run mcp:build` - Build MCP server Docker images
- `npm run mcp:test` - Test MCP server connectivity
- `npm run test:mcp` - Run full test suite with MCP integration

### Git Workflow
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Include context in commit messages
- Tag significant milestones


## Project Structure
- `/frontend/spaceship-bridge/` - React/TypeScript ship operations interface
  - `/src/types/character.ts` - Core character, scene, prop interfaces
  - `/src/components/CharacterCard.tsx` - Individual character representation
  - `/src/components/SceneView.tsx` - Environmental character context
  - `/src/components/CharacterShowcase.tsx` - Roster interface
  - `/src/agents/` - Game mechanics system (LCARS themes, strategies)
- `/backend` - Python FastAPI backend with ship/crew management
- `/e2e` - Playwright test suites and BDD features
- `/docs` - Project documentation (organized by topic)
  - `/architecture` - System design and technical decisions
  - `/mcp` - MCP integration guides and setup
  - `/development` - Setup guides and workflows
  - `/planning` - Roadmaps and project status
- `/mcp-servers/` - Custom MCP server implementations
- `/scripts/` - Orchestration and utility scripts
- `docker-compose.test.yml` - Docker orchestration for testing
- `docker-compose.mcp.yml` - Docker orchestration for MCP servers
- `playwright-*.config.ts` - Playwright configurations for different test types
- `ROADMAP.md` - Development progression and baselines
- `playwright-report/` - E2E test reports

## Testing Infrastructure (Docker-First)
🐳 **All testing is containerized for consistency and isolation**

- **Docker Compose**: Primary orchestration for backend + test containers with health checks
- **Containerized Testing**: Ensures identical environments across development and CI
- **Smoke Tests**: Simple curl-based health verification (fast, reliable)
- **BDD Tests**: Playwright + Gherkin for behavior-driven testing in containers
- **Health Checks**: Automated service dependency management
- **No Local Testing**: Avoid `pytest`, `python -m pytest` - use Docker commands instead

## Context Window Optimization
- Working memory: ~30-40% current code context
- Retrieved plans: ~20-30% implementation patterns
- Conversation history: ~20-30% task tracking
- Buffer: ~10-20% tool outputs

## Session Continuity
- Use git log/diff to reconstruct session state
- Maintain dependency tracking between changes
- Strategic rollback points for safe restoration

### Available Baselines (git commits)
- **312d016**: Complex pane-based system (full-featured, overwhelming UX)
- **f6d7f50**: Simplified character-driven system (story-focused)

### Key Development Insights
- **Complexity Trap**: Initial pane system was technically impressive but overwhelming
- **Ship Operations Focus**: Three-tab interface provides clear operational structure
- **Character Integration**: Roster provides personnel context within ship operations
- **System Demonstration**: Game Mechanics tab showcases technical capabilities