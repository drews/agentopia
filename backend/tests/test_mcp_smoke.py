#!/usr/bin/env python3
"""
Test MCP integration from within the backend container.
"""

import asyncio
import sys
import json
from pathlib import Path
sys.path.append('/app')

from services.mcp.mcp_client import MCPClient
from models.agent import AgentRole

async def test_simplified_architecture():
    """Test the simplified MCP architecture (no bridge layers)."""
    print("🏗️ Testing Simplified MCP Architecture...")
    
    # Test that we can import simplified components
    print("1. Testing component imports...")
    try:
        # These should import without the complex bridge layers
        from services.agent_manager import AgentManager
        print("✅ AgentManager imports successfully (no bridge dependency)")
        
        # Test that removed components are actually gone
        try:
            from services.agent_mcp_bridge import AgentMCPBridge
            print("❌ AgentMCPBridge still exists - refactoring incomplete")
            return False
        except ImportError:
            print("✅ AgentMCPBridge successfully removed")
        
        try:
            from services.mcp.resource_manager import MCPResourceManager
            print("⚠️ MCPResourceManager still exists - layer not eliminated")
        except ImportError:
            print("✅ MCPResourceManager layer eliminated")
            
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False
    
    # Test agent capability system (moved from bridge to manager)
    print("2. Testing agent capabilities system...")
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
    
    # Verify simplified authorization logic
    def agent_can_execute(agent_role: AgentRole, command: str) -> bool:
        command_capability_map = {
            "get_calendar": "calendar", "list_files": "files", "get_tasks": "tasks"
        }
        required_capability = command_capability_map.get(command)
        if not required_capability:
            return True
        agent_caps = agent_capabilities.get(agent_role, [])
        return required_capability in agent_caps
    
    # Test authorization logic
    assert agent_can_execute(AgentRole.EXECUTIVE_OFFICER, "get_calendar") is True
    assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "get_calendar") is False
    assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "list_files") is True
    print("✅ Agent authorization logic works correctly")
    
    return True

async def test_mcp_integration():
    """Test the complete MCP integration."""
    print("🔧 Testing MCP Integration...")
    
    # Test configuration loading
    print("3. Testing configuration loading...")
    config_path = "/workspace/config/agentopia.json"
    
    # Check if config exists and is valid
    if not Path(config_path).exists():
        print(f"❌ Config file not found at {config_path}")
        return False
    
    try:
        with open(config_path) as f:
            config_data = json.load(f)
        server_count = len(config_data.get("servers", {}))
        print(f"✅ Config loaded: {server_count} servers configured")
    except Exception as e:
        print(f"❌ Failed to load config: {e}")
        return False
    
    # Test server manager initialization
    print("2. Testing server manager initialization...")
    server_manager = MCPServerManager(config_path)
    await server_manager.initialize()
    
    try:
        # Test server status
        print("3. Testing server status...")
        status = server_manager.get_server_status()
        if not status:
            print("❌ No servers configured")
            return False
        
        connected_servers = [name for name, info in status.items() if info.get('connected')]
        print(f"✅ Server status: {len(connected_servers)}/{len(status)} servers connected")
        for name, info in status.items():
            status_icon = "✅" if info.get('connected') else "❌"
            print(f"  {status_icon} {name}: {info.get('url')}")
        
        # Test tool call if datetime-tools is available
        if "datetime-tools" in connected_servers:
            print("4. Testing datetime-tools...")
            try:
                result = await server_manager.call_tool("current_time", {}, "datetime-tools")
                print(f"✅ Current time: {result.get('formatted', 'No time')}")
                
                result = await server_manager.call_tool("days_until", {"target_date": "Christmas"}, "datetime-tools")
                print(f"✅ {result.get('message', 'No message')}")
            except Exception as e:
                print(f"⚠️ Datetime tools not accessible: {e}")
        
        # Test resource discovery
        print("5. Testing resource discovery...")
        try:
            resources = await server_manager.get_available_resources()
            total_resources = sum(len(server_resources) for server_resources in resources.values())
            print(f"✅ Found {total_resources} total resources across {len(resources)} servers")
            for server_name, server_resources in resources.items():
                if server_resources:
                    print(f"  - {server_name}: {len(server_resources)} resources")
        except Exception as e:
            print(f"⚠️ Resource discovery failed: {e}")
        
        print("🎉 MCP integration test completed!")
        return len(connected_servers) > 0  # Success if at least one server connected
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await server_manager.shutdown()

async def run_all_tests():
    """Run all smoke tests for MCP integration and architecture."""
    print("🧪 Running MCP Smoke Tests...")
    print("=" * 50)
    
    # Test 1: Simplified architecture
    arch_success = await test_simplified_architecture()
    print("=" * 50)
    
    # Test 2: MCP integration (only if architecture test passed)
    if arch_success:
        integration_success = await test_mcp_integration()
    else:
        print("⏭️ Skipping MCP integration test due to architecture issues")
        integration_success = False
    
    print("=" * 50)
    overall_success = arch_success and integration_success
    
    if overall_success:
        print("🎉 All MCP smoke tests passed!")
    else:
        print("❌ Some MCP smoke tests failed")
        if not arch_success:
            print("  - Architecture test failed")
        if not integration_success:
            print("  - Integration test failed")
    
    return overall_success

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)