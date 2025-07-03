import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from database import db
from models import Agent, Station, Spaceship, Position

logger = logging.getLogger(__name__)

class SpaceshipService:
    """Service for managing spaceship bridge state and operations"""
    
    def __init__(self):
        self.bridge_cache = {}  # Cache for frequently accessed data
        
    async def initialize(self):
        """Initialize the spaceship service and database"""
        await db.init_database()
        await self._refresh_bridge_cache()
        logger.info("SpaceshipService initialized")
    
    async def _refresh_bridge_cache(self):
        """Refresh cached bridge data"""
        try:
            agents = await db.get_all_agents()
            stations = await db.get_all_stations()
            
            self.bridge_cache = {
                "agents": {agent["id"]: agent for agent in agents},
                "stations": {station["id"]: station for station in stations},
                "last_updated": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error refreshing bridge cache: {e}")
    
    async def get_bridge_state(self) -> Dict[str, Any]:
        """Get the complete current state of the bridge"""
        await self._refresh_bridge_cache()
        
        return {
            "bridge_id": "uss_agentopia",
            "status": "operational",
            "agents": list(self.bridge_cache["agents"].values()),
            "stations": list(self.bridge_cache["stations"].values()),
            "layout": {
                "width": 24,
                "height": 16
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_agent_position(self, agent_id: str) -> Optional[Position]:
        """Get current position of an agent"""
        agent = await db.get_agent(agent_id)
        if agent:
            return Position(x=agent["position"]["x"], y=agent["position"]["y"])
        return None
    
    async def move_agent(self, agent_id: str, new_position: Position) -> bool:
        """Move an agent to a new position"""
        try:
            # Check if position is valid (within bridge bounds)
            if not self._is_valid_position(new_position):
                logger.warning(f"Invalid position for agent {agent_id}: {new_position}")
                return False
            
            # Check if position is walkable
            if not await self._is_position_walkable(new_position):
                logger.warning(f"Position not walkable for agent {agent_id}: {new_position}")
                return False
            
            # Update agent position in database
            await db.update_agent_position(agent_id, new_position.x, new_position.y)
            
            # Update cache
            if agent_id in self.bridge_cache["agents"]:
                self.bridge_cache["agents"][agent_id]["position"] = {
                    "x": new_position.x, 
                    "y": new_position.y
                }
            
            logger.info(f"Agent {agent_id} moved to position ({new_position.x}, {new_position.y})")
            return True
            
        except Exception as e:
            logger.error(f"Error moving agent {agent_id}: {e}")
            return False
    
    async def update_agent_status(self, agent_id: str, status: str, task: Optional[str] = None) -> bool:
        """Update agent status and current task"""
        try:
            await db.update_agent_status(agent_id, status, task)
            
            # Update cache
            if agent_id in self.bridge_cache["agents"]:
                self.bridge_cache["agents"][agent_id]["status"] = status
                if task:
                    self.bridge_cache["agents"][agent_id]["current_task"] = task
            
            logger.info(f"Agent {agent_id} status updated: {status}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating agent status {agent_id}: {e}")
            return False
    
    async def get_station_at_position(self, position: Position) -> Optional[Dict[str, Any]]:
        """Find which station (if any) contains the given position"""
        for station in self.bridge_cache["stations"].values():
            station_pos = station["position"]
            station_dim = station["dimensions"]
            
            if (station_pos["x"] <= position.x < station_pos["x"] + station_dim["width"] and
                station_pos["y"] <= position.y < station_pos["y"] + station_dim["height"]):
                return station
        
        return None
    
    async def assign_agent_to_station(self, agent_id: str, station_id: str) -> bool:
        """Assign an agent to a specific station"""
        try:
            # Verify station exists and has capacity
            station = self.bridge_cache["stations"].get(station_id)
            if not station:
                logger.warning(f"Station {station_id} not found")
                return False
            
            # Check station capacity
            current_agents = await self._get_agents_at_station(station_id)
            if len(current_agents) >= station["capacity"]:
                logger.warning(f"Station {station_id} at capacity")
                return False
            
            # Check role requirements
            agent = self.bridge_cache["agents"].get(agent_id)
            if not agent:
                logger.warning(f"Agent {agent_id} not found")
                return False
            
            if station.get("required_role") and agent["role"] != station["required_role"]:
                logger.warning(f"Agent {agent_id} role {agent['role']} not authorized for station {station_id}")
                return False
            
            # Move agent to station center
            station_center = Position(
                x=station["position"]["x"] + station["dimensions"]["width"] // 2,
                y=station["position"]["y"] + station["dimensions"]["height"] // 2
            )
            
            success = await self.move_agent(agent_id, station_center)
            if success:
                # Update agent's assigned station in database
                # This would require adding the database method
                self.bridge_cache["agents"][agent_id]["assigned_station"] = station_id
                logger.info(f"Agent {agent_id} assigned to station {station_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error assigning agent {agent_id} to station {station_id}: {e}")
            return False
    
    async def _get_agents_at_station(self, station_id: str) -> List[Dict[str, Any]]:
        """Get all agents currently assigned to a station"""
        return [
            agent for agent in self.bridge_cache["agents"].values()
            if agent.get("assigned_station") == station_id
        ]
    
    def _is_valid_position(self, position: Position) -> bool:
        """Check if position is within bridge bounds"""
        return 0 <= position.x < 24 and 0 <= position.y < 16
    
    async def _is_position_walkable(self, position: Position) -> bool:
        """Check if position is walkable (not blocked by stations or walls)"""
        # Check if position overlaps with any station
        station = await self.get_station_at_position(position)
        if station:
            return False  # Position is inside a station
        
        # For now, assume all other positions are walkable
        # In the future, this could check against walls and other obstacles
        return True
    
    async def get_bridge_statistics(self) -> Dict[str, Any]:
        """Get bridge operational statistics"""
        agents = list(self.bridge_cache["agents"].values())
        stations = list(self.bridge_cache["stations"].values())
        
        # Count agents by status
        status_counts = {}
        for agent in agents:
            status = agent["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Count stations by status
        station_status_counts = {}
        for station in stations:
            status = station["status"]
            station_status_counts[status] = station_status_counts.get(status, 0) + 1
        
        # Calculate utilization
        total_station_capacity = sum(station["capacity"] for station in stations)
        assigned_agents = len([agent for agent in agents if agent.get("assigned_station")])
        utilization = (assigned_agents / total_station_capacity) * 100 if total_station_capacity > 0 else 0
        
        return {
            "total_agents": len(agents),
            "total_stations": len(stations),
            "agent_status_breakdown": status_counts,
            "station_status_breakdown": station_status_counts,
            "bridge_utilization_percent": round(utilization, 2),
            "last_updated": datetime.now().isoformat()
        }
    
    async def simulate_agent_movement(self, agent_id: str, target_station_id: str) -> List[Position]:
        """Generate a path for agent movement to a target station"""
        agent = self.bridge_cache["agents"].get(agent_id)
        station = self.bridge_cache["stations"].get(target_station_id)
        
        if not agent or not station:
            return []
        
        start_pos = Position(x=agent["position"]["x"], y=agent["position"]["y"])
        target_pos = Position(
            x=station["position"]["x"] + station["dimensions"]["width"] // 2,
            y=station["position"]["y"] + station["dimensions"]["height"] // 2
        )
        
        # Simple pathfinding - direct line for now
        # In the future, this could use A* or other pathfinding algorithms
        path = []
        current_x, current_y = start_pos.x, start_pos.y
        target_x, target_y = target_pos.x, target_pos.y
        
        while current_x != target_x or current_y != target_y:
            if current_x < target_x:
                current_x += 1
            elif current_x > target_x:
                current_x -= 1
                
            if current_y < target_y:
                current_y += 1
            elif current_y > target_y:
                current_y -= 1
                
            path.append(Position(x=current_x, y=current_y))
        
        return path