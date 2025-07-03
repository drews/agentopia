#!/usr/bin/env python3

import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, ForeignKey, Boolean, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, selectinload
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import select, update, delete
import uuid

Base = declarative_base()

class AgentStateEnum(Enum):
    IDLE = "idle"
    ACTIVE = "active"
    THINKING = "thinking"
    INTERACTING = "interacting"

class RoomTypeEnum(Enum):
    WORKSHOP = "workshop"
    REFLECTION = "reflection"
    COLLABORATION = "collaboration"
    LEARNING = "learning"
    MEDITATION = "meditation"

# Database Models
class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    state = Column(String, default=AgentStateEnum.IDLE.value)
    current_room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    properties = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    current_room = relationship("Room", back_populates="current_agents")
    interactions = relationship("Interaction", back_populates="agent")

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text)
    properties = Column(JSON, default=dict)
    max_capacity = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # MCP-related fields
    mcp_enabled = Column(Boolean, default=False)
    tools_available = Column(JSON, default=list)
    narrative_context = Column(String, nullable=True)
    
    # Relationships
    current_agents = relationship("Agent", back_populates="current_room")
    interactions = relationship("Interaction", back_populates="room")

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    content = Column(Text, nullable=False)
    interaction_type = Column(String, default="general")
    metadata = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    agent = relationship("Agent", back_populates="interactions")
    room = relationship("Room", back_populates="interactions")

class DatabaseManager:
    def __init__(self, database_url: str = None):
        self.database_url = database_url or os.getenv(
            "DATABASE_URL", 
            "postgresql+asyncpg://agentopia:agentopia_dev@localhost:5432/agentopia"
        )
        self.engine = None
        self.async_session = None
        
    async def initialize(self):
        """Initialize database connection and create tables"""
        self.engine = create_async_engine(self.database_url, echo=False)
        self.async_session = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Create tables
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("📊 Database initialized")
        await self.create_default_rooms()
    
    async def close(self):
        """Close database connections"""
        if self.engine:
            await self.engine.dispose()
        print("📊 Database connections closed")
    
    async def create_default_rooms(self):
        """Create default rooms if they don't exist"""
        default_rooms = [
            {
                "id": "central_plaza",
                "name": "Central Plaza",
                "type": RoomTypeEnum.COLLABORATION.value,
                "description": "The main gathering space for agents",
                "mcp_enabled": False
            },
            {
                "id": "workshop", 
                "name": "Workshop",
                "type": RoomTypeEnum.WORKSHOP.value,
                "description": "A space for focused work and creation",
                "mcp_enabled": False
            },
            {
                "id": "reflection_chamber",
                "name": "Reflection Chamber", 
                "type": RoomTypeEnum.REFLECTION.value,
                "description": "A quiet space for contemplation",
                "mcp_enabled": False
            },
            {
                "id": "learning_hall",
                "name": "Learning Hall",
                "type": RoomTypeEnum.LEARNING.value, 
                "description": "A space for knowledge acquisition and sharing",
                "mcp_enabled": False
            },
            {
                "id": "meditation_garden",
                "name": "Meditation Garden",
                "type": RoomTypeEnum.MEDITATION.value,
                "description": "A peaceful space for mindfulness",
                "mcp_enabled": False
            },
            {
                "id": "productivity_workshop",
                "name": "Productivity Workshop",
                "type": RoomTypeEnum.WORKSHOP.value,
                "description": "A space for focused work with productivity tools",
                "mcp_enabled": True,
                "tools_available": ["calendar", "task_manager", "file_system", "timer"],
                "narrative_context": "professional_productivity"
            },
            {
                "id": "research_library",
                "name": "Research Library", 
                "type": RoomTypeEnum.LEARNING.value,
                "description": "A quiet space for research and knowledge work",
                "mcp_enabled": True,
                "tools_available": ["web_search", "knowledge_graph", "document_analysis", "citation_manager"],
                "narrative_context": "academic_research"
            },
            {
                "id": "creative_studio",
                "name": "Creative Studio",
                "type": RoomTypeEnum.WORKSHOP.value,
                "description": "An inspiring space for creative work and ideation", 
                "mcp_enabled": True,
                "tools_available": ["image_generation", "text_generation", "brainstorming", "mood_board"],
                "narrative_context": "creative_flow"
            },
            {
                "id": "wellness_sanctuary",
                "name": "Wellness Sanctuary",
                "type": RoomTypeEnum.MEDITATION.value,
                "description": "A peaceful space for self-care and reflection",
                "mcp_enabled": True,
                "tools_available": ["meditation_guide", "mood_tracker", "breathing_exercises", "gratitude_journal"],
                "narrative_context": "wellness_journey"
            }
        ]
        
        async with self.async_session() as session:
            for room_data in default_rooms:
                # Check if room exists
                result = await session.execute(
                    select(Room).where(Room.id == room_data["id"])
                )
                existing_room = result.scalar_one_or_none()
                
                if not existing_room:
                    room = Room(**room_data)
                    session.add(room)
            
            await session.commit()
    
    # Agent CRUD operations
    async def create_agent(self, name: str, properties: Dict[str, Any] = None) -> str:
        """Create a new agent"""
        async with self.async_session() as session:
            agent = Agent(
                name=name,
                properties=properties or {},
                state=AgentStateEnum.IDLE.value
            )
            session.add(agent)
            await session.commit()
            await session.refresh(agent)
            return agent.id
    
    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID"""
        async with self.async_session() as session:
            result = await session.execute(
                select(Agent).options(selectinload(Agent.current_room)).where(Agent.id == agent_id)
            )
            return result.scalar_one_or_none()
    
    async def get_all_agents(self) -> List[Agent]:
        """Get all agents"""
        async with self.async_session() as session:
            result = await session.execute(
                select(Agent).options(selectinload(Agent.current_room))
            )
            return result.scalars().all()
    
    async def update_agent(self, agent_id: str, **kwargs) -> bool:
        """Update agent fields"""
        async with self.async_session() as session:
            kwargs['last_active'] = datetime.utcnow()
            result = await session.execute(
                update(Agent).where(Agent.id == agent_id).values(**kwargs)
            )
            await session.commit()
            return result.rowcount > 0
    
    # Room CRUD operations
    async def get_room(self, room_id: str) -> Optional[Room]:
        """Get room by ID"""
        async with self.async_session() as session:
            result = await session.execute(
                select(Room).options(selectinload(Room.current_agents)).where(Room.id == room_id)
            )
            return result.scalar_one_or_none()
    
    async def get_all_rooms(self) -> List[Room]:
        """Get all rooms"""
        async with self.async_session() as session:
            result = await session.execute(
                select(Room).options(selectinload(Room.current_agents))
            )
            return result.scalars().all()
    
    # Interaction CRUD operations
    async def create_interaction(self, agent_id: str, room_id: str, content: str, 
                               interaction_type: str = "general", metadata: Dict[str, Any] = None) -> str:
        """Create a new interaction"""
        async with self.async_session() as session:
            interaction = Interaction(
                agent_id=agent_id,
                room_id=room_id,
                content=content,
                interaction_type=interaction_type,
                metadata=metadata or {}
            )
            session.add(interaction)
            await session.commit()
            await session.refresh(interaction)
            return interaction.id
    
    async def get_interactions(self, room_id: str = None, agent_id: str = None, limit: int = 100) -> List[Interaction]:
        """Get interactions with optional filtering"""
        async with self.async_session() as session:
            query = select(Interaction).options(
                selectinload(Interaction.agent),
                selectinload(Interaction.room)
            ).order_by(Interaction.timestamp.desc()).limit(limit)
            
            if room_id:
                query = query.where(Interaction.room_id == room_id)
            if agent_id:
                query = query.where(Interaction.agent_id == agent_id)
            
            result = await session.execute(query)
            return result.scalars().all()
    
    # Agent room operations
    async def move_agent_to_room(self, agent_id: str, room_id: str) -> bool:
        """Move agent to a room"""
        async with self.async_session() as session:
            # Check room capacity
            room = await self.get_room(room_id)
            if not room:
                return False
                
            current_occupancy = len(room.current_agents)
            if current_occupancy >= room.max_capacity:
                return False
            
            # Update agent's room
            success = await self.update_agent(agent_id, current_room_id=room_id)
            return success
    
    async def remove_agent_from_room(self, agent_id: str) -> bool:
        """Remove agent from their current room"""
        return await self.update_agent(agent_id, current_room_id=None)

# Global database manager instance
db_manager = DatabaseManager()

async def get_db_manager() -> DatabaseManager:
    """Get the global database manager instance"""
    return db_manager