# Claude Code Context Management

## Project Overview
Agentopia - AI agent development platform with longitudinal task performance optimization

## Context Management Strategy

### MCP-Mediated Resources
- **Implementation Plans**: Store detailed specs, architecture decisions in external documents
- **Code Patterns**: Maintain project-specific style guides and architectural decisions
- **Historical Context**: Keep logs of implementations, decisions, and lessons learned
- **Test Cases**: Externalize expected behaviors and acceptance criteria

### Development Workflow
- **Incremental Commits**: Small, focused commits preserving implementation reasoning
- **Feature Flags**: Manage incremental implementation across sessions
- **Branch Naming**: Use descriptive names encoding task context
- **PR Templates**: Capture implementation approach, testing strategy, context

### Source Control as Context Store
- **Issue Tracking**: Link commits to issues for broader context retrieval
- **Strategic Comments**: Explain "why" for future context loading
- **Documentation as Code**: Version-controlled architecture decisions
- **State Checkpoints**: Commit WIP with clear context markers

## Commands

### Testing
- `npm test` - Run basic health tests
- `npm run docker:smoke` - Run Docker-orchestrated smoke tests (recommended)
- `npm run docker:test` - Run full Docker test suite with rebuild
- `npm run test:e2e` - Run Playwright E2E tests (requires services running)
- `npm run docker:test:clean` - Clean up Docker test containers

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run typecheck` - Run TypeScript type checking

### Git Workflow
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Include context in commit messages
- Tag significant milestones

## Current MCP Servers
- **mcp-obsidian**: Connected to local Obsidian vault for knowledge management

## Project Structure
- `/frontend` - React/TypeScript frontend
- `/backend` - Python FastAPI backend with core modules (config, exceptions, schemas)
- `/e2e` - Playwright test suites and BDD features
- `/docs` - Project documentation
- `docker-compose.test.yml` - Docker orchestration for testing
- `playwright-*.config.ts` - Playwright configurations for different test types
- `.features-gen/` - Generated feature documentation
- `playwright-report/` - E2E test reports

## Testing Infrastructure
- **Docker Compose**: Orchestrates backend + test containers with health checks
- **Smoke Tests**: Simple curl-based health verification (fast, reliable)
- **BDD Tests**: Playwright + Gherkin for behavior-driven testing
- **Health Checks**: Automated service dependency management

## Context Window Optimization
- Working memory: ~30-40% current code context
- Retrieved plans: ~20-30% implementation patterns
- Conversation history: ~20-30% task tracking
- Buffer: ~10-20% tool outputs

## Session Continuity
- Use git log/diff to reconstruct session state
- Maintain dependency tracking between changes
- Strategic rollback points for safe restoration