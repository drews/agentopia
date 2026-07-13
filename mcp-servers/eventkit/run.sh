#!/bin/bash
# Run the host-side EventKit MCP server.
#
# Must run directly on macOS (NOT in Docker) — see server.py docstring and
# README.md for why. Creates/reuses a local venv so this doesn't pollute the
# system Python or the backend's requirements.
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" != "Darwin" ]]; then
    echo "This server requires macOS (EventKit is an Apple framework). Aborting." >&2
    exit 1
fi

if [ ! -d .venv ]; then
    echo "Creating venv..."
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

echo "Starting EventKit MCP server on http://127.0.0.1:3010/mcp"
echo "(First calendar/reminders call will trigger a macOS permission prompt.)"
exec python3 server.py
