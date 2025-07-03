from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class RoomType(str, Enum):
    BRIDGE = "bridge"
    ENGINEERING = "engineering" 
    SCIENCE_LAB = "science_lab"
    COMMUNICATIONS = "communications"
    TACTICAL = "tactical"
    MEDICAL_BAY = "medical_bay"
    CARGO_BAY = "cargo_bay"
    READY_ROOM = "ready_room"

class RoomStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    CONNECTING = "connecting"

class MCPServer(BaseModel):
    """Represents an MCP server configuration"""
    name: str = Field(..., description="Server name")
    url: Optional[str] = Field(None, description="Server URL if remote")
    status: str = Field(default="unknown", description="Server connection status")
    tools: List[str] = Field(default_factory=list, description="Available tools on this server")
    resources: Dict[str, Any] = Field(default_factory=dict, description="Resource usage stats")

class ResourceMetrics(BaseModel):
    """Resource usage metrics for a room/server"""
    cpu_usage: float = Field(default=0.0, ge=0, le=100, description="CPU usage percentage")
    memory_usage: float = Field(default=0.0, ge=0, le=100, description="Memory usage percentage")
    network_usage: float = Field(default=0.0, ge=0, description="Network usage in KB/s")
    active_connections: int = Field(default=0, ge=0, description="Number of active connections")
    requests_per_minute: int = Field(default=0, ge=0, description="Requests processed per minute")

class Room(BaseModel):
    """
    Represents a room on the spaceship that maps to an MCP server.
    This creates the in-world metaphor where rooms are servers.
    """
    id: str = Field(..., description="Unique room identifier")
    name: str = Field(..., description="Display name of the room")
    room_type: RoomType = Field(..., description="Type/category of room")
    description: str = Field("", description="Room description and purpose")
    
    # MCP Server Integration
    mcp_server: MCPServer = Field(..., description="Associated MCP server configuration")
    status: RoomStatus = Field(default=RoomStatus.OFFLINE, description="Room/server status")
    
    # Visual representation
    icon: str = Field("🏠", description="Icon representing the room")
    color: str = Field("#7B68EE", description="Room color in hex format")
    
    # Resource monitoring (server stats presented as room systems)
    metrics: ResourceMetrics = Field(default_factory=ResourceMetrics, description="Room system metrics")
    
    # Access control
    authorized_roles: List[str] = Field(default_factory=list, description="Roles authorized to access this room")
    current_occupants: List[str] = Field(default_factory=list, description="Agent IDs currently in this room")
    max_occupancy: int = Field(default=5, ge=1, description="Maximum room occupancy")
    
    # Onboarding information
    help_text: str = Field("", description="Help text for new users entering this room")
    tool_descriptions: Dict[str, str] = Field(default_factory=dict, description="Descriptions of available tools")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now, description="Room creation timestamp")
    last_accessed: Optional[datetime] = Field(None, description="Last time room was accessed")
    last_updated: datetime = Field(default_factory=datetime.now, description="Last status update")
    
    def is_accessible_by_role(self, role: str) -> bool:
        """Check if a role can access this room"""
        if not self.authorized_roles:
            return True  # No restrictions
        return role in self.authorized_roles
    
    def can_add_occupant(self) -> bool:
        """Check if room can accept another occupant"""
        return len(self.current_occupants) < self.max_occupancy
    
    def add_occupant(self, agent_id: str) -> bool:
        """Add an agent to the room"""
        if self.can_add_occupant() and agent_id not in self.current_occupants:
            self.current_occupants.append(agent_id)
            self.last_accessed = datetime.now()
            return True
        return False
    
    def remove_occupant(self, agent_id: str) -> bool:
        """Remove an agent from the room"""
        if agent_id in self.current_occupants:
            self.current_occupants.remove(agent_id)
            return True
        return False
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }