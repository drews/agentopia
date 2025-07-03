#!/bin/bash

# Agentopia Docker Runner Script
set -e

echo "🌟 Agentopia Docker Setup"
echo "========================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Function to use docker-compose or docker compose
docker_compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Menu function
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1. Start Agentopia (build and run)"
    echo "2. Start Agentopia (run existing)"
    echo "3. Stop Agentopia"
    echo "4. View logs"
    echo "5. Rebuild containers"
    echo "6. Clean up (remove containers and images)"
    echo "7. Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice (1-7): " choice
    
    case $choice in
        1)
            echo "🚀 Building and starting Agentopia..."
            docker_compose_cmd up --build -d
            echo "✅ Agentopia started at http://localhost:8000"
            echo "📱 Opening browser..."
            sleep 2
            if command -v open &> /dev/null; then
                open http://localhost:8000
            elif command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:8000
            else
                echo "🌐 Please open http://localhost:8000 in your browser"
            fi
            ;;
        2)
            echo "🚀 Starting Agentopia..."
            docker_compose_cmd up -d
            echo "✅ Agentopia started at http://localhost:8000"
            ;;
        3)
            echo "🛑 Stopping Agentopia..."
            docker_compose_cmd down
            echo "✅ Agentopia stopped"
            ;;
        4)
            echo "📋 Viewing logs (press Ctrl+C to exit)..."
            docker_compose_cmd logs -f
            ;;
        5)
            echo "🔨 Rebuilding containers..."
            docker_compose_cmd down
            docker_compose_cmd build --no-cache
            docker_compose_cmd up -d
            echo "✅ Containers rebuilt and started"
            ;;
        6)
            echo "🧹 Cleaning up..."
            docker_compose_cmd down -v --rmi all
            echo "✅ Cleanup complete"
            ;;
        7)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice, please try again"
            ;;
    esac
done