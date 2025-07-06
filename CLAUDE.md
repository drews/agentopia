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
- `npm test` - Run test suite
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:watch` - Run tests in watch mode

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
- `/backend` - Python FastAPI backend
- `/tests` - Test suites
- `/docs` - Project documentation
- `.features-gen/` - Generated feature documentation
- `playwright-report/` - E2E test reports

## Context Window Optimization
- Working memory: ~30-40% current code context
- Retrieved plans: ~20-30% implementation patterns
- Conversation history: ~20-30% task tracking
- Buffer: ~10-20% tool outputs

## Session Continuity
- Use git log/diff to reconstruct session state
- Maintain dependency tracking between changes
- Strategic rollback points for safe restoration