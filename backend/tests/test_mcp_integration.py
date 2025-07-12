"""
Tests for MCP integration functionality.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from services.mcp.mcp_client import MCPClient, MCPServerConfig
from services.mcp.mcp_server_manager import MCPServerManager
from services.mcp.resource_manager import MCPResourceManager
from services.agent_mcp_bridge import AgentMCPBridge
from models.agent import AgentRole


@pytest.fixture
async def mcp_client():
    """Create a test MCP client."""
    client = MCPClient()
    await client.initialize()
    yield client
    await client.shutdown()


@pytest.fixture
async def mcp_server_manager():
    """Create a test MCP server manager."""
    manager = MCPServerManager()
    # Mock the configuration loading to avoid file dependency
    with patch.object(manager, 'load_server_configurations'):
        await manager.initialize()
    yield manager
    await manager.shutdown()


@pytest.fixture
async def mcp_resource_manager():
    """Create a test MCP resource manager."""
    manager = MCPResourceManager()
    # Mock the server manager initialization
    with patch.object(manager.server_manager, 'initialize'):
        await manager.initialize()
    yield manager
    await manager.shutdown()


@pytest.fixture
async def agent_mcp_bridge():
    """Create a test agent MCP bridge."""
    bridge = AgentMCPBridge()
    # Mock the resource manager initialization
    with patch.object(bridge.resource_manager, 'initialize'):
        await bridge.initialize()
    yield bridge
    await bridge.shutdown()


class TestMCPClient:
    """Test MCP client functionality."""
    
    def test_server_config_creation(self):
        """Test creating server configurations."""
        config = MCPServerConfig(
            name="test_server",
            url="http://localhost:3001",
            capabilities=["calendar"],
            timeout=30
        )
        
        assert config.name == "test_server"
        assert config.url == "http://localhost:3001"
        assert "calendar" in config.capabilities
        assert config.timeout == 30
    
    async def test_client_initialization(self, mcp_client):
        """Test MCP client initialization."""
        assert mcp_client.initialized is True
        assert mcp_client.servers == {}
        assert mcp_client.connections == {}
    
    def test_add_server_config(self, mcp_client):
        """Test adding server configurations."""
        config = MCPServerConfig(
            name="test_calendar",
            url="http://localhost:3001",
            capabilities=["calendar"]
        )
        
        mcp_client.add_server(config)
        assert "test_calendar" in mcp_client.servers
        assert mcp_client.servers["test_calendar"] == config


class TestMCPServerManager:
    """Test MCP server manager functionality."""
    
    async def test_server_manager_initialization(self, mcp_server_manager):
        """Test server manager initialization."""
        assert mcp_server_manager.client is not None
        assert mcp_server_manager.server_configs == {}
    
    def test_server_status(self, mcp_server_manager):
        """Test getting server status."""
        status = mcp_server_manager.get_server_status()
        assert isinstance(status, dict)
        # Should be empty since no servers are configured in tests
        assert len(status) == 0


class TestMCPResourceManager:
    """Test MCP resource manager functionality."""
    
    async def test_resource_manager_initialization(self, mcp_resource_manager):
        """Test resource manager initialization."""
        assert mcp_resource_manager.server_manager is not None
        assert mcp_resource_manager.resource_cache == {}
        assert mcp_resource_manager.cache_enabled is True
    
    def test_cache_key_generation(self, mcp_resource_manager):
        """Test cache key generation."""
        key = mcp_resource_manager._get_cache_key("server1", "events")
        assert key == "server1:events"
        
        key_with_params = mcp_resource_manager._get_cache_key(
            "server1", "events", {"start": "2024-01-01"}
        )
        assert "start=2024-01-01" in key_with_params
    
    def test_cache_stats(self, mcp_resource_manager):
        """Test cache statistics."""
        stats = mcp_resource_manager.get_cache_stats()
        assert "total_items" in stats
        assert "expired_items" in stats
        assert "valid_items" in stats
        assert stats["total_items"] == 0  # Empty cache


class TestAgentMCPBridge:
    """Test agent MCP bridge functionality."""
    
    async def test_bridge_initialization(self, agent_mcp_bridge):
        """Test bridge initialization."""
        assert agent_mcp_bridge.resource_manager is not None
        assert isinstance(agent_mcp_bridge.agent_capabilities, dict)
        assert isinstance(agent_mcp_bridge.command_handlers, dict)
    
    def test_agent_capabilities(self, agent_mcp_bridge):
        """Test agent capability mapping."""
        exec_caps = agent_mcp_bridge.get_agent_capabilities(AgentRole.EXECUTIVE_OFFICER)
        assert "calendar" in exec_caps
        assert "tasks" in exec_caps
        assert "planning" in exec_caps
        
        science_caps = agent_mcp_bridge.get_agent_capabilities(AgentRole.SCIENCE_OFFICER)
        assert "files" in science_caps
        assert "research" in science_caps
        assert "analysis" in science_caps
        
        ops_caps = agent_mcp_bridge.get_agent_capabilities(AgentRole.OPERATIONS_OFFICER)
        assert "tasks" in ops_caps
        assert "workflow" in ops_caps
        assert "automation" in ops_caps
    
    def test_agent_authorization(self, agent_mcp_bridge):
        """Test agent command authorization."""
        # Executive officer should be able to access calendar
        can_access = agent_mcp_bridge._agent_can_execute(
            AgentRole.EXECUTIVE_OFFICER, "get_calendar"
        )
        assert can_access is True
        
        # Science officer should not be able to access calendar
        can_access = agent_mcp_bridge._agent_can_execute(
            AgentRole.SCIENCE_OFFICER, "get_calendar"
        )
        assert can_access is False
        
        # Science officer should be able to access files
        can_access = agent_mcp_bridge._agent_can_execute(
            AgentRole.SCIENCE_OFFICER, "list_files"
        )
        assert can_access is True
    
    async def test_command_execution_unauthorized(self, agent_mcp_bridge):
        """Test command execution with unauthorized agent."""
        result = await agent_mcp_bridge.execute_agent_command(
            "test_agent",
            AgentRole.SCIENCE_OFFICER,
            "get_calendar",
            {}
        )
        
        assert result["success"] is False
        assert "not authorized" in result["error"]
    
    async def test_command_execution_unknown_command(self, agent_mcp_bridge):
        """Test command execution with unknown command."""
        result = await agent_mcp_bridge.execute_agent_command(
            "test_agent",
            AgentRole.EXECUTIVE_OFFICER,
            "unknown_command",
            {}
        )
        
        assert result["success"] is False
        assert "Unknown command" in result["error"]


@pytest.mark.asyncio
async def test_integration_flow():
    """Test complete MCP integration flow."""
    # This test simulates the complete flow without actual MCP servers
    
    # Create components
    bridge = AgentMCPBridge()
    
    # Mock the resource manager to avoid actual server connections
    with patch.object(bridge.resource_manager, 'initialize'):
        await bridge.initialize()
    
    try:
        # Test agent capabilities
        exec_caps = bridge.get_agent_capabilities(AgentRole.EXECUTIVE_OFFICER)
        assert "calendar" in exec_caps
        
        # Test unauthorized command
        result = await bridge.execute_agent_command(
            "science_agent",
            AgentRole.SCIENCE_OFFICER,
            "get_calendar",
            {}
        )
        assert result["success"] is False
        
        # Test unknown command
        result = await bridge.execute_agent_command(
            "exec_agent",
            AgentRole.EXECUTIVE_OFFICER,
            "nonexistent_command",
            {}
        )
        assert result["success"] is False
        
    finally:
        await bridge.shutdown()


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])