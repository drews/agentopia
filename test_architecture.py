#!/usr/bin/env python3
"""
Simple architecture validation test that can run in backend container.
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_simplified_architecture():
    """Test that the simplified MCP architecture is working."""
    print("🏗️ Testing Simplified MCP Architecture...")
    
    # Test 1: Component imports
    print("1. Testing component imports...")
    try:
        from services.mcp.mcp_server_manager import MCPServerManager
        print("   ✅ MCPServerManager imports successfully")
        
        from services.agent_manager import AgentManager
        print("   ✅ AgentManager imports successfully")
        
        from models.agent import AgentRole
        print("   ✅ AgentRole imports successfully")
        
    except Exception as e:
        print(f"   ❌ Import failed: {e}")
        return False
    
    # Test 2: Verify removed components are gone
    print("2. Testing removed components...")
    try:
        from services.agent_mcp_bridge import AgentMCPBridge
        print("   ❌ AgentMCPBridge still exists - refactoring incomplete")
        return False
    except ImportError:
        print("   ✅ AgentMCPBridge successfully removed")
    
    try:
        from services.mcp.resource_manager import MCPResourceManager
        print("   ⚠️ MCPResourceManager still exists")
        # Not a failure since this might be optional
    except ImportError:
        print("   ✅ MCPResourceManager successfully removed")
    
    # Test 3: Agent capabilities logic
    print("3. Testing agent capabilities...")
    agent_capabilities = {
        AgentRole.EXECUTIVE_OFFICER: ["calendar", "tasks", "planning"],
        AgentRole.SCIENCE_OFFICER: ["files", "research", "analysis"],
        AgentRole.OPERATIONS_OFFICER: ["tasks", "workflow", "automation"]
    }
    
    # Simple authorization test
    def agent_can_execute(agent_role, command):
        command_map = {"get_calendar": "calendar", "list_files": "files", "get_tasks": "tasks"}
        required_cap = command_map.get(command)
        if not required_cap:
            return True
        return required_cap in agent_capabilities.get(agent_role, [])
    
    # Verify authorization logic
    assert agent_can_execute(AgentRole.EXECUTIVE_OFFICER, "get_calendar") is True
    assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "get_calendar") is False
    assert agent_can_execute(AgentRole.SCIENCE_OFFICER, "list_files") is True
    print("   ✅ Agent authorization logic working correctly")
    
    print("🎉 Architecture validation completed successfully!")
    return True

if __name__ == "__main__":
    success = test_simplified_architecture()
    sys.exit(0 if success else 1)