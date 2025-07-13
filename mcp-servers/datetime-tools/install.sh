#!/bin/bash

# Install DateTime Tools MCP Server

echo "🕐 Installing DateTime Tools MCP Server..."

# Check if Python 3.9+ is available
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)" 2>/dev/null; then
    echo "❌ Python 3.9+ is required but not found"
    exit 1
fi

# Install in development mode
pip install -e .

echo "✅ DateTime Tools MCP Server installed successfully!"
echo ""
echo "Usage:"
echo "  # Run the server directly"
echo "  python -m datetime_tools.server"
echo ""
echo "  # Or use the entry point"
echo "  datetime-tools-mcp"
echo ""
echo "Example queries your agents can now answer:"
echo "  - 'How many days until Christmas?'"
echo "  - 'What day of the week is New Year?'"
echo "  - 'Is 2024 a leap year?'"
echo "  - 'When is the next holiday?'"