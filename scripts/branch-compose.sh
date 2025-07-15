#!/bin/bash

# Branch-Aware Docker Compose Wrapper
# Automatically isolates stacks by git branch name

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions for logging
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

# Get current git branch name
get_branch_name() {
    if git rev-parse --git-dir >/dev/null 2>&1; then
        git branch --show-current 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "main"
    else
        echo "main"
    fi
}

# Generate a safe project name from branch
get_project_name() {
    local branch="$1"
    # Convert branch name to safe compose project name
    # Replace slashes, dots, and special chars with hyphens
    local safe_name=$(echo "$branch" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
    echo "agentopia-${safe_name}"
}

# Check if Docker and compose are available
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi
    
    if [ ! -f "docker-compose.branch.yml" ]; then
        log_error "Branch compose file not found: docker-compose.branch.yml"
        exit 1
    fi
}

# Wait for services to become healthy and show URLs
wait_and_notify() {
    local project_name="$1"
    local branch_name="$2"
    
    log_info "Waiting for services to become healthy..."
    
    # Wait up to 60 seconds for services to be healthy
    local timeout=60
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        local backend_health=$(docker compose -p "$project_name" ps backend --format json 2>/dev/null | jq -r '.[0].Health // "starting"' 2>/dev/null || echo "starting")
        local frontend_health=$(docker compose -p "$project_name" ps frontend --format json 2>/dev/null | jq -r '.[0].Health // "starting"' 2>/dev/null || echo "starting")
        
        if [ "$backend_health" = "healthy" ] && [ "$frontend_health" = "healthy" ]; then
            break
        fi
        
        echo -n "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    echo # New line after dots
    
    # Get port mappings
    local backend_port=$(docker compose -p "$project_name" port backend 8000 2>/dev/null | cut -d':' -f2 || echo "")
    local frontend_port=$(docker compose -p "$project_name" port frontend 3000 2>/dev/null | cut -d':' -f2 || echo "")
    
    # Show notification
    echo
    log_success "$branch_name stack is ready!"
    
    if [ -n "$backend_port" ]; then
        echo -e "📡 Backend:  ${CYAN}http://localhost:$backend_port${NC}"
    fi
    
    if [ -n "$frontend_port" ]; then
        echo -e "🎨 Frontend: ${CYAN}http://localhost:$frontend_port${NC}"
    fi
    
    echo
    echo -e "${BLUE}Commands:${NC}"
    echo "  ./scripts/branch-compose.sh logs    # View logs"
    echo "  ./scripts/branch-compose.sh stop    # Stop this stack"
    echo "  ./dev.sh dashboard                  # Show all stacks"
    echo
}

# Show help
show_help() {
    echo "Branch-Aware Docker Compose Wrapper"
    echo
    echo "Usage: $0 COMMAND [ARGS...]"
    echo
    echo "This script automatically:"
    echo "  - Detects current git branch"
    echo "  - Isolates stack with project name: agentopia-<branch>"
    echo "  - Uses docker-compose.branch.yml for port-collision-free setup"
    echo "  - Shows URLs after successful startup"
    echo
    echo "Examples:"
    echo "  $0 up -d                  # Start current branch stack in background"
    echo "  $0 logs -f                # Follow logs for current branch"
    echo "  $0 stop                   # Stop current branch stack"
    echo "  $0 down                   # Stop and remove current branch stack"
    echo "  $0 ps                     # Show containers for current branch"
    echo
    echo "Current context:"
    local branch=$(get_branch_name)
    local project=$(get_project_name "$branch")
    echo "  Branch: $branch"
    echo "  Project: $project"
}

# Main script
main() {
    # Check dependencies
    check_dependencies
    
    # Get branch and project names
    local branch_name=$(get_branch_name)
    local project_name=$(get_project_name "$branch_name")
    
    # Handle special case for help
    if [ $# -eq 0 ] || [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
        exit 0
    fi
    
    # Set environment variables
    export COMPOSE_PROJECT_NAME="$project_name"
    export BRANCH_NAME="$branch_name"
    
    log_info "Branch: $branch_name | Project: $project_name"
    
    # Special handling for 'up' command to show notification
    if [ "$1" = "up" ]; then
        # Run the docker compose command
        docker compose -f docker-compose.branch.yml "$@"
        
        # If successful and not in detached mode, show URLs
        if [ $? -eq 0 ] && [[ ! " $* " =~ " -d " ]] && [[ ! " $* " =~ " --detach " ]]; then
            wait_and_notify "$project_name" "$branch_name"
        fi
    else
        # Pass through all other commands
        docker compose -f docker-compose.branch.yml "$@"
    fi
}

# Run main function with all arguments
main "$@"