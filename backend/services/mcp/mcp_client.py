"""
Core MCP client implementation for connecting to MCP servers.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import httpx

logger = logging.getLogger(__name__)


@dataclass
class MCPServerConfig:
    """Configuration for an MCP server connection."""
    name: str
    url: str
    auth: Optional[Dict[str, Any]] = None
    capabilities: List[str] = None
    timeout: int = 30


class MCPClient:
    """
    MCP client for communicating with MCP servers.
    
    Handles the low-level protocol communication and maintains
    connections to MCP servers.
    """
    
    def __init__(self):
        self.servers: Dict[str, MCPServerConfig] = {}
        self.connections: Dict[str, httpx.AsyncClient] = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize the MCP client."""
        try:
            self.initialized = True
            logger.info("MCP client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MCP client: {e}")
            raise
            
    async def shutdown(self):
        """Shutdown the MCP client and close all connections."""
        try:
            # Close all HTTP connections
            for client in self.connections.values():
                await client.aclose()
            self.connections.clear()
            
            self.initialized = False
            logger.info("MCP client shut down")
        except Exception as e:
            logger.error(f"Error during MCP client shutdown: {e}")
    
    def add_server(self, config: MCPServerConfig):
        """Add an MCP server configuration."""
        self.servers[config.name] = config
        logger.info(f"Added MCP server configuration: {config.name}")
    
    async def connect_to_server(self, server_name: str) -> bool:
        """Connect to an MCP server."""
        try:
            if server_name not in self.servers:
                raise ValueError(f"Unknown server: {server_name}")
            
            config = self.servers[server_name]
            
            # Create HTTP client for this server
            client = httpx.AsyncClient(
                base_url=config.url,
                timeout=config.timeout,
                headers={"Content-Type": "application/json"}
            )
            
            # Test connection with a health check
            response = await client.get("/health")
            response.raise_for_status()
            
            self.connections[server_name] = client
            logger.info(f"Connected to MCP server: {server_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to MCP server {server_name}: {e}")
            return False
    
    async def disconnect_from_server(self, server_name: str):
        """Disconnect from an MCP server."""
        try:
            if server_name in self.connections:
                await self.connections[server_name].aclose()
                del self.connections[server_name]
                logger.info(f"Disconnected from MCP server: {server_name}")
        except Exception as e:
            logger.error(f"Error disconnecting from server {server_name}: {e}")
    
    async def send_request(self, server_name: str, method: str, resource: str, 
                          data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a request to an MCP server."""
        try:
            if server_name not in self.connections:
                raise ValueError(f"Not connected to server: {server_name}")
            
            client = self.connections[server_name]
            
            # Construct MCP request
            mcp_request = {
                "jsonrpc": "2.0",
                "id": f"{method}_{resource}_{asyncio.current_task().get_name()}",
                "method": method,
                "params": {
                    "resource": resource,
                    **(data or {})
                }
            }
            
            # Send request
            response = await client.post("/rpc", json=mcp_request)
            response.raise_for_status()
            
            result = response.json()
            
            # Handle MCP response format
            if "error" in result:
                raise Exception(f"MCP error: {result['error']}")
            
            return result.get("result", {})
            
        except Exception as e:
            logger.error(f"Error sending request to {server_name}: {e}")
            raise
    
    async def list_resources(self, server_name: str) -> List[Dict[str, Any]]:
        """List available resources on an MCP server."""
        try:
            result = await self.send_request(server_name, "resources/list", "")
            return result.get("resources", [])
        except Exception as e:
            logger.error(f"Error listing resources from {server_name}: {e}")
            return []
    
    async def get_resource(self, server_name: str, resource_uri: str) -> Dict[str, Any]:
        """Get a specific resource from an MCP server."""
        try:
            result = await self.send_request(
                server_name, 
                "resources/read", 
                resource_uri
            )
            return result
        except Exception as e:
            logger.error(f"Error getting resource {resource_uri} from {server_name}: {e}")
            raise
    
    async def call_tool(self, server_name: str, tool_name: str, 
                       arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool on an MCP server."""
        try:
            result = await self.send_request(
                server_name,
                "tools/call",
                tool_name,
                {"arguments": arguments}
            )
            return result
        except Exception as e:
            logger.error(f"Error calling tool {tool_name} on {server_name}: {e}")
            raise
    
    async def get_server_capabilities(self, server_name: str) -> Dict[str, Any]:
        """Get capabilities of an MCP server."""
        try:
            result = await self.send_request(server_name, "initialize", "")
            return result.get("capabilities", {})
        except Exception as e:
            logger.error(f"Error getting capabilities from {server_name}: {e}")
            return {}
    
    def is_connected(self, server_name: str) -> bool:
        """Check if connected to a specific server."""
        return server_name in self.connections
    
    def get_connected_servers(self) -> List[str]:
        """Get list of currently connected servers."""
        return list(self.connections.keys())