# Agentopia Development Guide

AI agent development platform with longitudinal task performance optimization.

## Quick Commands
- **Health Check**: `just smoke`
- **Start Dev**: `just start`
- **Stop All**: `just stop`
- **MCP Status**: `just mcp-status`

## Context Triggers (Load When Needed)

### 🚀 Getting Started
- **Project overview** → `@README.md`
- **Architecture** → `@docs/architecture/ARCHITECTURE.md`
- **Available commands** → `@package.json` (scripts section)

### 🔧 Development Tasks  
- **Frontend work** → `@frontend/BACKLOG.md`
- **Backend work** → `@backend/BACKLOG.md`
- **Testing issues** → `cat ~/.claude/patterns/TEST_DRIVEN_DEVELOPMENT.md`
- **MCP integration** → `@docs/mcp/MCP_INTEGRATION_PLAN.md`

### 📚 Reference Docs
- **Contributing guidelines** → `@docs/development/CONTRIBUTING.md`
- **Game mechanics** → `@docs/design/GAME_MECHANICS.md`
- **Strange Loop plan** → `@docs/development/STRANGE_LOOP.md`

## Context Management Strategy

## Smart Context Loading
- **Load docs on-demand** using @-references
- **Minimize context window** usage
- **Task-specific loading** based on current work

## Core Patterns
- **Docker-first**: All dev/test commands use containers
- **MCP integration**: Agents connect via MCP servers  
- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`
- **Context triggers**: Load detailed docs when needed

## Essential Commands

### Daily Workflow
```bash
# Start development
just start

# Health check
just smoke

# Stop everything  
just stop
```

### Context Loading Commands
```bash
# Load detailed testing guide
cat ~/.claude/patterns/TEST_DRIVEN_DEVELOPMENT.md

# Load project workflow patterns
cat ~/.claude/workflows/EXPLORE_PLAN_CODE_COMMIT.md

# Check project status
@docs/planning/ROADMAP.md
@backend/BACKLOG.md
@frontend/BACKLOG.md
```

### When You Need Full Command Reference
```bash
# Complete command list
@package.json

# Detailed development setup
@docs/development/CONTRIBUTING.md

# Testing infrastructure
@README.md (Testing section)
```

## Workflow Triggers

### 🏗️ Architecture Work
- **System design** → `@docs/architecture/ARCHITECTURE.md`
- **Strange Loop development** → `@docs/development/STRANGE_LOOP.md`
- **Game mechanics** → `@docs/design/GAME_MECHANICS.md`

### 🧪 Testing Work
- **Testing philosophy** → `cat ~/.claude/patterns/TEST_DRIVEN_DEVELOPMENT.md`
- **Docker testing** → `@docs/development/DOCKER_TESTING.md`
- **E2E patterns** → `@e2e/` directory

### 🔗 MCP Integration
- **MCP status** → `just mcp-status`
- **MCP setup** → `@docs/mcp/MCP_INTEGRATION_PLAN.md`
- **Server configs** → `@config/agentopia.json`

### 📝 Documentation  
- **Personal log** → `@docs/development/PERSONAL_LOG.md`
- **Contributing** → `@docs/development/CONTRIBUTING.md`
- **Planning status** → `@docs/planning/ROADMAP.md`

## Performance Optimization
- **Lightweight CLAUDE.md**: Essential commands only
- **On-demand docs**: Load via @-references when needed
- **Context efficiency**: Minimize working memory usage

## Session Patterns

### Starting Work
```bash
# Quick project state check
git status
just smoke
@docs/planning/ROADMAP.md (first 20 lines)
```

### Deep Dive Sessions
```bash
# Load full context for complex work
@docs/architecture/ARCHITECTURE.md
@docs/development/CONTRIBUTING.md  
@backend/BACKLOG.md
@frontend/BACKLOG.md
```

### Reference Information (Load as Needed)
- **Project structure** → `tree -L 2 -I node_modules`
- **Available baselines** → `git log --oneline -10`
- **Development insights** → `@docs/development/PERSONAL_LOG.md`
- **Architecture details** → `@docs/architecture/`
- **Testing patterns** → `@docs/development/DOCKER_TESTING.md`