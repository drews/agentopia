#!/bin/bash

# Claude Code Persona Management Script
# Usage: ./claude-personas.sh [command] [persona_id]

set -e

# Configuration
API_BASE="${API_BASE:-http://localhost:8000}"
PERSONAS_FILE="$(dirname "$0")/../config/personas.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_help() {
    echo "Claude Code Persona Management"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                    List all available personas"
    echo "  active                  Show the currently active persona"
    echo "  activate <persona_id>   Activate a specific persona"
    echo "  describe <persona_id>   Show detailed description of a persona"
    echo "  suggest <context>       Get persona suggestion for context"
    echo "  reset                   Clear active persona (return to default)"
    echo ""
    echo "Available Personas:"
    echo "  sage_staff_engineer    - Wise, methodical senior engineer"
    echo "  move_fast_hacker       - Speed-first rapid prototyper"
    echo "  security_paranoid      - Zero-trust security-focused engineer"
    echo "  product_pragmatist     - User-focused, business-aware engineer"
    echo ""
    echo "Context Triggers:"
    echo "  prototype_phase        - Suggests move_fast_hacker"
    echo "  production_system      - Suggests sage_staff_engineer"
    echo "  security_review        - Suggests security_paranoid"
    echo "  user_facing_feature    - Suggests product_pragmatist"
}

# Check if backend is running
check_backend() {
    if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
        echo -e "${RED}Error: Agentopia backend not running at $API_BASE${NC}"
        echo "Start with: ./dev.sh start"
        exit 1
    fi
}

# List all personas
list_personas() {
    echo -e "${BLUE}Available Personas:${NC}"
    if [[ -f "$PERSONAS_FILE" ]]; then
        jq -r '.personas | to_entries[] | "  \(.key) - \(.value.description)"' "$PERSONAS_FILE" 2>/dev/null || {
            echo "  sage_staff_engineer - Seasoned, methodical senior engineer"
            echo "  move_fast_hacker - Speed-first button masher"
            echo "  security_paranoid - Zero-trust mindset"
            echo "  product_pragmatist - User-focused, business-aware"
        }
    else
        echo -e "${YELLOW}Personas config not found. Using built-in list.${NC}"
        echo "  sage_staff_engineer - Seasoned, methodical senior engineer"
        echo "  move_fast_hacker - Speed-first button masher"
        echo "  security_paranoid - Zero-trust mindset"
        echo "  product_pragmatist - User-focused, business-aware"
    fi
}

# Get active persona
get_active() {
    check_backend
    response=$(curl -s "$API_BASE/api/personas" 2>/dev/null) || {
        echo -e "${RED}Error: Could not fetch persona status${NC}"
        exit 1
    }
    
    active=$(echo "$response" | jq -r '.active_persona // "none"')
    if [[ "$active" == "none" || "$active" == "null" ]]; then
        echo -e "${YELLOW}No active persona (using default behavior)${NC}"
    else
        echo -e "${GREEN}Active persona: $active${NC}"
        # Show description if available
        if [[ -f "$PERSONAS_FILE" ]]; then
            desc=$(jq -r ".personas.$active.description // \"No description\"" "$PERSONAS_FILE" 2>/dev/null)
            echo "  $desc"
        fi
    fi
}

# Activate a persona
activate_persona() {
    local persona_id="$1"
    if [[ -z "$persona_id" ]]; then
        echo -e "${RED}Error: Persona ID required${NC}"
        echo "Usage: $0 activate <persona_id>"
        list_personas
        exit 1
    fi
    
    check_backend
    echo -e "${BLUE}Activating persona: $persona_id${NC}"
    
    response=$(curl -s -X POST "$API_BASE/api/personas/$persona_id/activate" 2>/dev/null) || {
        echo -e "${RED}Error: Could not activate persona${NC}"
        exit 1
    }
    
    status=$(echo "$response" | jq -r '.status // "error"')
    if [[ "$status" == "success" ]]; then
        echo -e "${GREEN}✓ Persona '$persona_id' activated successfully${NC}"
        
        # Show Claude Code specific guidance
        echo ""
        echo -e "${BLUE}Claude Code Behavior Changes:${NC}"
        if [[ -f "$PERSONAS_FILE" ]]; then
            behavior=$(jq -r ".claude_code_personas.$persona_id.behavior_prompts // \"Standard behavior\"" "$PERSONAS_FILE" 2>/dev/null)
            echo "  $behavior"
        fi
    else
        error=$(echo "$response" | jq -r '.detail // "Unknown error"')
        echo -e "${RED}Error: $error${NC}"
        exit 1
    fi
}

# Describe a persona
describe_persona() {
    local persona_id="$1"
    if [[ -z "$persona_id" ]]; then
        echo -e "${RED}Error: Persona ID required${NC}"
        echo "Usage: $0 describe <persona_id>"
        exit 1
    fi
    
    if [[ ! -f "$PERSONAS_FILE" ]]; then
        echo -e "${RED}Error: Personas config file not found${NC}"
        exit 1
    fi
    
    # Check if persona exists
    exists=$(jq -r ".personas.$persona_id // null" "$PERSONAS_FILE" 2>/dev/null)
    if [[ "$exists" == "null" ]]; then
        echo -e "${RED}Error: Persona '$persona_id' not found${NC}"
        list_personas
        exit 1
    fi
    
    echo -e "${BLUE}Persona: $persona_id${NC}"
    jq -r ".personas.$persona_id | \"
Name: \\(.name)
Description: \\(.description)
Philosophy: \\(.philosophy)
Communication Style: \\(.communication_style)
Work Pace: \\(.work_pace)
Risk Tolerance: \\(.risk_tolerance)
\"" "$PERSONAS_FILE" 2>/dev/null
    
    echo -e "${BLUE}Claude Code Behavior:${NC}"
    jq -r ".claude_code_personas.$persona_id.behavior_prompts // \"No specific behavior defined\"" "$PERSONAS_FILE" 2>/dev/null
}

# Suggest persona based on context
suggest_persona() {
    local context="$1"
    if [[ -z "$context" ]]; then
        echo -e "${RED}Error: Context required${NC}"
        echo "Usage: $0 suggest <context>"
        echo ""
        echo "Available contexts:"
        echo "  prototype_phase, production_system, security_review,"
        echo "  user_facing_feature, technical_debt_refactor, mvp_development"
        exit 1
    fi
    
    if [[ ! -f "$PERSONAS_FILE" ]]; then
        echo -e "${RED}Error: Personas config file not found${NC}"
        exit 1
    fi
    
    suggestion=$(jq -r ".context_triggers.$context // null" "$PERSONAS_FILE" 2>/dev/null)
    if [[ "$suggestion" == "null" ]]; then
        echo -e "${YELLOW}No specific persona suggested for context '$context'${NC}"
        echo "Available contexts:"
        jq -r '.context_triggers | keys[]' "$PERSONAS_FILE" 2>/dev/null | sed 's/^/  /'
    else
        echo -e "${GREEN}Suggested persona for '$context': $suggestion${NC}"
        desc=$(jq -r ".personas.$suggestion.description // \"No description\"" "$PERSONAS_FILE" 2>/dev/null)
        echo "  $desc"
        echo ""
        echo "Activate with: $0 activate $suggestion"
    fi
}

# Reset to default
reset_persona() {
    echo -e "${YELLOW}Note: Reset functionality requires backend implementation${NC}"
    echo "For now, you can activate 'sage_staff_engineer' as a balanced default:"
    echo "$0 activate sage_staff_engineer"
}

# Main command handling
case "${1:-help}" in
    "list"|"ls")
        list_personas
        ;;
    "active"|"current")
        get_active
        ;;
    "activate"|"use"|"set")
        activate_persona "$2"
        ;;
    "describe"|"info"|"show")
        describe_persona "$2"
        ;;
    "suggest"|"recommend")
        suggest_persona "$2"
        ;;
    "reset"|"clear"|"default")
        reset_persona
        ;;
    "help"|"-h"|"--help")
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac