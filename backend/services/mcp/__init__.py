"""
MCP (Model Context Protocol) integration services for Agentopia.

This package provides the integration layer between Agentopia's agents
and external MCP servers for real-world data access.
"""

from .mcp_client import MCPClient, MCPServerConfig
from .fastmcp_manager import MCPToolRegistry

__all__ = ['MCPClient', 'MCPServerConfig', 'MCPToolRegistry']