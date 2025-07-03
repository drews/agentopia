# Agentopia Development Makefile

.PHONY: install run test demo clean help docker-build docker-up docker-down docker-logs

# Default target
help:
	@echo "🌟 Agentopia Development Commands"
	@echo "================================"
	@echo "make install      - Install dependencies"
	@echo "make run          - Start web server"
	@echo "make demo         - Run command-line demo"
	@echo "make test         - Run automated tests"
	@echo "make test-watch   - Run tests in watch mode"
	@echo "make clean        - Clean up temporary files"
	@echo "make dev          - Development mode (install + test + run)"
	@echo ""
	@echo "Docker Commands:"
	@echo "make docker-build - Build Docker containers"
	@echo "make docker-up    - Start with Docker Compose"
	@echo "make docker-down  - Stop Docker containers"
	@echo "make docker-logs  - View Docker logs"
	@echo "make docker-clean - Clean up Docker resources"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	pip install -r requirements.txt
	@echo "✅ Dependencies installed"

# Run the web server
run:
	@echo "🚀 Starting Agentopia web server..."
	python server.py

# Run command-line demo
demo:
	@echo "🎭 Running Agentopia demo..."
	python mcp_rooms.py

# Run tests
test:
	@echo "🧪 Running tests..."
	python -m pytest test_agentopia.py -v

# Run tests in watch mode (requires pytest-watch)
test-watch:
	@echo "🧪 Running tests in watch mode..."
	python -m pytest test_agentopia.py -v --tb=short -f

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type f -name "*.log" -delete 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Development workflow
dev: install test
	@echo "🚀 Starting development server..."
	python server.py

# Quick start (interactive)
start:
	@echo "🌟 Welcome to Agentopia!"
	python run.py

# Docker commands
docker-build:
	@echo "🐳 Building Docker containers..."
	docker-compose build

docker-up:
	@echo "🚀 Starting Agentopia with Docker..."
	docker-compose up -d
	@echo "✅ Agentopia started at http://localhost:8000"

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

docker-logs:
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --rmi all