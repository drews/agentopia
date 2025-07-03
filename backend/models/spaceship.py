from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime

class Position(BaseModel):
    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)

class Dimensions(BaseModel):
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)

class Wall(BaseModel):
    """Represents a wall or barrier on the bridge"""
    x1: int = Field(..., ge=0)
    y1: int = Field(..., ge=0) 
    x2: int = Field(..., ge=0)
    y2: int = Field(..., ge=0)
    wall_type: str = Field(default="solid", description="Type of wall (solid, door, window)")

class Corridor(BaseModel):
    """Represents a walkable corridor on the bridge"""
    x1: int = Field(..., ge=0)
    y1: int = Field(..., ge=0)
    x2: int = Field(..., ge=0) 
    y2: int = Field(..., ge=0)
    corridor_type: str = Field(default="walkway", description="Type of corridor")

class BridgeLayout(BaseModel):
    """Defines the physical layout of the bridge"""
    dimensions: Dimensions = Field(..., description="Overall bridge dimensions")
    stations: List[str] = Field(default_factory=list, description="List of station IDs on this bridge")
    walls: List[Wall] = Field(default_factory=list, description="Wall/barrier definitions")
    corridors: List[Corridor] = Field(default_factory=list, description="Walkable path definitions")
    
    # Navigation mesh for pathfinding
    walkable_grid: Optional[List[List[bool]]] = Field(None, description="2D grid marking walkable areas")

class SpaceshipStatus(str, Enum):
    OPERATIONAL = "operational"
    ALERT_YELLOW = "alert_yellow"
    ALERT_RED = "alert_red"
    MAINTENANCE = "maintenance"
    DOCKED = "docked"

class Spaceship(BaseModel):
    id: str = Field(..., description="Unique spaceship identifier")
    name: str = Field(..., description="Ship name")
    ship_class: str = Field(default="Constitution", description="Ship class/type")
    registry: str = Field(default="NCC-1701", description="Ship registry number")
    
    # Bridge configuration
    layout: BridgeLayout = Field(..., description="Bridge physical layout")
    current_mission: Optional[str] = Field(None, description="Current mission ID")
    status: SpaceshipStatus = Field(default=SpaceshipStatus.OPERATIONAL, description="Ship status")
    
    # MCP Server mapping (rooms as servers)
    mcp_servers: Dict[str, str] = Field(
        default_factory=lambda: {
            "engineering": "filesystem_server",
            "science": "web_search_server", 
            "communications": "api_server",
            "bridge": "core_server"
        },
        description="Mapping of ship areas to MCP servers"
    )
    
    # Resource monitoring
    power_level: float = Field(default=100.0, ge=0, le=100, description="Ship power level percentage")
    crew_count: int = Field(default=0, ge=0, description="Current crew count")
    
    # Timestamps
    commissioned: datetime = Field(default_factory=datetime.now, description="Ship commission date")
    last_updated: datetime = Field(default_factory=datetime.now, description="Last status update")
    
    def get_station_at_position(self, position: Position, stations: List[str]) -> Optional[str]:
        """Find which station (if any) contains the given position"""
        # This would need access to actual station objects
        # Implementation would be handled by the service layer
        pass
    
    def is_position_walkable(self, position: Position) -> bool:
        """Check if a position is walkable (not blocked by walls/stations)"""
        if self.layout.walkable_grid:
            if 0 <= position.x < len(self.layout.walkable_grid[0]) and 0 <= position.y < len(self.layout.walkable_grid):
                return self.layout.walkable_grid[position.y][position.x]
        return True  # Default to walkable if no grid defined
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }