#!/bin/bash

# Development helper script for Agentopia

set -e

case "$1" in
    "start")
        echo "🚀 Starting Agentopia development environment..."
        docker-compose up --build
        ;;
    "backend")
        echo "🔧 Starting backend only..."
        docker-compose up --build backend
        ;;
    "frontend")
        echo "🎨 Starting frontend only..."
        docker-compose up --build frontend
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting all services..."
        docker-compose down
        docker-compose up --build
        ;;
    "logs")
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    "shell")
        service=${2:-backend}
        echo "🐚 Opening shell in $service..."
        docker-compose exec "$service" /bin/bash
        ;;
    "test")
        echo "🧪 Running tests..."
        # Add test commands here
        echo "Test functionality not implemented yet"
        ;;
    "clean")
        echo "🧹 Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        ;;
    "watch")
        echo "👀🔄 Starting file watcher with auto-reload magic..."
        exec ./dev-watch.sh watch
        ;;
    *)
        echo "Agentopia Development Script"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all services (backend + frontend)"
        echo "  backend   - Start backend only"
        echo "  frontend  - Start frontend only"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - Show logs (add service name for specific service)"
        echo "  shell     - Open shell in service (default: backend)"
        echo "  test      - Run tests"
        echo "  clean     - Clean up Docker resources"
        echo "  watch     - 👀🔄 File watcher with auto-reload (smooth dev flow!)"
        echo ""
        echo "Examples:"
        echo "  $0 watch           # 🎯 Recommended for development"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 shell frontend"
        ;;
esac