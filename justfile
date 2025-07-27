# Agentopia Development Justfile

# Project variables
project_name := "agentopia"
version := `git describe --tags --always --dirty 2>/dev/null || echo "dev"`
branch_name := `git branch --show-current 2>/dev/null || echo "main"`

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

# Start the development environment
start:
    @echo "🚀 Starting Agentopia development environment..."
    docker-compose up --build

# Start development environment in background
start-bg:
    @echo "🚀 Starting Agentopia development environment in background..."
    docker-compose up --build -d

# Stop all services
stop:
    @echo "🛑 Stopping all services..."
    docker-compose down

# Restart all services
restart:
    @echo "🔄 Restarting all services..."
    docker-compose down
    docker-compose up --build

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