#!/bin/bash

# Enhanced development script with file watching and auto-restart
# Provides smooth edit-refresh workflow without timeouts

set -e

# Configuration
WATCH_DIRS=("frontend/spaceship-bridge/src" "backend" "config")
RESTART_DELAY=2
DEBOUNCE_TIME=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if fswatch is available
check_fswatch() {
    if ! command -v fswatch &> /dev/null; then
        log_warning "fswatch not found. Installing via Homebrew..."
        if command -v brew &> /dev/null; then
            brew install fswatch
        else
            log_error "Homebrew not found. Please install fswatch manually:"
            log_error "  macOS: brew install fswatch"
            log_error "  Ubuntu: sudo apt install fswatch"
            exit 1
        fi
    fi
}

# Start services
start_services() {
    log_info "Starting Agentopia development services..."
    
    # Stop any existing services first
    docker-compose down -t 1 2>/dev/null || true
    
    # Start with build
    docker-compose up --build -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 5
    
    # Check service health
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        log_success "Backend is healthy at http://localhost:8000"
    else
        log_warning "Backend not yet ready, continuing..."
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is ready at http://localhost:3000"
    else
        log_warning "Frontend not yet ready, continuing..."
    fi
}

# Restart specific service
restart_service() {
    local service=$1
    log_info "Restarting $service..."
    
    docker-compose restart $service
    
    # Brief wait for restart
    sleep $RESTART_DELAY
    
    log_success "$service restarted"
}

# Smart restart based on changed file
smart_restart() {
    local changed_file=$1
    
    log_info "📝⚡ File changed: $changed_file"
    
    if [[ $changed_file == *"frontend"* ]]; then
        # Frontend changes - no restart needed for hot reload
        log_info "🎨🔥 Frontend change detected - hot reload should handle this automatically!"
        return
    elif [[ $changed_file == *"backend"* ]]; then
        log_info "🐍🔄 Backend change detected - restarting..."
        restart_service "backend"
    elif [[ $changed_file == *"config"* ]]; then
        log_info "⚙️🔄 Config change detected - restarting all services"
        start_services
    else
        log_info "📁🔄 General change detected - restarting all services"
        start_services
    fi
}

# Watch for file changes
watch_files() {
    log_info "👁️‍🗨️ Starting file watcher for directories: ${WATCH_DIRS[*]}"
    log_info "✏️💾 Edit files and save to trigger auto-restart magic..."
    log_info "⚡🔄 Press Ctrl+C to stop watching"
    
    # Use fswatch to monitor multiple directories
    fswatch -l $DEBOUNCE_TIME -r "${WATCH_DIRS[@]}" | while read file; do
        # Ignore common temp files and hidden files
        if [[ $file == *"/.git/"* ]] || \
           [[ $file == *"node_modules"* ]] || \
           [[ $file == *"__pycache__"* ]] || \
           [[ $file == *".DS_Store"* ]] || \
           [[ $file == *"/.vscode/"* ]] || \
           [[ $file == *".tmp"* ]] || \
           [[ $file == *".swp"* ]]; then
            continue
        fi
        
        smart_restart "$file"
    done
}

# Show service logs
show_logs() {
    local service=${1:-""}
    
    if [[ -n $service ]]; then
        log_info "Showing logs for $service (Ctrl+C to stop)"
        docker-compose logs -f $service
    else
        log_info "Showing logs for all services (Ctrl+C to stop)"
        docker-compose logs -f
    fi
}

# Status check
status_check() {
    log_info "Checking service status..."
    
    echo
    docker-compose ps
    echo
    
    # Health checks
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        log_success "✅ Backend: http://localhost:8000 (healthy)"
    else
        log_error "❌ Backend: http://localhost:8000 (not responding)"
    fi
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "✅ Frontend: http://localhost:3000 (ready)"
    else
        log_error "❌ Frontend: http://localhost:3000 (not responding)"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    docker-compose down -t 1
    log_success "Cleanup complete"
}

# Handle Ctrl+C gracefully
trap cleanup SIGINT SIGTERM

# Main command handling
case "$1" in
    "start")
        start_services
        ;;
    "watch")
        check_fswatch
        start_services
        watch_files
        ;;
    "restart")
        start_services
        ;;
    "logs")
        show_logs "$2"
        ;;
    "status")
        status_check
        ;;
    "stop")
        log_info "Stopping all services..."
        docker-compose down
        log_success "All services stopped"
        ;;
    "clean")
        log_info "Cleaning up Docker resources..."
        docker-compose down -v
        docker system prune -f
        log_success "Cleanup complete"
        ;;
    *)
        echo "Enhanced Agentopia Development Script"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  start     - Start all services"
        echo "  watch     - Start services + file watcher (recommended for development)"
        echo "  restart   - Restart all services"
        echo "  logs      - Show logs (add service name for specific service)"
        echo "  status    - Check service status and health"
        echo "  stop      - Stop all services"
        echo "  clean     - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 watch          # Start with file watching (best for development)"
        echo "  $0 start          # Just start services"
        echo "  $0 logs backend   # Show backend logs"
        echo "  $0 status         # Check if everything is running"
        echo ""
        echo "👀✨ Pro tip: Use 'watch' mode for the ultimate edit-refresh experience!"
        echo "🎨💫 Save files and watch the magic happen automatically!"
        ;;
esac