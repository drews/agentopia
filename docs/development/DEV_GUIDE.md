# Development Guide

This guide provides a quick-start overview for developers working on Agentopia, with references to detailed documentation.

## Quick Start

### 1. Setup
```bash
git clone https://github.com/drews/agentopia.git
cd agentopia
npm install
```

### 2. Development
```bash
# Start development environment
./dev.sh start

# Run tests
npm run docker:smoke
```

### 3. Understanding the System
- **Architecture**: Read [../architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- **Narrative Design**: Read [../design/NARRATIVE_ROLES.md](../design/NARRATIVE_ROLES.md)
- **Game Mechanics**: Read [../design/GAME_MECHANICS.md](../design/GAME_MECHANICS.md)

## Development Workflow

### Branch Strategy
- **Main branch**: Production-ready code
- **Feature branches**: `feature/description`
- **Fix branches**: `fix/description`
- **Documentation branches**: `docs/description`

### Commit Convention
```bash
feat: add new agent personality system
fix: resolve WebSocket connection stability
docs: update MCP integration guide
refactor: consolidate character types
```

### Pull Request Process
1. Create feature branch from main
2. Implement changes following [CONTRIBUTING.md](CONTRIBUTING.md)
3. Test with `npm run docker:smoke`
4. Submit PR with clear description
5. Address review feedback
6. Merge after approval

## Key Concepts

### Narrative-Driven Development
- **Character consistency**: Maintain agent personalities
- **Bridge metaphor**: Frame everything in spaceship terms
- **ADHD-friendly**: Design for executive function support
- **Immersive experience**: Preserve the space exploration feel

### Technical Patterns
- **Docker-first**: All development and testing in containers
- **Configuration-driven**: JSON files define behavior
- **Real-time updates**: WebSocket communication
- **Agent-based**: Distributed AI personalities

## Architecture Overview

### Frontend (`/frontend/spaceship-bridge/`)
- **React + TypeScript**: Modern web application
- **Three-tab interface**: Screen, Ship, Manifest
- **LCARS design**: Star Trek inspired UI
- **Real-time WebSocket**: Live updates from backend

### Backend (`/backend/`)
- **FastAPI**: Async Python web framework
- **SQLite database**: Simple, file-based storage
- **WebSocket support**: Real-time client communication
- **MCP integration**: External tool connections

### MCP Servers (`/mcp-servers/`)
- **Docker containers**: Isolated service architecture
- **External integrations**: Calendar, tasks, files
- **Role-based access**: Different capabilities per agent

## Testing Strategy

### Test Types
- **Smoke tests**: Basic functionality verification
- **Integration tests**: Full system testing
- **E2E tests**: User journey validation
- **MCP tests**: External service integration

### Test Commands
```bash
# Quick health check
npm run docker:smoke

# Full test suite
npm run docker:test

# E2E tests
npm run test:e2e

# MCP integration tests
npm run test:mcp
```

## Common Tasks

### Adding New Features
1. **Plan**: Define requirements and design
2. **Design**: Consider narrative and character impact
3. **Implement**: Follow existing patterns
4. **Test**: Verify functionality and integration
5. **Document**: Update relevant docs

### Debugging Issues
1. **Check logs**: `npm run docker:test:logs`
2. **Health check**: `npm run docker:smoke`
3. **Restart services**: `./dev.sh stop && ./dev.sh start`
4. **Check network**: Verify Docker container communication

### MCP Integration
1. **Read guide**: [../mcp/MCP_INTEGRATION_PLAN.md](../mcp/MCP_INTEGRATION_PLAN.md)
2. **Create server**: Follow Docker patterns
3. **Configure agents**: Update capability matrix
4. **Test integration**: Verify connectivity

## Documentation Structure

### Core Documentation
- **[index.md](../index.md)**: Documentation navigation
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Development guidelines
- **[CONTEXT_MANAGEMENT.md](CONTEXT_MANAGEMENT.md)**: Context optimization

### Architecture
- **[ARCHITECTURE.md](../architecture/ARCHITECTURE.md)**: System design
- **[DECOUPLED_PERSISTENCE_ARCHITECTURE.md](../architecture/DECOUPLED_PERSISTENCE_ARCHITECTURE.md)**: Database design

### Design
- **[NARRATIVE_ROLES.md](../design/NARRATIVE_ROLES.md)**: Character system
- **[GAME_MECHANICS.md](../design/GAME_MECHANICS.md)**: User experience
- **[UX_GUIDELINES.md](../design/UX_GUIDELINES.md)**: Interface design

### Planning
- **[ROADMAP.md](../planning/ROADMAP.md)**: Development roadmap
- **[SIMPLE_PLAN.md](../planning/SIMPLE_PLAN.md)**: Current priorities

## Getting Help

### Internal Resources
- **Documentation**: Browse `/docs` directory
- **Code examples**: Check existing implementations
- **Tests**: Review test files for usage patterns
- **Git history**: Learn from previous changes

### Community
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Pull Requests**: Contribute code and documentation
- **Code Reviews**: Learn from feedback

## Best Practices

### Code Quality
- **Follow existing patterns**: Consistency is key
- **Write clear code**: Self-documenting preferred
- **Test thoroughly**: Verify all changes
- **Document decisions**: Explain complex choices

### Narrative Consistency
- **Maintain character voices**: Each agent has distinct personality
- **Use bridge metaphors**: Frame features in spaceship terms
- **Support ADHD users**: Design for executive function
- **Preserve immersion**: Avoid breaking the space theme

### Performance
- **Optimize Docker builds**: Use layer caching
- **Monitor resource usage**: Check container performance
- **Profile bottlenecks**: Identify slow operations
- **Test on different devices**: Ensure broad compatibility

## Next Steps

1. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** for detailed guidelines
2. **Explore the codebase** to understand current implementation
3. **Run the development environment** to see the system in action
4. **Make a small contribution** to get familiar with the workflow
5. **Join the community** to connect with other developers

Remember: Agentopia is designed to be accommodating and supportive. Our development process should reflect the same principles we build into the user experience.