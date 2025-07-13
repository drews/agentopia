#!/bin/bash

# MCP Container Control Script
# Manages MCP servers as Docker containers

set -e

COMPOSE_FILE="docker-compose.mcp.yml"
PROJECT_NAME="agentopia-mcp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_dependencies() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
}

start_servers() {
    log_info "Starting MCP servers..."
    
    # Build images first
    log_info "Building custom MCP server images..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build
    
    # Start containers
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
    
    log_success "MCP servers started"
    
    # Wait for health checks
    log_info "Waiting for health checks..."
    sleep 10
    
    # Show status
    show_status
}

stop_servers() {
    log_info "Stopping MCP servers..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    log_success "MCP servers stopped"
}

restart_servers() {
    log_info "Restarting MCP servers..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" restart
    log_success "MCP servers restarted"
    show_status
}

show_status() {
    log_info "MCP server status:"
    echo
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    echo
    
    # Show individual container health
    log_info "Health status:"
    for container in $(docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps -q); do
        name=$(docker inspect "$container" --format '{{.Name}}' | sed 's/^.//')
        health=$(docker inspect "$container" --format '{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
        port=$(docker inspect "$container" --format '{{range $p, $conf := .NetworkSettings.Ports}}{{if $conf}}{{$p}}{{end}}{{end}}' | head -1 | cut -d'/' -f1)
        
        if [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
            log_success "$name - $health (port: $port)"
        elif [ "$health" = "unhealthy" ]; then
            log_error "$name - $health (port: $port)"
        else
            log_warning "$name - $health (port: $port)"
        fi
    done
}

show_logs() {
    local service="${2:-}"
    if [ -n "$service" ]; then
        log_info "Showing logs for $service..."
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$service"
    else
        log_info "Showing logs for all MCP servers..."
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
    fi
}

scale_servers() {
    log_info "Scaling MCP servers based on demand..."
    
    # Start only essential servers by default
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d datetime-mcp
    
    log_success "Started essential MCP servers"
    show_status
}

build_images() {
    log_info "Building MCP server images..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build
    log_success "Images built successfully"
}

clean_up() {
    log_warning "Cleaning up MCP containers and volumes..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans
    
    # Remove unused images
    log_info "Removing unused images..."
    docker image prune -f
    
    log_success "Cleanup complete"
}

test_connectivity() {
    log_info "Testing MCP gateway connectivity..."
    
    # Test gateway health
    if curl -sf http://localhost:8001/health > /dev/null 2>&1; then
        log_success "MCP Gateway: responsive on port 8001"
        
        # Test individual servers through gateway
        log_info "Testing servers via gateway..."
        
        # List available servers
        servers=$(curl -sf http://localhost:8001/mcp 2>/dev/null | jq -r '.servers | keys[]' 2>/dev/null)
        
        if [ -n "$servers" ]; then
            echo "$servers" | while read server; do
                if curl -sf "http://localhost:8001/mcp/$server/health" > /dev/null 2>&1; then
                    log_success "MCP server '$server': available via gateway"
                else
                    log_warning "MCP server '$server': not available via gateway"
                fi
            done
        else
            log_warning "No servers found via gateway"
        fi
        
        # Test datetime-tools specifically
        if curl -sf "http://localhost:8001/mcp/datetime-tools/health" > /dev/null 2>&1; then
            log_success "datetime-tools: accessible via gateway"
        else
            log_warning "datetime-tools: not accessible via gateway"
        fi
        
    else
        log_error "MCP Gateway: not responsive on port 8001"
    fi
}

show_help() {
    echo "MCP Container Control Script"
    echo
    echo "Usage: $0 COMMAND [OPTIONS]"
    echo
    echo "Commands:"
    echo "  start         Start all MCP servers"
    echo "  stop          Stop all MCP servers"
    echo "  restart       Restart all MCP servers"
    echo "  status        Show status of all MCP servers"
    echo "  logs [SERVICE] Show logs (optionally for specific service)"
    echo "  scale         Start only essential servers"
    echo "  build         Build all MCP server images"
    echo "  clean         Clean up containers and volumes"
    echo "  test          Test connectivity to MCP servers"
    echo "  help          Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start              # Start all MCP servers"
    echo "  $0 logs datetime-mcp  # Show logs for datetime server"
    echo "  $0 scale              # Start only essential servers"
}

# Main script logic
check_dependencies

case "${1:-help}" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        restart_servers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    scale)
        scale_servers
        ;;
    build)
        build_images
        ;;
    clean)
        clean_up
        ;;
    test)
        test_connectivity
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac