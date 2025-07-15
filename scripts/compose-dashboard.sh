#!/bin/bash

# Docker Compose Dashboard for Agentopia
# Shows all running branch stacks with their accessible URLs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to get port mapping for a service
get_service_port() {
    local project="$1"
    local service="$2"
    local internal_port="$3"
    
    # Try to get the port mapping
    local port=$(docker compose -p "$project" port "$service" "$internal_port" 2>/dev/null | cut -d':' -f2)
    
    if [ -n "$port" ]; then
        echo "$port"
    else
        echo "-"
    fi
}

# Function to check if a service is healthy
check_service_health() {
    local project="$1"
    local service="$2"
    
    # Get container name for the service
    local container=$(docker compose -p "$project" ps -q "$service" 2>/dev/null)
    
    if [ -z "$container" ]; then
        echo "stopped"
        return
    fi
    
    # Check container status
    local status=$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null)
    local health=$(docker inspect "$container" --format '{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
    
    if [ "$status" != "running" ]; then
        echo "stopped"
    elif [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
        echo "running"
    else
        echo "$health"
    fi
}

# Header
echo -e "${CYAN}🚀 Agentopia Branch Stacks Dashboard${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo

# Find all running Docker Compose projects starting with "agentopia"
projects=$(docker compose ls --format json 2>/dev/null | jq -r '.[] | select(.Name | startswith("agentopia")) | .Name' 2>/dev/null || true)

if [ -z "$projects" ]; then
    echo -e "${YELLOW}No running Agentopia stacks found.${NC}"
    echo
    echo "Start a stack with:"
    echo "  ./dev.sh start          # Main development stack"
    echo "  npm run docker:test     # Test stack"
    echo "  npm run mcp:start       # MCP servers"
    exit 0
fi

# Table header
printf "%-20s %-8s %-30s %-30s\n" "STACK" "STATUS" "BACKEND URL" "FRONTEND URL"
printf "%-20s %-8s %-30s %-30s\n" "────────────────" "──────" "──────────────────────────" "──────────────────────────"

# Process each project
echo "$projects" | while read -r project; do
    # Extract branch name from project name (e.g., agentopia-feature-auth -> feature-auth)
    branch="${project#agentopia-}"
    if [ "$branch" = "$project" ]; then
        branch="main"
    elif [ "$branch" = "dev" ]; then
        branch="main"
    fi
    
    # Get service ports
    backend_port=$(get_service_port "$project" "backend" "8000")
    frontend_port=$(get_service_port "$project" "frontend" "3000")
    
    # Check service health
    backend_health=$(check_service_health "$project" "backend")
    frontend_health=$(check_service_health "$project" "frontend")
    
    # Determine overall status
    if [ "$backend_health" = "running" ] && [ "$frontend_health" = "running" ]; then
        status="${GREEN}✅${NC}"
        status_text="running"
    elif [ "$backend_health" = "stopped" ] && [ "$frontend_health" = "stopped" ]; then
        status="${RED}⏹${NC}"
        status_text="stopped"
    else
        status="${YELLOW}⚠${NC}"
        status_text="partial"
    fi
    
    # Build URLs
    if [ "$backend_port" != "-" ]; then
        backend_url="http://localhost:$backend_port"
    else
        backend_url="-"
    fi
    
    if [ "$frontend_port" != "-" ]; then
        frontend_url="http://localhost:$frontend_port"
    else
        frontend_url="-"
    fi
    
    # Print row
    printf "%-20s %b%-7s${NC} %-30s %-30s\n" \
        "$branch" \
        "$status" \
        "$status_text" \
        "$backend_url" \
        "$frontend_url"
done

echo
echo -e "${BLUE}Commands:${NC}"
echo "  docker compose -p <project> logs -f     # View logs"
echo "  docker compose -p <project> ps          # Show containers"
echo "  docker compose -p <project> stop        # Stop stack"
echo

# Show additional running services (like MCP servers)
mcp_running=$(docker compose -p agentopia-mcp ps -q 2>/dev/null | wc -l | tr -d ' ')
if [ "$mcp_running" -gt 0 ]; then
    echo -e "${BLUE}MCP Servers:${NC} $mcp_running running"
    echo "  npm run mcp:status                      # Show MCP details"
    echo
fi