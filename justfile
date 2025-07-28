# Agentopia Development Justfile
# Primary entry point for all development commands

# Project variables
project_name := "agentopia"
version := `git describe --tags --always --dirty 2>/dev/null || echo "dev"`
branch_name := `git branch --show-current 2>/dev/null || echo "main"`

# Settings
set dotenv-load := true
set export := true

# Default recipe - show available commands
default:
    @echo "🚀 Agentopia Development Commands"
    @echo "════════════════════════════════════════"
    @echo ""
    @echo "Project: {{project_name}} ({{version}})"
    @echo "Branch:  {{branch_name}}"
    @echo ""
    @echo "Available commands:"
    @just --list --unsorted
    @echo ""
    @echo "💡 Use 'just <command>' to run a specific command"
    @echo "📚 Use 'just --help' for more information about just"

# ════════════════════════════════════════════════════════════════════════════
# DEVELOPMENT ENVIRONMENT
# ════════════════════════════════════════════════════════════════════════════

# Start all services
start:
    @echo "🚀 Starting Agentopia development environment..."
    docker-compose --profile dev up --build

# Start services in background
start-bg:
    @echo "🚀 Starting Agentopia development environment in background..."
    docker-compose --profile dev up --build -d

# Start backend only
backend:
    @echo "🔧 Starting backend only..."
    docker-compose --profile dev up --build backend

# Start frontend only
frontend:
    @echo "🎨 Starting frontend only..."
    docker-compose --profile dev up --build frontend

# Stop all services
stop:
    @echo "🛑 Stopping all services..."
    docker-compose down

# Restart all services
restart: stop start

# Show logs for all services or specific service
logs service="":
    #!/usr/bin/env bash
    if [ -z "{{service}}" ]; then
        echo "📋 Showing logs for all services..."
        docker-compose logs -f
    else
        echo "📋 Showing logs for {{service}}..."
        docker-compose logs -f "{{service}}"
    fi

# Open shell in a service (default: backend)
shell service="backend":
    @echo "🐚 Opening shell in {{service}}..."
    docker-compose exec "{{service}}" /bin/bash

# Clean up Docker resources
clean:
    @echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f

# Show dashboard of running services
dashboard:
    @bash scripts/compose-dashboard.sh

# ════════════════════════════════════════════════════════════════════════════
# TESTING
# ════════════════════════════════════════════════════════════════════════════

# Run smoke tests (quick health check)
smoke:
    @echo "🧪 Running smoke tests..."
    BACKEND_PORT=8001 FRONTEND_PORT=3001 DEBUG=true CI=true docker-compose --profile test up --abort-on-container-exit tests

# Run all tests in Docker
test:
    @echo "🧪 Running all tests..."
    BACKEND_PORT=8001 FRONTEND_PORT=3001 DEBUG=true CI=true docker-compose --profile test up --build --abort-on-container-exit tests

# Run E2E tests
test-e2e:
    @echo "🧪 Running E2E tests..."
    npx bddgen && npx playwright test

# Run E2E tests with UI
test-ui:
    @echo "🧪 Running E2E tests with UI..."
    npx bddgen && npx playwright test --ui

# Run E2E tests in headed mode
test-headed:
    @echo "🧪 Running E2E tests in headed mode..."
    npx bddgen && npx playwright test --headed

# Clean test environment
test-clean:
    @echo "🧹 Cleaning test environment..."
    docker-compose down --volumes --remove-orphans

# ════════════════════════════════════════════════════════════════════════════
# MCP (Model Context Protocol)
# ════════════════════════════════════════════════════════════════════════════

# Start MCP servers
mcp-start:
    @echo "🚀 Starting MCP servers..."
    bash scripts/mcp-control.sh start

# Stop MCP servers
mcp-stop:
    @echo "🛑 Stopping MCP servers..."
    bash scripts/mcp-control.sh stop

# Restart MCP servers
mcp-restart:
    @echo "🔄 Restarting MCP servers..."
    bash scripts/mcp-control.sh restart

# Show MCP status
mcp-status:
    @echo "📊 MCP server status..."
    bash scripts/mcp-control.sh status

# Show MCP logs
mcp-logs:
    @echo "📋 MCP server logs..."
    bash scripts/mcp-control.sh logs

# Build MCP containers
mcp-build:
    @echo "🔨 Building MCP containers..."
    bash scripts/mcp-control.sh build

# Clean MCP resources
mcp-clean:
    @echo "🧹 Cleaning MCP resources..."
    bash scripts/mcp-control.sh clean

# ════════════════════════════════════════════════════════════════════════════
# COMPOSITE COMMANDS
# ════════════════════════════════════════════════════════════════════════════

# Start full development environment (MCP + services)
dev-full: mcp-start start-bg
    @echo "✅ Full development environment is running!"

# Run tests with MCP integration
test-mcp: mcp-start smoke mcp-stop
    @echo "✅ MCP integration tests complete!"

# ════════════════════════════════════════════════════════════════════════════
# CI/CD
# ════════════════════════════════════════════════════════════════════════════

# Run all CI checks
ci: test-clean test smoke
    @echo "✅ All CI checks passed!"

# ════════════════════════════════════════════════════════════════════════════
# ALIASES
# ════════════════════════════════════════════════════════════════════════════

alias up := start
alias down := stop
alias s := shell
alias l := logs
alias t := test