# MCP Docker Orchestration Architecture

## Overview

Run MCP servers as isolated Docker containers that can be started on-demand, providing:
- **Isolation**: Each MCP server runs in its own container
- **Consistency**: Identical environments across development/production
- **Resource Management**: Containers can be stopped when not needed
- **Security**: Network isolation and controlled access
- **Scalability**: Easy to add/remove MCP servers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agentopia Backend                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            MCP Docker Manager                       │    │
│  │  - Container lifecycle management                   │    │
│  │  - Health checking and auto-restart                 │    │
│  │  - Load balancing and failover                      │    │
│  │  - Network routing and discovery                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
    ┌───────────▼──┐    ┌───────▼──────┐    ┌───▼─────────┐
    │ datetime-mcp │    │ calendar-mcp │    │ files-mcp   │
    │ Container    │    │ Container    │    │ Container   │
    │              │    │              │    │             │
    │ Port: 3000   │    │ Port: 3001   │    │ Port: 3002  │
    └──────────────┘    └──────────────┘    └─────────────┘
```

## Container Design

### Base MCP Container
- Common base image with MCP dependencies
- Health check endpoints
- Logging and monitoring
- Graceful shutdown handling

### Individual MCP Servers
- Extend base image
- Expose single port (HTTP/JSON-RPC)
- Stateless design (data in volumes if needed)
- Resource limits and security constraints

## Docker Compose Configuration

### docker-compose.mcp.yml
```yaml
version: '3.8'

networks:
  mcp-network:
    driver: bridge
    internal: false

services:
  # DateTime Tools MCP Server
  datetime-mcp:
    build:
      context: ./mcp-servers/datetime-tools
      dockerfile: Dockerfile
    container_name: agentopia-datetime-mcp
    ports:
      - "3000:3000"
    networks:
      - mcp-network
    environment:
      - MCP_PORT=3000
      - MCP_HOST=0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    
  # Official Time MCP Server
  time-mcp:
    image: time-mcp:latest
    container_name: agentopia-time-mcp
    ports:
      - "3001:3001"
    networks:
      - mcp-network
    environment:
      - MCP_PORT=3001
    restart: unless-stopped
    
  # Calendar MCP Server (when available)
  calendar-mcp:
    image: calendar-mcp:latest
    container_name: agentopia-calendar-mcp
    ports:
      - "3002:3002"
    networks:
      - mcp-network
    environment:
      - MCP_PORT=3002
    volumes:
      - calendar-data:/app/data
    restart: unless-stopped
    
volumes:
  calendar-data:
```

## MCP Docker Manager

### Backend Integration
```python
# backend/services/mcp_docker_manager.py

class MCPDockerManager:
    """Manages MCP servers as Docker containers."""
    
    async def start_mcp_server(self, server_name: str) -> bool:
        """Start an MCP server container on-demand."""
        
    async def stop_mcp_server(self, server_name: str) -> bool:
        """Stop an MCP server container to save resources."""
        
    async def get_server_status(self, server_name: str) -> Dict[str, Any]:
        """Check if container is running and healthy."""
        
    async def scale_servers(self) -> None:
        """Start/stop servers based on demand."""
```

## Dockerfile Templates

### Base MCP Dockerfile
```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install MCP base dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${MCP_PORT:-3000}/health || exit 1

# Default environment
ENV MCP_HOST=0.0.0.0
ENV MCP_PORT=3000

# Default command
CMD ["python", "-m", "mcp_server"]
```

### DateTime Tools Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY datetime_tools/ ./datetime_tools/
COPY pyproject.toml .

# Install in development mode
RUN pip install -e .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:3000/health')" || exit 1

# Expose port
EXPOSE 3000

# Run server
CMD ["python", "-m", "datetime_tools.server", "--port", "3000"]
```

## Orchestration Scripts

### scripts/mcp-control.sh
```bash
#!/bin/bash

# MCP Container Control Script

COMPOSE_FILE="docker-compose.mcp.yml"

case "$1" in
    start)
        echo "🚀 Starting MCP servers..."
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    stop)
        echo "🛑 Stopping MCP servers..."
        docker-compose -f $COMPOSE_FILE down
        ;;
    restart)
        echo "🔄 Restarting MCP servers..."
        docker-compose -f $COMPOSE_FILE restart
        ;;
    status)
        echo "📊 MCP server status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    logs)
        docker-compose -f $COMPOSE_FILE logs -f ${2:-}
        ;;
    scale)
        echo "📈 Scaling MCP servers..."
        # Start only needed servers based on load
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|scale}"
        exit 1
        ;;
esac
```

## NPM Scripts Integration

### package.json
```json
{
  "scripts": {
    "mcp:start": "bash scripts/mcp-control.sh start",
    "mcp:stop": "bash scripts/mcp-control.sh stop", 
    "mcp:restart": "bash scripts/mcp-control.sh restart",
    "mcp:status": "bash scripts/mcp-control.sh status",
    "mcp:logs": "bash scripts/mcp-control.sh logs",
    "dev:full": "npm run mcp:start && npm run dev",
    "test:mcp": "npm run mcp:start && npm run docker:test && npm run mcp:stop"
  }
}
```

## Benefits

### Development
- **Consistent Environment**: Same containers in dev/prod
- **Easy Setup**: `npm run mcp:start` to get all servers
- **Isolation**: No dependency conflicts between MCP servers
- **Testing**: Controlled environment for integration tests

### Production
- **Resource Efficiency**: Stop unused containers
- **Monitoring**: Container health checks and logging
- **Scalability**: Add containers based on load
- **Security**: Network isolation and resource limits

### Maintenance  
- **Updates**: Update individual containers independently
- **Debugging**: Isolated logs and metrics per service
- **Backup**: Volume-based data persistence
- **Rollback**: Easy container version management

## Implementation Plan

1. **Create Base Images**: Build common MCP container foundation
2. **Convert Servers**: Dockerize datetime-tools and other MCP servers  
3. **Docker Manager**: Build container lifecycle management
4. **Integration**: Connect to existing MCP client architecture
5. **Scripts**: Add orchestration and control scripts
6. **Testing**: Verify container-based MCP integration

This approach gives us the benefits of microservices architecture while maintaining the simplicity of local development.