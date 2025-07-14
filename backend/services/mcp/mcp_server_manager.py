"""
MCP server manager for handling multiple MCP server connections.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from pathlib import Path
import json

from .mcp_client import MCPClient, MCPServerConfig

logger = logging.getLogger(__name__)


class MCPServerManager:
    """
    Manages multiple MCP server connections and their configurations.
    
    Handles server discovery, configuration loading, connection management,
    and provides a unified interface for accessing MCP resources.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        self.client = MCPClient()
        self.config_path = config_path or "config/mcp_config.json"
        self.server_configs: Dict[str, MCPServerConfig] = {}
        self.connection_retry_count = 3
        self.connection_retry_delay = 2.0
        
    async def initialize(self):
        """Initialize the MCP server manager."""
        try:
            await self.client.initialize()
            await self.load_server_configurations()
            await self.connect_to_all_servers()
            logger.info("MCP server manager initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MCP server manager: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown the MCP server manager."""
        try:
            await self.client.shutdown()
            logger.info("MCP server manager shut down")
        except Exception as e:
            logger.error(f"Error during MCP server manager shutdown: {e}")
    
    async def load_server_configurations(self):
        """Load MCP server configurations from file."""
        try:
            config_file = Path(self.config_path)
            
            if not config_file.exists():
                # Create default configuration
                await self.create_default_configuration()
                return
            
            with open(config_file, 'r') as f:
                config_data = json.load(f)
            
            self.server_configs.clear()
            
            # Get default timeout from config
            default_timeout = config_data.get("default_timeout", 30)
            self.connection_retry_count = config_data.get("retry_attempts", 3)
            self.connection_retry_delay = config_data.get("retry_delay", 2.0)
            
            for server_name, server_config in config_data.get("servers", {}).items():
                # Use external_url for client connections, fall back to url
                server_url = server_config.get("external_url", server_config["url"])
                
                config = MCPServerConfig(
                    name=server_name,
                    url=server_url,
                    auth=server_config.get("auth"),
                    capabilities=server_config.get("capabilities", []),
                    timeout=server_config.get("timeout", default_timeout)
                )
                
                self.server_configs[server_name] = config
                self.client.add_server(config)
            
            logger.info(f"Loaded {len(self.server_configs)} MCP server configurations")
            
        except Exception as e:
            logger.error(f"Error loading MCP server configurations: {e}")
            await self.create_default_configuration()
    
    async def create_default_configuration(self):
        """Create a default MCP server configuration file."""
        try:
            # Ensure config directory exists
            config_file = Path(self.config_path)
            config_file.parent.mkdir(parents=True, exist_ok=True)
            
            default_config = {
                "servers": {
                    "calendar": {
                        "url": "http://localhost:3001",
                        "capabilities": ["calendar", "events", "scheduling"],
                        "timeout": 30,
                        "description": "Calendar MCP server for Google Calendar, Outlook, etc."
                    },
                    "tasks": {
                        "url": "http://localhost:3002", 
                        "capabilities": ["tasks", "projects", "todo"],
                        "timeout": 30,
                        "description": "Task management MCP server for Todoist, Notion, etc."
                    },
                    "files": {
                        "url": "http://localhost:3003",
                        "capabilities": ["files", "documents", "storage"],
                        "timeout": 30,
                        "description": "File system MCP server for local files, cloud storage"
                    }
                },
                "default_timeout": 30,
                "retry_attempts": 3,
                "retry_delay": 2.0
            }
            
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            logger.info(f"Created default MCP configuration at {config_file}")
            
        except Exception as e:
            logger.error(f"Error creating default configuration: {e}")
    
    async def connect_to_all_servers(self):
        """Connect to all configured MCP servers."""
        connection_tasks = []
        
        for server_name in self.server_configs.keys():
            task = asyncio.create_task(self.connect_with_retry(server_name))
            connection_tasks.append(task)
        
        if connection_tasks:
            await asyncio.gather(*connection_tasks, return_exceptions=True)
    
    async def connect_with_retry(self, server_name: str) -> bool:
        """Connect to a server with retry logic."""
        for attempt in range(self.connection_retry_count):
            try:
                success = await self.client.connect_to_server(server_name)
                if success:
                    logger.info(f"Connected to MCP server: {server_name}")
                    return True
                    
            except Exception as e:
                logger.warning(f"Connection attempt {attempt + 1} failed for {server_name}: {e}")
            
            if attempt < self.connection_retry_count - 1:
                await asyncio.sleep(self.connection_retry_delay)
        
        logger.error(f"Failed to connect to MCP server after {self.connection_retry_count} attempts: {server_name}")
        return False
    
    async def get_available_resources(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get all available resources from all connected servers."""
        resources = {}
        
        for server_name in self.client.get_connected_servers():
            try:
                server_resources = await self.client.list_resources(server_name)
                resources[server_name] = server_resources
            except Exception as e:
                logger.error(f"Error getting resources from {server_name}: {e}")
                resources[server_name] = []
        
        return resources
    
    async def find_resource_server(self, resource_type: str) -> Optional[str]:
        """Find which server provides a specific resource type."""
        for server_name, config in self.server_configs.items():
            if resource_type in config.capabilities:
                if self.client.is_connected(server_name):
                    return server_name
        
        return None
    
    async def get_resource(self, resource_uri: str, preferred_server: Optional[str] = None) -> Dict[str, Any]:
        """Get a resource, automatically finding the appropriate server if needed."""
        try:
            # Try preferred server first
            if preferred_server and self.client.is_connected(preferred_server):
                return await self.client.get_resource(preferred_server, resource_uri)
            
            # Try to find a server that can handle this resource
            # For now, try all connected servers
            for server_name in self.client.get_connected_servers():
                try:
                    return await self.client.get_resource(server_name, resource_uri)
                except Exception:
                    continue  # Try next server
            
            raise Exception(f"No server could provide resource: {resource_uri}")
            
        except Exception as e:
            logger.error(f"Error getting resource {resource_uri}: {e}")
            raise
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any], 
                       preferred_server: Optional[str] = None) -> Dict[str, Any]:
        """Call a tool, automatically finding the appropriate server if needed."""
        try:
            # Try preferred server first
            if preferred_server and self.client.is_connected(preferred_server):
                return await self.client.call_tool(preferred_server, tool_name, arguments)
            
            # Try to find a server that has this tool
            for server_name in self.client.get_connected_servers():
                try:
                    return await self.client.call_tool(server_name, tool_name, arguments)
                except Exception:
                    continue  # Try next server
            
            raise Exception(f"No server could execute tool: {tool_name}")
            
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            raise
    
    def get_server_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all configured servers."""
        status = {}
        
        for server_name, config in self.server_configs.items():
            is_connected = self.client.is_connected(server_name)
            status[server_name] = {
                "name": server_name,
                "url": config.url,
                "connected": is_connected,
                "capabilities": config.capabilities,
                "timeout": config.timeout
            }
        
        return status
    
    async def reconnect_server(self, server_name: str) -> bool:
        """Reconnect to a specific server."""
        try:
            # Disconnect first if connected
            if self.client.is_connected(server_name):
                await self.client.disconnect_from_server(server_name)
            
            # Reconnect with retry
            return await self.connect_with_retry(server_name)
            
        except Exception as e:
            logger.error(f"Error reconnecting to server {server_name}: {e}")
            return False