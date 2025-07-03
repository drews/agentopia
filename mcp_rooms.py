#!/usr/bin/env python3

import asyncio
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from virtual_env import VirtualEnvironment, Room, RoomType

@dataclass
class MCPRoom:
    """Extended room with MCP client capabilities"""
    base_room: Room
    mcp_config: Dict[str, Any]
    active_sessions: List[str]
    tools_available: List[str]
    
class MCPVirtualEnvironment(VirtualEnvironment):
    """Extended virtual environment with MCP integration"""
    
    def __init__(self):
        super().__init__()
        self.mcp_rooms: Dict[str, MCPRoom] = {}
        
    async def create_mcp_room(self, room_id: str, name: str, room_type: RoomType, 
                             description: str, mcp_config: Dict[str, Any], 
                             max_capacity: int = 10):
        """Create a room with MCP client capabilities"""
        
        await self.create_room(room_id, name, room_type, description, max_capacity)
        
        mcp_room = MCPRoom(
            base_room=self.rooms[room_id],
            mcp_config=mcp_config,
            active_sessions=[],
            tools_available=mcp_config.get('tools', [])
        )
        
        self.mcp_rooms[room_id] = mcp_room
        print(f"🔌 MCP Room '{name}' created with tools: {mcp_room.tools_available}")
        
    async def agent_use_tool(self, agent_id: str, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Allow agent to use MCP tools in their current room"""
        
        if agent_id not in self.agents:
            return {"error": "Agent not found"}
            
        agent = self.agents[agent_id]
        if not agent.current_room:
            return {"error": "Agent must be in a room to use tools"}
            
        if agent.current_room not in self.mcp_rooms:
            return {"error": "Room does not support MCP tools"}
            
        mcp_room = self.mcp_rooms[agent.current_room]
        
        if tool_name not in mcp_room.tools_available:
            return {"error": f"Tool '{tool_name}' not available in this room"}
        
        # Simulate tool usage (in real implementation, this would call actual MCP client)
        result = await self._simulate_tool_call(tool_name, parameters)
        
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
            "knowledge_graph": {
                "status": "success",
                "results": ["Knowledge retrieved"],
                "data": {"topic": parameters.get("topic", ""), "relations": ["concept_1", "concept_2"]}
            }
        }
        
        return tool_responses.get(tool_name, {"status": "error", "message": "Tool not implemented"})
    
    async def setup_narrative_rooms(self):
        """Create rooms with specific narrative and tool configurations"""
        
        # Productivity Workshop with task management tools
        await self.create_mcp_room(
            "productivity_workshop",
            "Productivity Workshop", 
            RoomType.WORKSHOP,
            "A space for focused work with productivity tools",
            {
                "tools": ["calendar", "task_manager", "file_system", "timer"],
                "narrative_context": "professional_productivity",
                "max_focus_time": 120  # minutes
            }
        )
        
        # Research Library with knowledge tools
        await self.create_mcp_room(
            "research_library",
            "Research Library",
            RoomType.LEARNING,
            "A quiet space for research and knowledge work",
            {
                "tools": ["web_search", "knowledge_graph", "document_analysis", "citation_manager"],
                "narrative_context": "academic_research",
                "silence_level": "high"
            }
        )
        
        # Creative Studio with creative tools
        await self.create_mcp_room(
            "creative_studio",
            "Creative Studio",
            RoomType.WORKSHOP,
            "An inspiring space for creative work and ideation",
            {
                "tools": ["image_generation", "text_generation", "brainstorming", "mood_board"],
                "narrative_context": "creative_flow",
                "inspiration_level": "high"
            }
        )
        
        # Wellness Sanctuary with mindfulness tools
        await self.create_mcp_room(
            "wellness_sanctuary",
            "Wellness Sanctuary",
            RoomType.MEDITATION,
            "A peaceful space for self-care and reflection",
            {
                "tools": ["meditation_guide", "mood_tracker", "breathing_exercises", "gratitude_journal"],
                "narrative_context": "wellness_journey",
                "atmosphere": "calm"
            }
        )
    
    def get_room_narrative(self, room_id: str) -> Dict[str, Any]:
        """Get the narrative context and capabilities of a room"""
        
        if room_id not in self.mcp_rooms:
            return self.get_room_status(room_id)
        
        mcp_room = self.mcp_rooms[room_id]
        base_status = self.get_room_status(room_id)
        
        return {
            **base_status,
            "mcp_enabled": True,
            "tools_available": mcp_room.tools_available,
            "narrative_context": mcp_room.mcp_config.get("narrative_context", "general"),
            "active_sessions": len(mcp_room.active_sessions),
            "special_properties": {k: v for k, v in mcp_room.mcp_config.items() if k not in ["tools", "narrative_context"]}
        }

async def demo_mcp_environment():
    """Demonstrate the MCP-enhanced virtual environment"""
    
    env = MCPVirtualEnvironment()
    await env.start()
    await env.setup_narrative_rooms()
    
    # Create agents with different focuses
    alice_id = await env.create_agent("Alice", {"role": "productivity_coach", "focus": "task_management"})
    bob_id = await env.create_agent("Bob", {"role": "researcher", "focus": "knowledge_discovery"})
    carol_id = await env.create_agent("Carol", {"role": "creative", "focus": "ideation"})
    
    # Demonstrate agent movements and tool usage
    await env.agent_enter_room(alice_id, "productivity_workshop")
    await env.agent_interact(alice_id, "Ready to help with task management and scheduling!")
    
    result = await env.agent_use_tool(alice_id, "calendar", {"event": "Team standup", "time": "9:00 AM"})
    print(f"Tool result: {result}")
    
    await env.agent_enter_room(bob_id, "research_library")
    await env.agent_interact(bob_id, "Beginning research on productivity methodologies")
    
    result = await env.agent_use_tool(bob_id, "web_search", {"query": "productivity methodologies 2024"})
    print(f"Tool result: {result}")
    
    await env.agent_enter_room(carol_id, "creative_studio")
    await env.agent_interact(carol_id, "Exploring creative approaches to problem-solving")
    
    # Show narrative contexts
    print("\n" + "="*60)
    print("ROOM NARRATIVES:")
    for room_id in ["productivity_workshop", "research_library", "creative_studio", "wellness_sanctuary"]:
        narrative = env.get_room_narrative(room_id)
        print(f"\n{narrative['name']}:")
        print(f"  Context: {narrative.get('narrative_context', 'N/A')}")
        print(f"  Tools: {', '.join(narrative.get('tools_available', []))}")
        print(f"  Special: {narrative.get('special_properties', {})}")
    
    await env.stop()

if __name__ == "__main__":
    asyncio.run(demo_mcp_environment())