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
    capabilities: List[str] = None
    auth: Optional[Dict[str, Any]] = None
    timeout: int = 30
    offline: bool = False

@dataclass  
class MCPGatewayConfig:
    """Configuration for MCP gateway connection."""
    url: str
    timeout: int = 30
    auth: Optional[Dict[str, Any]] = None


class MCPClient:
    """
    MCP client for communicating with MCP servers via gateway.
    
    Routes requests through a single MCP gateway using the pattern:
    /mcp/<server-name>/<endpoint>
    """
    
    def __init__(self):
        self.servers: Dict[str, MCPServerConfig] = {}
        self.gateway_config: Optional[MCPGatewayConfig] = None
        self.gateway_client: Optional[httpx.AsyncClient] = None
        self.initialized = False
        
    async def initialize(self):
        """Initialize the MCP client and connect to gateway."""
        try:
            if self.gateway_config:
                self.gateway_client = httpx.AsyncClient(
                    base_url=self.gateway_config.url,
                    timeout=self.gateway_config.timeout,
                    headers={"Content-Type": "application/json"}
                )
                
                # Test gateway connection
                response = await self.gateway_client.get("/health")
                response.raise_for_status()
                logger.info(f"Connected to MCP gateway: {self.gateway_config.url}")
            
            self.initialized = True
            logger.info("MCP client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MCP client: {e}")
            raise
            
    async def shutdown(self):
        """Shutdown the MCP client and close gateway connection."""
        try:
            if self.gateway_client:
                await self.gateway_client.aclose()
                self.gateway_client = None
            
            self.initialized = False
            logger.info("MCP client shut down")
        except Exception as e:
            logger.error(f"Error during MCP client shutdown: {e}")
    
    def set_gateway(self, config: MCPGatewayConfig):
        """Set the MCP gateway configuration."""
        self.gateway_config = config
        logger.info(f"Set MCP gateway: {config.url}")
    
    def add_server(self, config: MCPServerConfig):
        """Add an MCP server configuration."""
        self.servers[config.name] = config
        logger.info(f"Added MCP server configuration: {config.name}")
    
    async def connect_to_server(self, server_name: str) -> bool:
        """Check if an MCP server is available via gateway."""
        try:
            if not self.gateway_client:
                raise ValueError("Gateway not connected")
                
            if server_name not in self.servers:
                raise ValueError(f"Unknown server: {server_name}")
            
            # Test server availability via gateway
            response = await self.gateway_client.get(f"/mcp/{server_name}")
            response.raise_for_status()
            
            logger.info(f"MCP server available: {server_name}")
            return True
            
        except Exception as e:
            logger.error(f"MCP server {server_name} not available: {e}")
            return False
    
    async def disconnect_from_server(self, server_name: str):
        """Disconnect from an MCP server (no-op for gateway architecture)."""
        logger.info(f"Server {server_name} managed by gateway - no disconnect needed")
    
    async def send_request(self, server_name: str, method: str, resource: str, 
                          data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a request to an MCP server via gateway."""
        try:
            if not self.gateway_client:
                raise ValueError("Gateway not connected")
                
            if server_name not in self.servers:
                raise ValueError(f"Unknown server: {server_name}")
            
            # Route through gateway using /mcp/<server-name>/<endpoint> pattern
            if method == "tools/call":
                # Call tool endpoint: POST /mcp/<server-name>/mcp/tools/{tool_name}
                url = f"/mcp/{server_name}/mcp/tools/{resource}"
                response = await self.gateway_client.post(url, json=data or {})
                response.raise_for_status()
                return response.json()
                
            elif method == "resources/read":
                # Get resource endpoint: GET /mcp/<server-name>/mcp/resources/{resource_name}
                # Extract resource name from URI (e.g., "datetime://holidays" -> "holidays")
                resource_name = resource.split("://")[-1] if "://" in resource else resource
                url = f"/mcp/{server_name}/mcp/resources/{resource_name}"
                response = await self.gateway_client.get(url)
                response.raise_for_status()
                return response.json()
                
            elif method == "capabilities":
                # Get capabilities endpoint: GET /mcp/<server-name>/capabilities
                url = f"/mcp/{server_name}/capabilities"
                response = await self.gateway_client.get(url)
                response.raise_for_status()
                return response.json()
                
            elif method == "health":
                # Health check endpoint: GET /mcp/<server-name>/health
                url = f"/mcp/{server_name}/health"
                response = await self.gateway_client.get(url)
                response.raise_for_status()
                return response.json()
                
            else:
                # For other methods, try gateway's generic routing
                url = f"/mcp/{server_name}/{resource}"
                response = await self.gateway_client.post(url, json=data or {})
                response.raise_for_status()
                return response.json()
            
        except Exception as e:
            logger.error(f"Error sending request to {server_name} via gateway: {e}")
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
                arguments  # Pass arguments directly, not nested
            )
            return result
        except Exception as e:
            logger.error(f"Error calling tool {tool_name} on {server_name}: {e}")
            raise
    
    async def get_server_capabilities(self, server_name: str) -> Dict[str, Any]:
        """Get capabilities of an MCP server."""
        try:
            result = await self.send_request(server_name, "capabilities", "")
            return result
        except Exception as e:
            logger.error(f"Error getting capabilities from {server_name}: {e}")
            return {}
    
    def is_connected(self, server_name: str) -> bool:
        """Check if connected to a specific server via gateway."""
        return (self.gateway_client is not None and 
                server_name in self.servers)
    
    def get_connected_servers(self) -> List[str]:
        """Get list of available servers via gateway."""
        if self.gateway_client is None:
            return []
        return list(self.servers.keys())
    
    async def list_gateway_servers(self) -> Dict[str, Dict[str, Any]]:
        """List all servers available through the gateway."""
        try:
            if not self.gateway_client:
                raise ValueError("Gateway not connected")
                
            response = await self.gateway_client.get("/mcp")
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"Error listing gateway servers: {e}")
            return {}