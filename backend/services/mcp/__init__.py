"""
MCP (Model Context Protocol) integration services for Agentopia.

This package provides the integration layer between Agentopia's agents
and external MCP servers for real-world data access.
"""

from .mcp_client import MCPClient
from .mcp_server_manager import MCPServerManager

__all__ = ['MCPClient', 'MCPServerManager']