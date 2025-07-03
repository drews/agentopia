from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class StationType(str, Enum):
    COMMAND = "command"
    ENGINEERING = "engineering"
    SCIENCE = "science"
    COMMUNICATIONS = "communications"
    TACTICAL = "tactical"
    NAVIGATION = "navigation"
    MEDICAL = "medical"
    MAINTENANCE = "maintenance"

class StationStatus(str, Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    CRITICAL = "critical"

class Position(BaseModel):
    x: int = Field(..., ge=0, description="X coordinate of station top-left corner")
    y: int = Field(..., ge=0, description="Y coordinate of station top-left corner")

class Dimensions(BaseModel):
    width: int = Field(..., gt=0, description="Station width in grid units")
    height: int = Field(..., gt=0, description="Station height in grid units")

class Station(BaseModel):
    id: str = Field(..., description="Unique station identifier")
    name: str = Field(..., description="Display name of the station")
    station_type: StationType = Field(..., description="Type/category of station")
    position: Position = Field(..., description="Top-left corner position on bridge grid")
    dimensions: Dimensions = Field(..., description="Station size")
    capacity: int = Field(default=1, ge=1, description="Maximum number of agents that can use this station")
    required_role: Optional[str] = Field(None, description="Role required to operate this station")
    status: StationStatus = Field(default=StationStatus.OPERATIONAL, description="Current operational status")
    description: str = Field("", description="Station description and purpose")
    
    # MCP Integration fields
    mcp_tools: List[str] = Field(default_factory=list, description="MCP tools available at this station")
    resource_usage: Dict[str, Any] = Field(default_factory=dict, description="Current resource consumption")
    
    # Visual representation
    icon: str = Field("🖥️", description="Icon representing the station")
    color: str = Field("#4A90E2", description="Station color in hex format")
    
    last_updated: datetime = Field(default_factory=datetime.now, description="Last status update")
    
    def contains_position(self, pos: Position) -> bool:
        """Check if a position is within this station's bounds"""
        return (
            self.position.x <= pos.x < self.position.x + self.dimensions.width and
            self.position.y <= pos.y < self.position.y + self.dimensions.height
        )
    
    def get_center_position(self) -> Position:
        """Get the center position of the station"""
        return Position(
            x=self.position.x + self.dimensions.width // 2,
            y=self.position.y + self.dimensions.height // 2
        )
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }