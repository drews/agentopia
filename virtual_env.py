#!/usr/bin/env python3

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class AgentState(Enum):
    IDLE = "idle"
    ACTIVE = "active"
    THINKING = "thinking"
    INTERACTING = "interacting"

class RoomType(Enum):
    WORKSHOP = "workshop"
    REFLECTION = "reflection"
    COLLABORATION = "collaboration"
    LEARNING = "learning"
    MEDITATION = "meditation"

@dataclass
class Agent:
    id: str
    name: str
    state: AgentState
    current_room: Optional[str]
    properties: Dict[str, Any]
    created_at: datetime
    last_active: datetime

@dataclass
class Room:
    id: str
    name: str
    type: RoomType
    description: str
    agents: List[str]
    properties: Dict[str, Any]
    created_at: datetime
    max_capacity: int = 10

@dataclass
class Interaction:
    id: str
    agent_id: str
    room_id: str
    content: str
    interaction_type: str
    timestamp: datetime
    metadata: Dict[str, Any]

class VirtualEnvironment:
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.rooms: Dict[str, Room] = {}
        self.interactions: List[Interaction] = []
        self.running = False
        
    async def start(self):
        self.running = True
        print("🌟 Virtual Environment Started")
        await self._create_default_rooms()
        
    async def stop(self):
        self.running = False
        print("🌙 Virtual Environment Stopped")
        
    async def _create_default_rooms(self):
        default_rooms = [
            ("central_plaza", "Central Plaza", RoomType.COLLABORATION, "The main gathering space for agents"),
            ("workshop", "Workshop", RoomType.WORKSHOP, "A space for focused work and creation"),
            ("reflection_chamber", "Reflection Chamber", RoomType.REFLECTION, "A quiet space for contemplation"),
            ("learning_hall", "Learning Hall", RoomType.LEARNING, "A space for knowledge acquisition and sharing"),
            ("meditation_garden", "Meditation Garden", RoomType.MEDITATION, "A peaceful space for mindfulness")
        ]
        
        for room_id, name, room_type, description in default_rooms:
            await self.create_room(room_id, name, room_type, description)
    
    async def create_agent(self, name: str, properties: Dict[str, Any] = None) -> str:
        agent_id = str(uuid.uuid4())
        agent = Agent(
            id=agent_id,
            name=name,
            state=AgentState.IDLE,
            current_room=None,
            properties=properties or {},
            created_at=datetime.now(),
            last_active=datetime.now()
        )
        self.agents[agent_id] = agent
        print(f"🤖 Agent '{name}' created with ID: {agent_id}")
        return agent_id
    
    async def create_room(self, room_id: str, name: str, room_type: RoomType, description: str, max_capacity: int = 10):
        room = Room(
            id=room_id,
            name=name,
            type=room_type,
            description=description,
            agents=[],
            properties={},
            created_at=datetime.now(),
            max_capacity=max_capacity
        )
        self.rooms[room_id] = room
        print(f"🏠 Room '{name}' created: {description}")
    
    async def agent_enter_room(self, agent_id: str, room_id: str) -> bool:
        if agent_id not in self.agents or room_id not in self.rooms:
            return False
            
        agent = self.agents[agent_id]
        room = self.rooms[room_id]
        
        if len(room.agents) >= room.max_capacity:
            print(f"❌ Room '{room.name}' is at capacity")
            return False
        
        if agent.current_room:
            await self.agent_leave_room(agent_id, agent.current_room)
        
        agent.current_room = room_id
        room.agents.append(agent_id)
        agent.last_active = datetime.now()
        
        await self.log_interaction(agent_id, room_id, f"entered {room.name}", "room_entry")
        print(f"🚪 {agent.name} entered {room.name}")
        return True
    
    async def agent_leave_room(self, agent_id: str, room_id: str):
        if agent_id in self.agents and room_id in self.rooms:
            agent = self.agents[agent_id]
            room = self.rooms[room_id]
            
            if agent_id in room.agents:
                room.agents.remove(agent_id)
            agent.current_room = None
            
            await self.log_interaction(agent_id, room_id, f"left {room.name}", "room_exit")
            print(f"🚪 {agent.name} left {room.name}")
    
    async def agent_interact(self, agent_id: str, content: str, interaction_type: str = "general"):
        if agent_id not in self.agents:
            return False
            
        agent = self.agents[agent_id]
        if not agent.current_room:
            print(f"❌ {agent.name} must be in a room to interact")
            return False
        
        agent.state = AgentState.INTERACTING
        agent.last_active = datetime.now()
        
        await self.log_interaction(agent_id, agent.current_room, content, interaction_type)
        
        room = self.rooms[agent.current_room]
        print(f"💬 [{room.name}] {agent.name}: {content}")
        
        agent.state = AgentState.ACTIVE
        return True
    
    async def log_interaction(self, agent_id: str, room_id: str, content: str, interaction_type: str, metadata: Dict[str, Any] = None):
        interaction = Interaction(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            room_id=room_id,
            content=content,
            interaction_type=interaction_type,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        self.interactions.append(interaction)
    
    def get_room_status(self, room_id: str) -> Dict[str, Any]:
        if room_id not in self.rooms:
            return {}
            
        room = self.rooms[room_id]
        agents_in_room = [self.agents[agent_id].name for agent_id in room.agents if agent_id in self.agents]
        
        return {
            "name": room.name,
            "type": room.type.value,
            "description": room.description,
            "occupancy": f"{len(room.agents)}/{room.max_capacity}",
            "agents": agents_in_room
        }
    
    def get_environment_status(self) -> Dict[str, Any]:
        return {
            "running": self.running,
            "total_agents": len(self.agents),
            "total_rooms": len(self.rooms),
            "total_interactions": len(self.interactions),
            "rooms": {room_id: self.get_room_status(room_id) for room_id in self.rooms}
        }

async def main():
    env = VirtualEnvironment()
    await env.start()
    
    agent1_id = await env.create_agent("Alice", {"role": "facilitator", "focus": "productivity"})
    agent2_id = await env.create_agent("Bob", {"role": "analyst", "focus": "reflection"})
    
    await env.agent_enter_room(agent1_id, "central_plaza")
    await env.agent_enter_room(agent2_id, "central_plaza")
    
    await env.agent_interact(agent1_id, "Welcome to Agentopia! Ready to explore?")
    await env.agent_interact(agent2_id, "Yes! This virtual space feels perfect for focused work.")
    
    await env.agent_enter_room(agent1_id, "workshop")
    await env.agent_interact(agent1_id, "Moving to the workshop for some deep focus time.")
    
    print("\n" + "="*50)
    print("ENVIRONMENT STATUS:")
    status = env.get_environment_status()
    print(json.dumps(status, indent=2, default=str))
    
    await env.stop()

if __name__ == "__main__":
    asyncio.run(main())