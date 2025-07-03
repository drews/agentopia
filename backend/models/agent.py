from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class AgentStatus(str, Enum):
    ACTIVE = "active"
    THINKING = "thinking"
    MOVING = "moving"
    WORKING = "working"
    IDLE = "idle"
    OFFLINE = "offline"

class AgentRole(str, Enum):
    EXECUTIVE_OFFICER = "executive_officer"  # Red Agent
    SCIENCE_OFFICER = "science_officer"      # Blue Agent  
    OPERATIONS_OFFICER = "operations_officer" # Yellow Agent
    BRIDGE_CREW = "bridge_crew"

class Position(BaseModel):
    x: int = Field(..., ge=0, description="X coordinate on the bridge grid")
    y: int = Field(..., ge=0, description="Y coordinate on the bridge grid")

class Agent(BaseModel):
    id: str = Field(..., description="Unique agent identifier")
    name: str = Field(..., description="Display name of the agent")
    role: AgentRole = Field(..., description="Agent's role on the bridge")
    position: Position = Field(..., description="Current position on the bridge")
    assigned_station: Optional[str] = Field(None, description="ID of assigned station")
    status: AgentStatus = Field(default=AgentStatus.IDLE, description="Current agent status")
    current_task: Optional[str] = Field(None, description="Description of current task")
    avatar: str = Field("🤖", description="Emoji or character representing the agent")
    path: List[Position] = Field(default_factory=list, description="Movement path for animation")
    last_activity: datetime = Field(default_factory=datetime.now, description="Last activity timestamp")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }