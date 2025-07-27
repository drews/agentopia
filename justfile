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