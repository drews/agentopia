#!/usr/bin/env python3
"""
MCP Gateway Service

Routes requests to appropriate MCP servers with pattern:
/mcp/<server-name>/<endpoint>
"""

import asyncio
import logging
import os
import json
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MCP Gateway", description="Gateway for Model Context Protocol servers")

class MCPGateway:
    """Gateway that routes requests to appropriate MCP servers."""
    
    def __init__(self, config_path: str = "/workspace/config/mcp_config.json"):
        self.servers: Dict[str, Dict] = {}
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.config_path = config_path
        
    async def initialize(self):
        """Initialize the gateway and discover MCP servers."""
        await self.discover_servers()
        logger.info(f"MCP Gateway initialized with {len(self.servers)} servers")
        
    async def discover_servers(self):
        """Discover available MCP servers from configuration file."""
        try:
            config_file = Path(self.config_path)
            
            # Fallback to relative path if absolute doesn't exist
            if not config_file.exists():
                config_file = Path("../../config/mcp_config.json")
            
            if not config_file.exists():
                logger.warning(f"Config file not found at {self.config_path}, using hardcoded defaults")
                await self.load_default_servers()
                return
            
            with open(config_file, 'r') as f:
                config_data = json.load(f)
            
            self.servers.clear()
            
            for server_name, server_config in config_data.get("servers", {}).items():
                # Use internal docker URL for gateway-to-server communication
                server_url = server_config["url"]
                
                self.servers[server_name] = {
                    "url": server_url,
                    "capabilities": server_config.get("capabilities", []),
                    "description": server_config.get("description", ""),
                    "timeout": server_config.get("timeout", 30),
                    "offline": server_config.get("offline", False)
                }
            
            logger.info(f"Loaded {len(self.servers)} server configurations from {config_file}")
            
        except Exception as e:
            logger.error(f"Error loading server configuration: {e}")
            await self.load_default_servers()
    
    async def load_default_servers(self):
        """Load hardcoded default server configuration as fallback."""
        self.servers = {
            "datetime-tools": {
                "url": "http://datetime-mcp:3000",
                "capabilities": ["datetime", "calendar", "holidays", "calculations"],
                "description": "Offline datetime tools and calendar calculations",
                "timeout": 30,
                "offline": True
            },
            "calendar": {
                "url": "http://calendar-mcp:80", 
                "capabilities": ["calendar", "events", "scheduling"],
                "description": "Calendar management server",
                "timeout": 30,
                "offline": False
            },
            "tasks": {
                "url": "http://tasks-mcp:80",
                "capabilities": ["tasks", "projects", "todo"], 
                "description": "Task management server",
                "timeout": 30,
                "offline": False
            },
            "filesystem": {
                "url": "http://filesystem-mcp:80",
                "capabilities": ["files", "documents", "storage"],
                "description": "File system management server",
                "timeout": 30,
                "offline": False
            }
        }
        
    async def route_request(self, server_name: str, path: str, method: str, 
                           request_data: Optional[bytes] = None, 
                           query_params: Optional[str] = None) -> httpx.Response:
        """Route a request to the appropriate MCP server."""
        if server_name not in self.servers:
            raise HTTPException(status_code=404, detail=f"MCP server '{server_name}' not found")
            
        server_config = self.servers[server_name]
        target_url = f"{server_config['url']}{path}"
        
        if query_params:
            target_url += f"?{query_params}"
            
        try:
            if method == "GET":
                response = await self.http_client.get(target_url)
            elif method == "POST":
                headers = {"Content-Type": "application/json"}
                response = await self.http_client.post(target_url, content=request_data, headers=headers)
            elif method == "PUT":
                headers = {"Content-Type": "application/json"}
                response = await self.http_client.put(target_url, content=request_data, headers=headers)
            elif method == "DELETE":
                response = await self.http_client.delete(target_url)
            else:
                raise HTTPException(status_code=405, detail=f"Method {method} not supported")
                
            return response
            
        except httpx.RequestError as e:
            logger.error(f"Error routing request to {server_name}: {e}")
            raise HTTPException(status_code=502, detail=f"Bad Gateway: {str(e)}")
    
    async def shutdown(self):
        """Cleanup resources."""
        await self.http_client.aclose()

# Global gateway instance
gateway = MCPGateway()

@app.on_event("startup")
async def startup_event():
    await gateway.initialize()

@app.on_event("shutdown") 
async def shutdown_event():
    await gateway.shutdown()

@app.get("/health")
async def health_check():
    """Gateway health check."""
    return {
        "status": "healthy",
        "service": "mcp-gateway",
        "servers": {name: "available" for name in gateway.servers.keys()},
        "server_count": len(gateway.servers)
    }

@app.get("/mcp")
async def list_servers():
    """List available MCP servers."""
    return {
        "servers": {
            name: {
                "capabilities": config["capabilities"],
                "description": config["description"]
            }
            for name, config in gateway.servers.items()
        }
    }

@app.get("/mcp/{server_name}")
async def server_info(server_name: str):
    """Get information about a specific MCP server."""
    if server_name not in gateway.servers:
        raise HTTPException(status_code=404, detail=f"MCP server '{server_name}' not found")
    
    config = gateway.servers[server_name]
    return {
        "server": server_name,
        "capabilities": config["capabilities"], 
        "description": config["description"],
        "status": "available"
    }

@app.api_route("/mcp/{server_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_to_server(server_name: str, path: str, request: Request):
    """Proxy requests to the appropriate MCP server."""
    
    # Get request body for POST/PUT requests
    request_data = None
    if request.method in ["POST", "PUT"]:
        request_data = await request.body()
    
    # Get query parameters
    query_params = str(request.query_params) if request.query_params else None
    
    # Route the request
    response = await gateway.route_request(
        server_name=server_name,
        path=f"/{path}",
        method=request.method,
        request_data=request_data,
        query_params=query_params
    )
    
    # Return the response
    return JSONResponse(
        content=response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
        status_code=response.status_code,
        headers=dict(response.headers)
    )

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("GATEWAY_HOST", "0.0.0.0")
    port = int(os.getenv("GATEWAY_PORT", "8001"))
    
    uvicorn.run(app, host=host, port=port)