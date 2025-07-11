"""
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    connections: int = Field(ge=0, description="Number of active WebSocket connections")
    bridge_status: str = "operational"
    timestamp: datetime = Field(default_factory=datetime.now)


class Position(BaseModel):
    """2D position coordinates"""
    x: int = Field(ge=0, description="X coordinate")
    y: int = Field(ge=0, description="Y coordinate")


class Dimensions(BaseModel):
    """2D dimensions"""
    width: int = Field(gt=0, description="Width")
    height: int = Field(gt=0, description="Height")


class AgentStatus(BaseModel):
    """Agent status information"""
    id: str = Field(min_length=1, description="Unique agent identifier")
    name: str = Field(min_length=1, description="Agent display name")
    role: str = Field(min_length=1, description="Agent role")
    position: Position
    assigned_station: Optional[str] = None
    status: str = Field(description="Current agent status")
    current_task: Optional[str] = None
    avatar: str = Field(min_length=1, description="Agent avatar emoji")
    last_activity: datetime


class StationInfo(BaseModel):
    """Station information"""
    id: str = Field(min_length=1, description="Unique station identifier")
    name: str = Field(min_length=1, description="Station display name")
    station_type: str = Field(min_length=1, description="Station type")
    position: Position
    dimensions: Dimensions
    capacity: int = Field(gt=0, description="Maximum agents at station")
    required_role: Optional[str] = None
    status: str = "operational"
    description: str = ""
    icon: str = Field(min_length=1, description="Station icon")
    color: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$", description="Station color (hex)")


class BridgeLayout(BaseModel):
    """Bridge layout dimensions"""
    width: int = Field(gt=0, description="Bridge width")
    height: int = Field(gt=0, description="Bridge height")


class BridgeState(BaseModel):
    """Complete bridge state"""
    bridge_id: str = Field(min_length=1, description="Bridge identifier")
    status: str = "operational"
    agents: List[AgentStatus]
    stations: List[StationInfo]
    layout: BridgeLayout
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    """Chat message request"""
    message: str = Field(min_length=1, max_length=1000, description="Message text")
    
    @field_validator("message")
    @classmethod
    def validate_message(cls, v):
        """Validate message content"""
        if not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")
        return v.strip()


class ChatResponse(BaseModel):
    """Chat message response"""
    status: str = "success"
    agent_id: str
    agent_name: str
    agent_role: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.now)


class MissionRequest(BaseModel):
    """Mission assignment request"""
    mission: str = Field(min_length=1, max_length=2000, description="Mission description")
    priority: Optional[int] = Field(None, ge=1, le=10, description="Mission priority (1-10)")
    
    @field_validator("mission")
    @classmethod
    def validate_mission(cls, v):
        """Validate mission content"""
        if not v.strip():
            raise ValueError("Mission cannot be empty or whitespace only")
        return v.strip()


class MoveRequest(BaseModel):
    """Agent movement request"""
    x: int = Field(ge=0, description="Target X coordinate")
    y: int = Field(ge=0, description="Target Y coordinate")


class AgentConfiguration(BaseModel):
    """Agent configuration structure"""
    id: str
    name: str
    role: str
    role_type: str
    avatar: str
    assigned_station: str
    personality: Dict[str, Any]
    system_prompt: str
    capabilities: Dict[str, Dict[str, float]]


class ConfigurationResponse(BaseModel):
    """Configuration response"""
    agents: Dict[str, AgentConfiguration]


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: bool = True
    message: str
    details: Optional[Dict[str, Any]] = None
    type: str
    timestamp: datetime = Field(default_factory=datetime.now)


class SuccessResponse(BaseModel):
    """Standard success response"""
    status: str = "success"
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)