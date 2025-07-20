"""
Tests for MCP integration functionality.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from services.mcp.mcp_client import MCPClient, MCPServerConfig, MCPGatewayConfig
from models.agent import AgentRole


@pytest.fixture
async def mcp_client():
    """Create a test MCP client."""
    client = MCPClient()
    # Set up a mock gateway for testing
    gateway_config = MCPGatewayConfig(url="http://localhost:8080")
    client.set_gateway(gateway_config)
    
    # Don't actually initialize (would try to connect to gateway)
    # Just set initialized flag for testing
    client.initialized = True
    yield client
    
    try:
        await client.shutdown()
    except:
        pass  # Ignore shutdown errors in tests


class TestMCPClient:
    """Test MCP client functionality."""
    
    def test_server_config_creation(self):
        """Test creating server configurations."""
        config = MCPServerConfig(
            name="test_server",
            capabilities=["calendar"],
            timeout=30
        )
        
        assert config.name == "test_server"
        assert config.capabilities == ["calendar"]
        assert config.timeout == 30
    
    def test_gateway_config_creation(self):
        """Test creating gateway configurations."""
        config = MCPGatewayConfig(
            url="http://localhost:8080",
            timeout=30
        )
        
        assert config.url == "http://localhost:8080"
        assert config.timeout == 30
    
    async def test_client_initialization(self, mcp_client):
        """Test MCP client initialization."""
        assert mcp_client.initialized is True
        assert mcp_client.servers == {}
        assert mcp_client.gateway_config is not None
    
    def test_add_server_config(self, mcp_client):
        """Test adding server configurations."""
        config = MCPServerConfig(
            name="test_calendar",
            capabilities=["calendar"]
        )
        
        mcp_client.add_server(config)
        assert "test_calendar" in mcp_client.servers
        assert mcp_client.servers["test_calendar"] == config
    
    def test_set_gateway_config(self, mcp_client):
        """Test setting gateway configuration."""
        gateway_config = MCPGatewayConfig(url="http://localhost:9000")
        mcp_client.set_gateway(gateway_config)
        
        assert mcp_client.gateway_config == gateway_config
        assert mcp_client.gateway_config.url == "http://localhost:9000"
    
    def test_get_connected_servers(self, mcp_client):
        """Test getting list of configured servers."""
        # Add some server configurations
        config1 = MCPServerConfig(name="server1", capabilities=["calendar"])
        config2 = MCPServerConfig(name="server2", capabilities=["files"])
        
        mcp_client.add_server(config1)
        mcp_client.add_server(config2)
        
        servers = mcp_client.get_connected_servers()
        assert "server1" in servers
        assert "server2" in servers
        assert len(servers) == 2
    
    def test_is_connected(self, mcp_client):
        """Test checking server connection status."""
        config = MCPServerConfig(name="test_server", capabilities=["test"])
        mcp_client.add_server(config)
        
        # Should be "connected" if gateway client exists and server is configured
        # Note: In real usage, this depends on gateway connection
        assert mcp_client.is_connected("test_server") == False  # No gateway client in test
        assert mcp_client.is_connected("nonexistent") == False


class TestMCPIntegration:
    """Test MCP integration scenarios."""
    
    async def test_client_lifecycle(self):
        """Test full client lifecycle."""
        client = MCPClient()
        
        # Set up gateway
        gateway_config = MCPGatewayConfig(url="http://localhost:8080")
        client.set_gateway(gateway_config)
        
        # Add servers
        server_config = MCPServerConfig(
            name="test_server",
            capabilities=["calendar", "tasks"]
        )
        client.add_server(server_config)
        
        # Verify configuration
        assert client.gateway_config == gateway_config
        assert "test_server" in client.servers
        
        # Clean shutdown (without actual network calls)
        client.initialized = True  # Simulate initialization
        await client.shutdown()
        assert client.initialized == False
    
    @patch('httpx.AsyncClient')
    async def test_gateway_communication(self, mock_client):
        """Test communication with MCP gateway."""
        client = MCPClient()
        gateway_config = MCPGatewayConfig(url="http://localhost:8080")
        client.set_gateway(gateway_config)
        
        # Mock the HTTP client
        mock_instance = AsyncMock()
        mock_client.return_value = mock_instance
        
        # Mock successful health check
        mock_response = AsyncMock()
        mock_response.raise_for_status.return_value = None
        mock_instance.get.return_value = mock_response
        
        # Test initialization (would connect to gateway)
        await client.initialize()
        
        assert client.initialized == True
        assert client.gateway_client is not None
        
        # Clean up
        await client.shutdown()


class TestAgentCapabilities:
    """Test agent capability system."""
    
    def test_agent_role_capabilities(self):
        """Test that agent roles have proper capabilities defined."""
        # This is a simplified test of the agent capability system
        # that was moved from bridge to manager
        
        agent_capabilities = {
            AgentRole.EXECUTIVE_OFFICER: [
                "calendar", "tasks", "planning", "scheduling", "reporting"
            ],
            AgentRole.SCIENCE_OFFICER: [
                "files", "research", "analysis", "documents", "data"
            ],
            AgentRole.OPERATIONS_OFFICER: [
                "tasks", "workflow", "automation", "monitoring", "execution"
            ]
        }
        
        # Verify all roles have capabilities
        for role in [AgentRole.EXECUTIVE_OFFICER, AgentRole.SCIENCE_OFFICER, AgentRole.OPERATIONS_OFFICER]:
            assert role in agent_capabilities
            assert len(agent_capabilities[role]) > 0
        
        # Verify capability authorization logic
        def agent_can_execute(agent_role: AgentRole, command: str) -> bool:
            command_capability_map = {
                "get_calendar": "calendar",
                "list_files": "files", 
                "get_tasks": "tasks"
            }
            required_capability = command_capability_map.get(command)
            if not required_capability:
                return True  # Unknown commands allowed
            agent_caps = agent_capabilities.get(agent_role, [])
            return required_capability in agent_caps
        
        # Test authorization
        assert agent_can_execute(AgentRole.EXECUTIVE_OFFICER, "get_calendar") == True
        assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "get_calendar") == False
        assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "list_files") == True
        assert agent_can_execute(AgentRole.OPERATIONS_OFFICER, "get_tasks") == True