"""
MCP resource manager for high-level resource access and caching.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field

from .mcp_server_manager import MCPServerManager

logger = logging.getLogger(__name__)


@dataclass
class CachedResource:
    """A cached MCP resource with metadata."""
    data: Dict[str, Any]
    server: str
    uri: str
    timestamp: datetime
    ttl: int = 300  # 5 minutes default TTL
    
    def is_expired(self) -> bool:
        """Check if the cached resource has expired."""
        return datetime.now() > self.timestamp + timedelta(seconds=self.ttl)


@dataclass 
class ResourceQuery:
    """Query parameters for MCP resources."""
    resource_type: str
    filters: Dict[str, Any] = field(default_factory=dict)
    limit: Optional[int] = None
    offset: Optional[int] = None
    sort_by: Optional[str] = None
    preferred_server: Optional[str] = None


class MCPResourceManager:
    """
    High-level MCP resource manager with caching and query optimization.
    
    Provides a simplified interface for accessing MCP resources with
    automatic caching, query optimization, and error handling.
    """
    
    def __init__(self):
        self.server_manager = MCPServerManager()
        self.resource_cache: Dict[str, CachedResource] = {}
        self.cache_enabled = True
        self.default_ttl = 300  # 5 minutes
        
    async def initialize(self):
        """Initialize the resource manager."""
        try:
            await self.server_manager.initialize()
            logger.info("MCP resource manager initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MCP resource manager: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown the resource manager."""
        try:
            await self.server_manager.shutdown()
            self.resource_cache.clear()
            logger.info("MCP resource manager shut down")
        except Exception as e:
            logger.error(f"Error during resource manager shutdown: {e}")
    
    def _get_cache_key(self, server: str, uri: str, query_params: Optional[Dict] = None) -> str:
        """Generate a cache key for a resource."""
        key = f"{server}:{uri}"
        if query_params:
            # Sort params for consistent cache keys
            sorted_params = sorted(query_params.items())
            params_str = "&".join(f"{k}={v}" for k, v in sorted_params)
            key += f"?{params_str}"
        return key
    
    def _get_cached_resource(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get a resource from cache if valid."""
        if not self.cache_enabled or cache_key not in self.resource_cache:
            return None
        
        cached = self.resource_cache[cache_key]
        if cached.is_expired():
            del self.resource_cache[cache_key]
            return None
        
        return cached.data
    
    def _cache_resource(self, cache_key: str, data: Dict[str, Any], 
                       server: str, uri: str, ttl: Optional[int] = None):
        """Cache a resource."""
        if not self.cache_enabled:
            return
        
        cached = CachedResource(
            data=data,
            server=server,
            uri=uri,
            timestamp=datetime.now(),
            ttl=ttl or self.default_ttl
        )
        
        self.resource_cache[cache_key] = cached
    
    async def get_calendar_events(self, start_date: Optional[str] = None, 
                                 end_date: Optional[str] = None,
                                 calendar_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get calendar events from calendar MCP server."""
        try:
            # Find calendar server
            server = await self.server_manager.find_resource_server("calendar")
            if not server:
                raise Exception("No calendar server available")
            
            # Build query parameters
            params = {}
            if start_date:
                params["start_date"] = start_date
            if end_date:
                params["end_date"] = end_date
            if calendar_id:
                params["calendar_id"] = calendar_id
            
            # Check cache
            cache_key = self._get_cache_key(server, "events", params)
            cached_data = self._get_cached_resource(cache_key)
            if cached_data:
                return cached_data.get("events", [])
            
            # Call calendar tool
            result = await self.server_manager.call_tool(
                "get_events", 
                params,
                preferred_server=server
            )
            
            # Cache result
            self._cache_resource(cache_key, result, server, "events", ttl=60)  # 1 minute TTL for events
            
            return result.get("events", [])
            
        except Exception as e:
            logger.error(f"Error getting calendar events: {e}")
            return []
    
    async def create_calendar_event(self, title: str, start_time: str, end_time: str,
                                   description: Optional[str] = None,
                                   calendar_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new calendar event."""
        try:
            server = await self.server_manager.find_resource_server("calendar")
            if not server:
                raise Exception("No calendar server available")
            
            params = {
                "title": title,
                "start_time": start_time,
                "end_time": end_time
            }
            
            if description:
                params["description"] = description
            if calendar_id:
                params["calendar_id"] = calendar_id
            
            result = await self.server_manager.call_tool(
                "create_event",
                params,
                preferred_server=server
            )
            
            # Invalidate events cache
            self._invalidate_cache_pattern(f"{server}:events")
            
            return result
            
        except Exception as e:
            logger.error(f"Error creating calendar event: {e}")
            raise
    
    async def get_tasks(self, project_id: Optional[str] = None, 
                       status: Optional[str] = None,
                       limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get tasks from task management MCP server."""
        try:
            server = await self.server_manager.find_resource_server("tasks")
            if not server:
                raise Exception("No task server available")
            
            params = {}
            if project_id:
                params["project_id"] = project_id
            if status:
                params["status"] = status
            if limit:
                params["limit"] = limit
            
            # Check cache
            cache_key = self._get_cache_key(server, "tasks", params)
            cached_data = self._get_cached_resource(cache_key)
            if cached_data:
                return cached_data.get("tasks", [])
            
            result = await self.server_manager.call_tool(
                "get_tasks",
                params, 
                preferred_server=server
            )
            
            # Cache result
            self._cache_resource(cache_key, result, server, "tasks", ttl=120)  # 2 minute TTL
            
            return result.get("tasks", [])
            
        except Exception as e:
            logger.error(f"Error getting tasks: {e}")
            return []
    
    async def create_task(self, title: str, description: Optional[str] = None,
                         project_id: Optional[str] = None,
                         due_date: Optional[str] = None,
                         priority: Optional[str] = None) -> Dict[str, Any]:
        """Create a new task."""
        try:
            server = await self.server_manager.find_resource_server("tasks")
            if not server:
                raise Exception("No task server available")
            
            params = {"title": title}
            
            if description:
                params["description"] = description
            if project_id:
                params["project_id"] = project_id
            if due_date:
                params["due_date"] = due_date
            if priority:
                params["priority"] = priority
            
            result = await self.server_manager.call_tool(
                "create_task",
                params,
                preferred_server=server
            )
            
            # Invalidate tasks cache
            self._invalidate_cache_pattern(f"{server}:tasks")
            
            return result
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            raise
    
    async def get_files(self, path: Optional[str] = None,
                       file_type: Optional[str] = None,
                       recursive: bool = False) -> List[Dict[str, Any]]:
        """Get files from file system MCP server."""
        try:
            server = await self.server_manager.find_resource_server("files")
            if not server:
                raise Exception("No file server available")
            
            params = {"recursive": recursive}
            if path:
                params["path"] = path
            if file_type:
                params["file_type"] = file_type
            
            # Check cache
            cache_key = self._get_cache_key(server, "files", params)
            cached_data = self._get_cached_resource(cache_key)
            if cached_data:
                return cached_data.get("files", [])
            
            result = await self.server_manager.call_tool(
                "list_files",
                params,
                preferred_server=server
            )
            
            # Cache result
            self._cache_resource(cache_key, result, server, "files", ttl=180)  # 3 minute TTL
            
            return result.get("files", [])
            
        except Exception as e:
            logger.error(f"Error getting files: {e}")
            return []
    
    async def read_file(self, file_path: str) -> Dict[str, Any]:
        """Read a file's content."""
        try:
            server = await self.server_manager.find_resource_server("files")
            if not server:
                raise Exception("No file server available")
            
            # Check cache
            cache_key = self._get_cache_key(server, f"file_content:{file_path}")
            cached_data = self._get_cached_resource(cache_key)
            if cached_data:
                return cached_data
            
            result = await self.server_manager.call_tool(
                "read_file",
                {"file_path": file_path},
                preferred_server=server
            )
            
            # Cache result
            self._cache_resource(cache_key, result, server, f"file_content:{file_path}", ttl=60)
            
            return result
            
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e}")
            raise
    
    def _invalidate_cache_pattern(self, pattern: str):
        """Invalidate cache entries matching a pattern."""
        keys_to_remove = [key for key in self.resource_cache.keys() if key.startswith(pattern)]
        for key in keys_to_remove:
            del self.resource_cache[key]
    
    def clear_cache(self):
        """Clear all cached resources."""
        self.resource_cache.clear()
        logger.info("MCP resource cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_items = len(self.resource_cache)
        expired_items = sum(1 for item in self.resource_cache.values() if item.is_expired())
        
        return {
            "total_items": total_items,
            "expired_items": expired_items,
            "valid_items": total_items - expired_items,
            "cache_enabled": self.cache_enabled,
            "default_ttl": self.default_ttl
        }
    
    async def get_server_status(self) -> Dict[str, Any]:
        """Get status of all MCP servers."""
        return self.server_manager.get_server_status()