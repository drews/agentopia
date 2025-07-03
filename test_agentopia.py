#!/usr/bin/env python3

import pytest
import asyncio
import json
from datetime import datetime

from virtual_env_db import DatabaseVirtualEnvironment
from database import DatabaseManager, AgentStateEnum, RoomTypeEnum

class TestVirtualEnvironment:
    
    @pytest.fixture
    async def env(self):
        """Create a test environment with in-memory database"""
        # Use SQLite in-memory for testing
        test_db = DatabaseManager("sqlite+aiosqlite:///:memory:")
        test_env = DatabaseVirtualEnvironment(test_db)
        await test_env.start()
        yield test_env
        await test_env.stop()
    
    @pytest.mark.asyncio
    async def test_environment_startup(self, env):
        """Test that environment starts correctly"""
        assert env.running == True
        rooms = await env.get_all_rooms()
        assert len(rooms) >= 5  # Default rooms
        room_ids = [room.id for room in rooms]
        assert "central_plaza" in room_ids
        assert "workshop" in room_ids
    
    @pytest.mark.asyncio
    async def test_agent_creation(self, env):
        """Test agent creation"""
        agent_id = await env.create_agent("TestAgent", {"role": "tester"})
        
        agent = await env.get_agent(agent_id)
        assert agent is not None
        assert agent.name == "TestAgent"
        assert agent.state == AgentStateEnum.IDLE.value
        assert agent.properties["role"] == "tester"
    
    @pytest.mark.asyncio
    async def test_room_navigation(self, env):
        """Test agent room navigation"""
        agent_id = await env.create_agent("Navigator")
        
        # Enter room
        success = await env.agent_enter_room(agent_id, "workshop")
        assert success == True
        
        agent = await env.get_agent(agent_id)
        assert agent.current_room == "workshop"
        
        workshop = await env.get_room("workshop")
        assert agent_id in workshop.agents
        
        # Move to different room
        success = await env.agent_enter_room(agent_id, "central_plaza")
        assert success == True
        
        agent = await env.get_agent(agent_id)
        assert agent.current_room == "central_plaza"
        
        workshop = await env.get_room("workshop")
        central_plaza = await env.get_room("central_plaza")
        assert agent_id not in workshop.agents
        assert agent_id in central_plaza.agents
    
    @pytest.mark.asyncio
    async def test_agent_interaction(self, env):
        """Test agent interactions"""
        agent_id = await env.create_agent("Chatter")
        await env.agent_enter_room(agent_id, "central_plaza")
        
        initial_interactions = await env.db.get_interactions(limit=1000)
        initial_count = len(initial_interactions)
        
        success = await env.agent_interact(agent_id, "Hello world!", "greeting")
        assert success == True
        
        interactions = await env.db.get_interactions(limit=1000)
        assert len(interactions) == initial_count + 2  # room_entry + interaction
        
        # Find the greeting interaction
        greeting_interactions = [i for i in interactions if i.interaction_type == "greeting"]
        assert len(greeting_interactions) >= 1
        latest_interaction = greeting_interactions[0]
        assert latest_interaction.agent_id == agent_id
        assert latest_interaction.content == "Hello world!"
        assert latest_interaction.interaction_type == "greeting"
    
    @pytest.mark.asyncio
    async def test_mcp_tool_usage(self, env):
        """Test MCP tool usage in MCP-enabled rooms"""
        agent_id = await env.create_agent("ToolUser")
        
        # Enter MCP-enabled room
        await env.agent_enter_room(agent_id, "productivity_workshop")
        
        # Use a tool
        result = await env.agent_use_tool(agent_id, "calendar", {
            "event": "Test Meeting",
            "time": "2:00 PM"
        })
        
        assert result["status"] == "success"
        assert "Calendar event created" in result["results"]
        
        # Check interaction was logged
        interactions = await env.db.get_interactions(agent_id=agent_id, limit=10)
        tool_interactions = [i for i in interactions if i.interaction_type == "tool_usage"]
        assert len(tool_interactions) > 0
        assert tool_interactions[0].agent_id == agent_id


class TestDatabaseIntegration:
    
    @pytest.mark.asyncio
    async def test_database_persistence(self):
        """Test that data persists in database"""
        # Use SQLite in-memory for testing
        test_db = DatabaseManager("sqlite+aiosqlite:///:memory:")
        env = DatabaseVirtualEnvironment(test_db)
        await env.start()
        
        try:
            # Create agent
            agent_id = await env.create_agent("PersistentAgent", {"role": "tester"})
            
            # Enter room and interact
            await env.agent_enter_room(agent_id, "central_plaza")
            await env.agent_interact(agent_id, "Testing persistence")
            
            # Verify data exists in database
            agent = await env.get_agent(agent_id)
            assert agent is not None
            assert agent.name == "PersistentAgent"
            assert agent.current_room == "central_plaza"
            
            interactions = await env.db.get_interactions(agent_id=agent_id)
            assert len(interactions) >= 1
            
            # Verify room state
            room = await env.get_room("central_plaza")
            assert agent_id in room.agents
            
        finally:
            await env.stop()
    
    @pytest.mark.asyncio
    async def test_environment_status(self):
        """Test environment status with database backend"""
        test_db = DatabaseManager("sqlite+aiosqlite:///:memory:")
        env = DatabaseVirtualEnvironment(test_db)
        await env.start()
        
        try:
            # Create some test data
            agent1_id = await env.create_agent("Agent1")
            agent2_id = await env.create_agent("Agent2")
            
            await env.agent_enter_room(agent1_id, "workshop")
            await env.agent_enter_room(agent2_id, "central_plaza")
            
            # Get status
            status = await env.get_environment_status()
            
            assert status["running"] == True
            assert status["total_agents"] == 2
            assert status["total_rooms"] >= 5
            assert "workshop" in status["rooms"]
            assert "central_plaza" in status["rooms"]
            
            # Check room occupancy
            workshop_status = status["rooms"]["workshop"]
            assert len(workshop_status["agents"]) == 1
            assert "Agent1" in workshop_status["agents"]
            
        finally:
            await env.stop()


# Utility functions for testing
def run_tests():
    """Run all tests"""
    import subprocess
    import sys
    
    print("🧪 Running Agentopia tests...")
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "test_agentopia.py", 
            "-v", 
            "--tb=short"
        ], check=False)
        
        if result.returncode == 0:
            print("✅ All tests passed!")
        else:
            print("❌ Some tests failed")
        
        return result.returncode == 0
        
    except FileNotFoundError:
        print("❌ pytest not found. Install with: pip install pytest pytest-asyncio")
        return False

if __name__ == "__main__":
    run_tests()