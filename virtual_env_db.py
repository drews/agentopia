#!/usr/bin/env python3

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from database import DatabaseManager, AgentStateEnum, RoomTypeEnum, db_manager

@dataclass
class AgentData:
    """Agent data container for compatibility with existing code"""
    id: str
    name: str
    state: str
    current_room: Optional[str]
    properties: Dict[str, Any]
    created_at: datetime
    last_active: datetime

@dataclass
class RoomData:
    """Room data container for compatibility with existing code"""
    id: str
    name: str
    type: str
    description: str
    agents: List[str]
    properties: Dict[str, Any]
    created_at: datetime
    max_capacity: int
    mcp_enabled: bool = False
    tools_available: List[str] = None
    narrative_context: Optional[str] = None

class DatabaseVirtualEnvironment:
    """Virtual environment with database persistence"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db = db_manager or db_manager
        self.running = False
        
    async def start(self):
        """Start the virtual environment"""
        await self.db.initialize()
        self.running = True
        print("🌟 Database Virtual Environment Started")
        
    async def stop(self):
        """Stop the virtual environment"""
        await self.db.close()
        self.running = False
        print("🌙 Database Virtual Environment Stopped")
    
    async def create_agent(self, name: str, properties: Dict[str, Any] = None) -> str:
        """Create a new agent"""
        agent_id = await self.db.create_agent(name, properties)
        print(f"🤖 Agent '{name}' created with ID: {agent_id}")
        return agent_id
    
    async def get_agent(self, agent_id: str) -> Optional[AgentData]:
        """Get agent data"""
        agent = await self.db.get_agent(agent_id)
        if not agent:
            return None
            
        return AgentData(
            id=agent.id,
            name=agent.name,
            state=agent.state,
            current_room=agent.current_room_id,
            properties=agent.properties,
            created_at=agent.created_at,
            last_active=agent.last_active
        )
    
    async def get_all_agents(self) -> List[AgentData]:
        """Get all agents"""
        agents = await self.db.get_all_agents()
        return [
            AgentData(
                id=agent.id,
                name=agent.name,
                state=agent.state,
                current_room=agent.current_room_id,
                properties=agent.properties,
                created_at=agent.created_at,
                last_active=agent.last_active
            )
            for agent in agents
        ]
    
    async def get_room(self, room_id: str) -> Optional[RoomData]:
        """Get room data"""
        room = await self.db.get_room(room_id)
        if not room:
            return None
            
        agent_ids = [agent.id for agent in room.current_agents]
        
        return RoomData(
            id=room.id,
            name=room.name,
            type=room.type,
            description=room.description,
            agents=agent_ids,
            properties=room.properties,
            created_at=room.created_at,
            max_capacity=room.max_capacity,
            mcp_enabled=room.mcp_enabled,
            tools_available=room.tools_available or [],
            narrative_context=room.narrative_context
        )
    
    async def get_all_rooms(self) -> List[RoomData]:
        """Get all rooms"""
        rooms = await self.db.get_all_rooms()
        return [
            RoomData(
                id=room.id,
                name=room.name,
                type=room.type,
                description=room.description,
                agents=[agent.id for agent in room.current_agents],
                properties=room.properties,
                created_at=room.created_at,
                max_capacity=room.max_capacity,
                mcp_enabled=room.mcp_enabled,
                tools_available=room.tools_available or [],
                narrative_context=room.narrative_context
            )
            for room in rooms
        ]
    
    async def agent_enter_room(self, agent_id: str, room_id: str) -> bool:
        """Move agent to a room"""
        # Remove from current room first
        await self.agent_leave_room(agent_id)
        
        # Move to new room
        success = await self.db.move_agent_to_room(agent_id, room_id)
        
        if success:
            agent = await self.get_agent(agent_id)
            room = await self.get_room(room_id)
            
            if agent and room:
                await self.log_interaction(agent_id, room_id, f"entered {room.name}", "room_entry")
                print(f"🚪 {agent.name} entered {room.name}")
                
        return success
    
    async def agent_leave_room(self, agent_id: str):
        """Remove agent from their current room"""
        agent = await self.get_agent(agent_id)
        if agent and agent.current_room:
            room = await self.get_room(agent.current_room)
            if room:
                await self.log_interaction(agent_id, agent.current_room, f"left {room.name}", "room_exit")
                print(f"🚪 {agent.name} left {room.name}")
                
        await self.db.remove_agent_from_room(agent_id)
    
    async def agent_interact(self, agent_id: str, content: str, interaction_type: str = "general") -> bool:
        """Agent interaction"""
        agent = await self.get_agent(agent_id)
        if not agent:
            return False
            
        if not agent.current_room:
            print(f"❌ {agent.name} must be in a room to interact")
            return False
        
        # Update agent state
        await self.db.update_agent(agent_id, state=AgentStateEnum.INTERACTING.value)
        
        # Log interaction
        await self.log_interaction(agent_id, agent.current_room, content, interaction_type)
        
        room = await self.get_room(agent.current_room)
        if room:
            print(f"💬 [{room.name}] {agent.name}: {content}")
        
        # Update agent state back to active
        await self.db.update_agent(agent_id, state=AgentStateEnum.ACTIVE.value)
        return True
    
    async def log_interaction(self, agent_id: str, room_id: str, content: str, 
                            interaction_type: str, metadata: Dict[str, Any] = None):
        """Log an interaction to the database"""
        await self.db.create_interaction(agent_id, room_id, content, interaction_type, metadata)
    
    async def agent_use_tool(self, agent_id: str, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Agent tool usage with database logging"""
        agent = await self.get_agent(agent_id)
        if not agent:
            return {"error": "Agent not found"}
            
        if not agent.current_room:
            return {"error": "Agent must be in a room to use tools"}
        
        room = await self.get_room(agent.current_room)
        if not room:
            return {"error": "Room not found"}
            
        if not room.mcp_enabled:
            return {"error": "Room does not support MCP tools"}
            
        if tool_name not in room.tools_available:
            return {"error": f"Tool '{tool_name}' not available in this room"}
        
        # Simulate tool usage (same as before)
        result = await self._simulate_tool_call(tool_name, parameters)
        
        # Log the tool usage
        await self.log_interaction(
            agent_id,
            agent.current_room,
            f"used tool '{tool_name}' with result: {result}",
            "tool_usage",
            {"tool": tool_name, "parameters": parameters, "result": result}
        )
        
        return result
    
    async def _simulate_tool_call(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate MCP tool calls for demonstration"""
        tool_responses = {
            "web_search": {
                "status": "success",
                "results": ["Found 3 relevant articles", "Search completed successfully"],
                "data": {"query": parameters.get("query", ""), "results_count": 3}
            },
            "file_system": {
                "status": "success",
                "results": ["File operation completed"],
                "data": {"operation": parameters.get("operation", ""), "path": parameters.get("path", "")}
            },
            "calendar": {
                "status": "success", 
                "results": ["Calendar event created"],
                "data": {"event": parameters.get("event", ""), "time": parameters.get("time", "")}
            },
            "task_manager": {
                "status": "success",
                "results": ["Task operation completed"],
                "data": {"action": parameters.get("action", ""), "task": parameters.get("task", "")}
            },
            "knowledge_graph": {
                "status": "success",
                "results": ["Knowledge retrieved"],
                "data": {"topic": parameters.get("topic", ""), "relations": ["concept_1", "concept_2"]}
            }
        }
        
        return tool_responses.get(tool_name, {"status": "error", "message": "Tool not implemented"})
    
    async def get_room_status(self, room_id: str) -> Dict[str, Any]:
        """Get room status with agent names"""
        room = await self.get_room(room_id)
        if not room:
            return {}
        
        # Get agent names
        agent_names = []
        for agent_id in room.agents:
            agent = await self.get_agent(agent_id)
            if agent:
                agent_names.append(agent.name)
        
        return {
            "id": room.id,
            "name": room.name,
            "type": room.type,
            "description": room.description,
            "occupancy": f"{len(room.agents)}/{room.max_capacity}",
            "agents": agent_names,
            "mcp_enabled": room.mcp_enabled,
            "tools_available": room.tools_available,
            "narrative_context": room.narrative_context
        }
    
    async def get_environment_status(self) -> Dict[str, Any]:
        """Get overall environment status"""
        agents = await self.get_all_agents()
        rooms = await self.get_all_rooms()
        
        # Get recent interactions count
        interactions = await self.db.get_interactions(limit=1000)
        
        room_statuses = {}
        for room in rooms:
            room_statuses[room.id] = await self.get_room_status(room.id)
        
        return {
            "running": self.running,
            "total_agents": len(agents),
            "total_rooms": len(rooms),
            "total_interactions": len(interactions),
            "rooms": room_statuses
        }

async def demo_database_environment():
    """Demonstrate the database-backed virtual environment"""
    
    env = DatabaseVirtualEnvironment()
    await env.start()
    
    try:
        # Create agents
        alice_id = await env.create_agent("Alice", {"role": "facilitator", "focus": "productivity"})
        bob_id = await env.create_agent("Bob", {"role": "analyst", "focus": "reflection"})
        
        # Move agents to rooms
        await env.agent_enter_room(alice_id, "central_plaza")
        await env.agent_enter_room(bob_id, "central_plaza")
        
        # Agent interactions
        await env.agent_interact(alice_id, "Welcome to the database-backed Agentopia!")
        await env.agent_interact(bob_id, "Great! Now our interactions are persistent.")
        
        # Test MCP room
        await env.agent_enter_room(alice_id, "productivity_workshop")
        result = await env.agent_use_tool(alice_id, "calendar", {
            "event": "Database demo",
            "time": "2:00 PM"
        })
        print(f"Tool result: {result}")
        
        # Show environment status
        print("\n" + "="*50)
        print("DATABASE ENVIRONMENT STATUS:")
        status = await env.get_environment_status()
        print(json.dumps(status, indent=2, default=str))
        
    finally:
        await env.stop()

if __name__ == "__main__":
    asyncio.run(demo_database_environment())