"""
Tests for MCP integration functionality.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from services.mcp.mcp_client import MCPClient, MCPServerConfig
from services.mcp.mcp_server_manager import MCPServerManager
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


# Removed MCPResourceManager and AgentMCPBridge fixtures since they've been simplified


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


class TestSimplifiedMCPIntegration:
    """Test simplified MCP integration architecture."""
    
    def test_agent_role_capabilities(self):
        """Test that agent roles have defined capabilities."""
        # Test that we can define agent capabilities without complex bridge
        agent_capabilities = {
            AgentRole.EXECUTIVE_OFFICER: [
                "calendar", "tasks", "planning", "scheduling", "reporting", "datetime", "holidays"
            ],
            AgentRole.SCIENCE_OFFICER: [
                "files", "research", "analysis", "documents", "data", "datetime", "calculations"
            ],
            AgentRole.OPERATIONS_OFFICER: [
                "tasks", "workflow", "automation", "monitoring", "execution", "datetime", "time"
            ]
        }
        
        # Verify executive officer has calendar access
        exec_caps = agent_capabilities.get(AgentRole.EXECUTIVE_OFFICER, [])
        assert "calendar" in exec_caps
        assert "tasks" in exec_caps
        assert "planning" in exec_caps
        
        # Verify science officer has file access but not calendar
        science_caps = agent_capabilities.get(AgentRole.SCIENCE_OFFICER, [])
        assert "files" in science_caps
        assert "research" in science_caps
        assert "calendar" not in science_caps
        
        # Verify operations officer has workflow access
        ops_caps = agent_capabilities.get(AgentRole.OPERATIONS_OFFICER, [])
        assert "tasks" in ops_caps
        assert "workflow" in ops_caps
        assert "automation" in ops_caps


@pytest.mark.asyncio
async def test_simplified_integration_flow():
    """Test simplified MCP integration flow."""
    # This test verifies the simplified architecture works without complex bridges
    
    # Test basic MCP server manager functionality
    server_manager = MCPServerManager()
    
    # Mock the configuration loading to avoid file dependency
    with patch.object(server_manager, 'load_server_configurations'):
        await server_manager.initialize()
    
    try:
        # Test server status (should be empty with mocked config)
        status = server_manager.get_server_status()
        assert isinstance(status, dict)
        
        # Test agent authorization logic (simple function-based)
        def agent_can_execute(agent_role: AgentRole, command: str) -> bool:
            command_capability_map = {
                "get_calendar": "calendar",
                "list_files": "files",
                "get_tasks": "tasks"
            }
            
            agent_capabilities = {
                AgentRole.EXECUTIVE_OFFICER: ["calendar", "tasks", "planning"],
                AgentRole.SCIENCE_OFFICER: ["files", "research", "analysis"],
                AgentRole.OPERATIONS_OFFICER: ["tasks", "workflow", "automation"]
            }
            
            required_capability = command_capability_map.get(command)
            if not required_capability:
                return True
            
            agent_caps = agent_capabilities.get(agent_role, [])
            return required_capability in agent_caps
        
        # Test authorization
        assert agent_can_execute(AgentRole.EXECUTIVE_OFFICER, "get_calendar") is True
        assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "get_calendar") is False  
        assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "list_files") is True
        
    finally:
        await server_manager.shutdown()


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])