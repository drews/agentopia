# MCP Integration Architecture Plan

## Overview
Implement Model Context Protocol (MCP) integration to connect Agentopia's virtual agents to real-world productivity tools and data sources. This plan details the Docker-orchestrated architecture for adding new MCP servers and integrating them with the spaceship bridge interface.

## Architecture Design

### 1. MCP Client Layer
```
backend/services/mcp/
├── mcp_client.py          # Core MCP client implementation
├── mcp_server_manager.py  # Manages multiple MCP server connections
├── resource_manager.py    # Handles MCP resource access
└── protocol_handler.py    # MCP protocol message handling
```

### 2. Agent-MCP Integration
```
backend/services/agent_mcp_bridge.py  # Bridge between agents and MCP
backend/models/mcp_models.py          # MCP-specific data models
```

### 3. MCP Server Connections (Phase 1)
- Calendar integration (Google Calendar/Outlook)
- Task management (Todoist/Notion)
- File system access

## Implementation Phases

### Phase 1: Foundation
1. Install MCP SDK and dependencies
2. Create MCP client service
3. Implement basic resource access
4. Connect to calendar MCP server

### Phase 2: Agent Integration
1. Modify agent manager to delegate MCP tasks
2. Add MCP-aware agent capabilities
3. Implement agent-to-MCP command routing

### Phase 3: Expansion
1. Add task management integration
2. Add file system access
3. Implement cross-MCP resource coordination

## Technical Requirements

### Dependencies
- `mcp` - Official MCP SDK
- `httpx` - For MCP server communication
- Updated agent models for MCP capabilities

### Configuration
- MCP server endpoints and credentials
- Resource access permissions
- Agent-to-MCP routing rules

## Docker-Orchestrated MCP Architecture

### Current Status
Agentopia uses Docker containers for all MCP servers to ensure consistency and security:

```bash
# Available MCP commands
npm run mcp:start      # Start all MCP server containers
npm run mcp:stop       # Stop all MCP server containers
npm run mcp:status     # Show status of all MCP servers
npm run mcp:test       # Test MCP server connectivity
```

### Agent Capabilities Matrix
| Agent Role | MCP Capabilities |
|------------|------------------|
| Executive Officer | calendar, tasks, planning |
| Science Officer | files, research, analysis |
| Operations Officer | tasks, workflow, automation |

## Adding a New MCP Server

### Step 1: Create Server Directory
```bash
mkdir -p mcp-servers/your-server-name
cd mcp-servers/your-server-name
```

### Step 2: Implement MCP Server
```python
# server.py
from mcp.server import Server
import mcp.server.stdio
import mcp.types as types

server = Server("your-server-name")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="your_tool",
            description="Tool description",
            inputSchema={
                "type": "object",
                "properties": {
                    "param": {"type": "string"}
                }
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "your_tool":
        # Implementation
        return [types.TextContent(type="text", text="Result")]
    
    raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    mcp.server.stdio.run_server(server)
```

### Step 3: Add to Docker Compose
Edit `docker-compose.mcp.yml`:
```yaml
services:
  mcp-your-server:
    build: ./mcp-servers/your-server-name
    ports:
      - "8080:8080"
    environment:
      - SERVER_CONFIG=/app/config.json
    volumes:
      - ./config/your-server-config.json:/app/config.json:ro
    networks:
      - mcp-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Step 4: Configure Agent Access
Edit `backend/services/agent_manager.py`:
```python
# Agent capability matrix
AGENT_CAPABILITIES = {
    AgentRole.EXECUTIVE_OFFICER: ["calendar", "tasks", "planning", "your_tool"],
    AgentRole.SCIENCE_OFFICER: ["files", "research", "analysis", "your_tool"],
    AgentRole.OPERATIONS_OFFICER: ["tasks", "workflow", "automation"]
}
```

## Testing MCP Integration

### Local Testing
```bash
# Start MCP servers
npm run mcp:start

# Test connectivity
npm run mcp:test

# Check logs
npm run mcp:logs
```

### Integration Testing
```bash
# Full MCP integration test
npm run test:mcp

# E2E tests with MCP
npm run test:e2e
```

## Implementation Steps

1. **MCP Client Infrastructure** - Core client and server management
2. **Agent Integration** - Bridge agents to MCP resources
3. **Resource Access** - Calendar, tasks, files
4. **Testing** - Integration tests with real MCP servers
5. **Documentation** - Usage examples and configuration guides

For detailed implementation guidance, see:
- [MCP Docker Orchestration](MCP_DOCKER_ORCHESTRATION.md)
- [MCP Development Status](MCP_DEVELOPMENT_STATUS.md)
- [Contributing Guide](../development/CONTRIBUTING.md)