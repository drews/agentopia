import logging
import asyncio
import random
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import sys
import os

# Add the parent directory to sys.path to import from the existing agentopia system
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database import db
from services.spaceship_service import SpaceshipService
from services.websocket_manager import WebSocketManager
from services.llm_service import LLMService
from services.mcp.mcp_client import MCPClient, MCPServerConfig
from backend.core.config import get_settings
from models.agent import AgentRole
from services.config_service import config_service

logger = logging.getLogger(__name__)

class MovementOrchestrator:
    """
    Orchestrates ambient agent movement on the bridge with slot-filling mechanics
    """
    
    def __init__(self, config_service=None):
        # Load configuration values
        if config_service:
            consolidated_config = config_service.load_consolidated_config()
            bridge_config = consolidated_config.get("defaults", {}).get("bridge", {})
            movement_config = consolidated_config.get("defaults", {}).get("movement", {})
            
            self.bridge_bounds = bridge_config.get("dimensions", {"width": 24, "height": 16})
            self.station_positions = bridge_config.get("station_positions", [
                {"x": 5, "y": 8, "name": "command_station"},
                {"x": 15, "y": 6, "name": "science_station"},
                {"x": 18, "y": 12, "name": "engineering_station"}
            ])
            
            # Movement configuration
            self.nearby_move_probability = movement_config.get("nearby_move_probability", 0.7)
            self.station_move_probability = movement_config.get("station_move_probability", 0.3)
            self.max_movement_distance = movement_config.get("max_movement_distance", 3)
            
        else:
            # Fallback to hardcoded values if no config service
            self.bridge_bounds = {"width": 24, "height": 16}
            self.station_positions = [
                {"x": 5, "y": 8, "name": "command_station"},
                {"x": 15, "y": 6, "name": "science_station"},
                {"x": 18, "y": 12, "name": "engineering_station"}
            ]
            self.nearby_move_probability = 0.7
            self.station_move_probability = 0.3
            self.max_movement_distance = 3
            
        # Grid occupation tracking
        self.occupied_slots = set()  # Track occupied grid positions
        self.agent_positions = {}  # Track current agent positions
    
    def generate_ambient_target(self, agent_id: str, current_position: Dict[str, int]) -> Dict[str, int]:
        """Generate a new ambient movement target for an agent with slot-filling"""
        # Update current position tracking
        current_slot = (current_position["x"], current_position["y"])
        
        # Use configured probability to decide between nearby move or station move
        if random.random() < self.nearby_move_probability:
            # Move to nearby position
            return self._generate_nearby_position(agent_id, current_position)
        else:
            # Move toward a station
            return self._choose_station_position(agent_id)
    
    def _generate_nearby_position(self, agent_id: str, current: Dict[str, int]) -> Dict[str, int]:
        """Generate a position near the current location with collision avoidance"""
        attempts = 0
        max_attempts = 10
        
        while attempts < max_attempts:
            # Move up to max_movement_distance spaces in a random direction
            dx = random.randint(-self.max_movement_distance, self.max_movement_distance)
            dy = random.randint(-self.max_movement_distance, self.max_movement_distance)
            
            new_x = max(2, min(self.bridge_bounds["width"] - 2, current["x"] + dx))
            new_y = max(2, min(self.bridge_bounds["height"] - 2, current["y"] + dy))
            
            candidate_slot = (new_x, new_y)
            
            # Check if slot is available
            if not self._is_slot_occupied(candidate_slot, agent_id):
                return {"x": new_x, "y": new_y}
            
            attempts += 1
        
        # If no nearby position found, return current position
        return current
    
    def _choose_station_position(self, agent_id: str) -> Dict[str, int]:
        """Choose a station position based on agent role with collision avoidance"""
        # Simple role-based station preference
        if agent_id == "red_agent":
            station = self.station_positions[0]  # Command station
        elif agent_id == "blue_agent":
            station = self.station_positions[1]  # Science station
        else:
            station = self.station_positions[2]  # Engineering station
        
        # Try to find an available slot around the station
        offsets = [
            (0, 0),   # Exact station position
            (-1, 0), (1, 0), (0, -1), (0, 1),  # Adjacent positions
            (-1, -1), (-1, 1), (1, -1), (1, 1)  # Diagonal positions
        ]
        
        for offset_x, offset_y in offsets:
            candidate_x = max(1, min(self.bridge_bounds["width"] - 1, station["x"] + offset_x))
            candidate_y = max(1, min(self.bridge_bounds["height"] - 1, station["y"] + offset_y))
            candidate_slot = (candidate_x, candidate_y)
            
            if not self._is_slot_occupied(candidate_slot, agent_id):
                return {"x": candidate_x, "y": candidate_y}
        
        # If no station slots available, find any nearby position
        for radius in range(2, 5):  # Expand search radius
            for dx in range(-radius, radius + 1):
                for dy in range(-radius, radius + 1):
                    candidate_x = max(1, min(self.bridge_bounds["width"] - 1, station["x"] + dx))
                    candidate_y = max(1, min(self.bridge_bounds["height"] - 1, station["y"] + dy))
                    candidate_slot = (candidate_x, candidate_y)
                    
                    if not self._is_slot_occupied(candidate_slot, agent_id):
                        return {"x": candidate_x, "y": candidate_y}
        
        # Fallback to current position if no slots found
        return self.agent_positions.get(agent_id, {"x": 10, "y": 8})
    
    def _is_slot_occupied(self, slot: tuple, requesting_agent_id: str) -> bool:
        """Check if a grid slot is occupied by another agent"""
        # A slot is occupied if another agent is there
        for agent_id, position in self.agent_positions.items():
            if agent_id != requesting_agent_id:
                agent_slot = (position["x"], position["y"])
                if agent_slot == slot:
                    return True
        return False
    
    def update_agent_position(self, agent_id: str, new_position: Dict[str, int]):
        """Update agent position in the orchestrator's tracking"""
        self.agent_positions[agent_id] = new_position
    
    def cleanup_agent(self, agent_id: str):
        """Clean up agent from orchestrator tracking"""
        if agent_id in self.agent_positions:
            del self.agent_positions[agent_id]
            logger.info(f"Cleaned up agent {agent_id} from movement orchestrator")
    
    def get_agent_count(self) -> int:
        """Get current number of tracked agents"""
        return len(self.agent_positions)
    
    def get_all_agent_positions(self) -> Dict[str, Dict[str, int]]:
        """Get all current agent positions"""
        return self.agent_positions.copy()

class AgentManager:
    """
    Manages the integration between the existing agentopia agent system 
    and the spaceship bridge visualization
    """
    
    def __init__(self, spaceship_service: SpaceshipService, websocket_manager: WebSocketManager):
        self.spaceship_service = spaceship_service
        self.websocket_manager = websocket_manager
        self.agent_instances = {}  # Will store references to actual agent instances
        self.running = False
        
        # Load configuration values
        consolidated_config = config_service.load_consolidated_config()
        movement_config = consolidated_config.get("defaults", {}).get("movement", {})
        
        self.intent_update_interval = movement_config.get("agent_status_update_interval", 2.0)
        self.movement_interval = movement_config.get("movement_interval", 1.0)
        
        self.llm_service = LLMService(get_settings())  # Add LangChain-based LLM service
        # Direct MCP integration - consolidated from MCPServerManager
        self.mcp_client = MCPClient()
        self.config_path = "config/agentopia.json"
        self.mcp_server_configs: Dict[str, MCPServerConfig] = {}
        self.config_data = None
        
        # Movement orchestration with config service
        self.movement_orchestrator = MovementOrchestrator(config_service)
        
        # Simulation probabilities from configuration
        self.status_change_probability = movement_config.get("status_change_probability", 0.1)
        self.movement_intention_probability = movement_config.get("movement_intention_probability", 0.05)
        
        # Agent capabilities and permissions (moved from AgentMCPBridge)
        self.agent_capabilities: Dict[AgentRole, List[str]] = {
            AgentRole.EXECUTIVE_OFFICER: [
                "calendar", "tasks", "planning", "scheduling", "reporting", "datetime", "holidays"
            ],
            AgentRole.SCIENCE_OFFICER: [
                "files", "research", "analysis", "documents", "data", "datetime", "calculations"
            ],
            AgentRole.OPERATIONS_OFFICER: [
                "tasks", "workflow", "automation", "monitoring", "execution", "datetime", "time"
            ]
        }
        
    async def initialize(self):
        """Initialize the agent manager"""
        try:
            # LLM service is ready to use (no async initialization needed with LangChain)
            
            # Initialize MCP client directly
            await self.mcp_client.initialize()
            await self._load_consolidated_configuration()
            
            # Try to import and connect to existing agent system
            await self._connect_to_existing_agents()
            logger.info("AgentManager initialized")
        except Exception as e:
            logger.warning(f"Could not connect to existing agent system: {e}")
            logger.info("Running in standalone mode")
    
    async def _connect_to_existing_agents(self):
        """Connect to the existing Red/Blue/Yellow agent system"""
        try:
            # This is where we would integrate with the existing agent system
            # For now, we'll simulate the connection
            
            # Import the existing mission system if available
            from missions import MissionDrivenAgent
            
            # Map existing agents to bridge agents
            agent_mapping = {
                "red_agent": {
                    "class": "MissionDrivenAgent",
                    "character_file": "characters/commander.systemprompt",
                    "role": "executive_officer"
                },
                "blue_agent": {
                    "class": "MissionDrivenAgent", 
                    "character_file": "characters/scientist.systemprompt",
                    "role": "science_officer"
                },
                "yellow_agent": {
                    "class": "MissionDrivenAgent",
                    "character_file": "characters/engineer.systemprompt", 
                    "role": "operations_officer"
                }
            }
            
            logger.info("Connected to existing agent system")
            
        except ImportError:
            logger.warning("Existing agent system not found, running in simulation mode")
    
    async def start_monitoring(self):
        """Start monitoring agent activities"""
        self.running = True
        logger.info("Started agent monitoring")
        
        # Start the intent monitoring loop (every 2 seconds)
        asyncio.create_task(self._intent_monitoring_loop())
        
        # Start the movement orchestration loop (every 1 second)
        logger.info("Starting movement orchestration loop...")
        asyncio.create_task(self._movement_loop())
    
    async def stop_monitoring(self):
        """Stop monitoring agent activities"""
        self.running = False
        await self.mcp_client.shutdown()
        logger.info("Stopped agent monitoring")
    
    async def _load_consolidated_configuration(self):
        """Load consolidated configuration from agentopia.json."""
        try:
            config_file = Path(self.config_path)
            if not config_file.exists():
                await self._create_default_consolidated_configuration()
                return
                
            with open(config_file, 'r') as f:
                self.config_data = json.load(f)
            
            # Load MCP server configurations
            mcp_servers = self.config_data.get("mcp_servers", {})
            mcp_defaults = self.config_data.get("defaults", {}).get("mcp", {})
            default_timeout = mcp_defaults.get("timeout", 30)
            
            for server_name, server_config in mcp_servers.items():
                server_url = server_config.get("external_url", server_config["url"])
                
                config = MCPServerConfig(
                    name=server_name,
                    capabilities=server_config.get("capabilities", []),
                    timeout=server_config.get("timeout", default_timeout)
                )
                
                self.mcp_server_configs[server_name] = config
                self.mcp_client.add_server(config)
            
            logger.info(f"Loaded consolidated configuration with {len(self.mcp_server_configs)} MCP servers")
            
        except Exception as e:
            logger.error(f"Error loading consolidated configuration: {e}")
            await self._create_default_consolidated_configuration()
    
    async def _create_default_consolidated_configuration(self):
        """Create a default consolidated configuration file."""
        try:
            config_file = Path(self.config_path)
            config_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy the existing agentopia.json as default
            logger.info(f"Using existing agentopia.json configuration at {config_file}")
            
        except Exception as e:
            logger.error(f"Error creating default consolidated configuration: {e}")
    
    async def _intent_monitoring_loop(self):
        """Intent monitoring loop that updates agent intentions and states"""
        while self.running:
            try:
                await self._update_agent_intentions()
                await asyncio.sleep(self.intent_update_interval)
            except Exception as e:
                logger.error(f"Error in intent monitoring loop: {e}")
                await asyncio.sleep(5)  # Wait longer if there's an error
    
    # Removed coordinate monitoring - frontend handles physical manifestation
    
    async def _movement_loop(self):
        """Movement orchestration loop for ambient agent behavior"""
        logger.info("Movement loop started")
        while self.running:
            try:
                await self._orchestrate_ambient_movement()
                await asyncio.sleep(self.movement_interval)
            except Exception as e:
                logger.error(f"Error in movement loop: {e}")
                await asyncio.sleep(5)  # Wait longer if there's an error
    
    async def _update_agent_intentions(self):
        """Update agent intentions and broadcast intent changes"""
        try:
            # Get current agent states from database
            agents = await db.get_all_agents()
            
            for agent in agents:
                # Simulate agent intention changes for now
                # In a real integration, this would check actual agent intentions
                await self._simulate_agent_intentions(agent)
                
                # Broadcast intent update (not coordinates - frontend handles that)
                await self.websocket_manager.broadcast({
                    "type": "agent_intent_update",
                    "data": {
                        "agent_id": agent["id"],
                        "intent": agent.get("intent", "idle"),
                        "status": agent["status"],
                        "target_station": agent.get("target_station"),
                        "current_task": agent.get("current_task"),
                        "timestamp": datetime.now().isoformat()
                    }
                })
                
        except Exception as e:
            logger.error(f"Error updating agent intentions: {e}")
    
    # Removed coordinate updates - frontend handles physical manifestation
    
    async def _simulate_agent_intentions(self, agent: Dict[str, Any]):
        """Simulate agent intention changes (replace with real agent integration)"""
        import random
        
        agent_id = agent["id"]
        current_status = agent["status"]
        
        # Simulate random intention changes using configured probability
        if random.random() < self.status_change_probability:
            new_status = random.choice(["active", "thinking", "working", "idle"])
            if new_status != current_status:
                await self.spaceship_service.update_agent_status(agent_id, new_status)
                logger.info(f"Agent {agent_id} intention changed to {new_status}")
        
        # Simulate random movement intentions occasionally using configured probability
        if random.random() < self.movement_intention_probability:
            await self._simulate_movement_intention(agent_id)
    
    async def _simulate_movement_intention(self, agent_id: str):
        """Simulate agent movement intention (backend signals intent, frontend handles movement)"""
        try:
            # Get current agent position
            agent = await db.get_agent(agent_id)
            if not agent:
                return
            
            current_position = {"x": agent["position"]["x"], "y": agent["position"]["y"]}
            
            # Generate movement intention using orchestrator
            target_position = self.movement_orchestrator.generate_ambient_target(agent_id, current_position)
            
            # Only signal intention if target is different from current position
            if target_position != current_position:
                # Update agent intent in database
                await self.spaceship_service.update_agent_intent(agent_id, "moving", target_position)
                
                # Update position tracking in orchestrator
                self.movement_orchestrator.update_agent_position(agent_id, target_position)
                
                # Broadcast movement intention (frontend handles smooth animation)
                await self.websocket_manager.broadcast({
                    "type": "agent_movement_intent",
                    "data": {
                        "agent_id": agent_id,
                        "intent": "move_to_position",
                        "target_position": target_position,
                        "activity_hint": self._get_activity_hint(agent_id, target_position),
                        "timestamp": datetime.now().isoformat()
                    }
                })
                
        except Exception as e:
            logger.error(f"Error simulating movement intention for agent {agent_id}: {e}")
    
    async def _orchestrate_ambient_movement(self):
        """Orchestrate ambient movement for all agents"""
        try:
            logger.info("Orchestrating ambient movement...")
            # Get current agent states
            agents = await db.get_all_agents()
            
            for agent in agents:
                agent_id = agent["id"]
                current_position = {"x": agent["position"]["x"], "y": agent["position"]["y"]}
                
                # Generate new ambient target
                target_position = self.movement_orchestrator.generate_ambient_target(agent_id, current_position)
                logger.info(f"Agent {agent_id} ambient target: {target_position} (current: {current_position})")
                
                # Only move if the target is different from current position
                if target_position != current_position:
                    await self.spaceship_service.move_agent(agent_id, target_position)
                    
                    # Update position tracking in orchestrator
                    self.movement_orchestrator.update_agent_position(agent_id, target_position)
                    
                    # Broadcast movement intention (frontend handles physical manifestation)
                    await self.websocket_manager.broadcast({
                        "type": "agent_movement_intent",
                        "data": {
                            "agent_id": agent_id,
                            "intent": "move_to_position",
                            "target_position": target_position,
                            "activity_hint": self._get_activity_hint(agent_id, target_position),
                            "timestamp": datetime.now().isoformat()
                        }
                    })
                    
        except Exception as e:
            logger.error(f"Error orchestrating ambient movement: {e}")
    
    def _get_activity_hint(self, agent_id: str, position: Dict[str, int]) -> str:
        """Get activity hint based on agent position"""
        # Check if near any station
        for station in self.movement_orchestrator.station_positions:
            if abs(position["x"] - station["x"]) <= 2 and abs(position["y"] - station["y"]) <= 2:
                return f"approaching_{station['name']}"
        
        return "patrolling"
    
    async def _simulate_agent_movement(self, agent_id: str):
        """Simulate agent movement between stations"""
        try:
            # Get all stations
            bridge_state = await self.spaceship_service.get_bridge_state()
            stations = bridge_state["stations"]
            
            if not stations:
                return
            
            # Pick a random station to move to
            import random
            target_station = random.choice(stations)
            
            # Generate movement path
            path = await self.spaceship_service.simulate_agent_movement(agent_id, target_station["id"])
            
            if path:
                # Animate movement
                await self._animate_agent_movement(agent_id, path)
                
        except Exception as e:
            logger.error(f"Error simulating movement for agent {agent_id}: {e}")
    
    async def _animate_agent_movement(self, agent_id: str, path: List[Any]):
        """Animate agent movement along a path"""
        try:
            await self.spaceship_service.update_agent_status(agent_id, "moving")
            
            for position in path:
                # Move agent to next position
                await self.spaceship_service.move_agent(agent_id, position)
                
                # Broadcast position update
                agent = await db.get_agent(agent_id)
                if agent:
                    await self.websocket_manager.broadcast_agent_update(agent)
                
                # Wait a bit for smooth animation
                await asyncio.sleep(0.5)
            
            # Agent arrived at destination
            await self.spaceship_service.update_agent_status(agent_id, "active")
            
        except Exception as e:
            logger.error(f"Error animating movement for agent {agent_id}: {e}")
    
    async def send_mission_to_agent(self, agent_id: str, mission: str) -> bool:
        """Send a mission/task to a specific agent"""
        try:
            # Update agent status to show they received a mission
            await self.spaceship_service.update_agent_status(agent_id, "thinking", mission)
            
            logger.info(f"Mission sent to agent {agent_id}: {mission}")
            
            # Get agent info for personality and role
            agent = await db.get_agent(agent_id)
            agent_name = agent.get("name", agent_id) if agent else agent_id
            agent_role_str = agent.get("role", "bridge_crew") if agent else "bridge_crew"
            
            # Convert role string to enum
            try:
                agent_role = AgentRole(agent_role_str)
            except ValueError:
                agent_role = AgentRole.BRIDGE_CREW
            
            # Check if this is an MCP command
            mcp_result = await self._try_mcp_command(agent_id, agent_role, mission)
            
            if mcp_result["is_mcp_command"]:
                response = mcp_result["response"]
            else:
                # Create system prompt based on agent role
                system_prompt = f"You are {agent_name}, an AI agent on a starship bridge. You have access to real-world data through MCP integrations. Respond professionally and helpfully to missions and requests."
                
                # Get LLM response using LangChain
                response = await self.llm_service.generate_response(
                    prompt=mission,
                    system_prompt=system_prompt
                )
            
            if response and not response.startswith("I apologize"):
                # Update agent status to active
                await self.spaceship_service.update_agent_status(agent_id, "active", response)
                
                # Also send a chat message
                await self.websocket_manager.broadcast_chat_message({
                    "from": agent_id,
                    "to": "bridge",
                    "message": response,
                    "timestamp": datetime.now().isoformat()
                })
                
                logger.info(f"Agent {agent_id} responded: {response[:50]}...")
            else:
                # Handle error
                await self.spaceship_service.update_agent_status(agent_id, "idle", "Error processing mission")
                logger.error(f"Agent {agent_id} failed to process mission: {response}")
            
            # Broadcast agent update
            agent = await db.get_agent(agent_id)
            if agent:
                await self.websocket_manager.broadcast_agent_update(agent)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending mission to agent {agent_id}: {e}")
            return False
    
    async def _try_mcp_command(self, agent_id: str, agent_role: AgentRole, mission: str) -> Dict[str, Any]:
        """Try to process the mission as an MCP command."""
        try:
            # Parse mission for MCP commands
            mission_lower = mission.lower().strip()
            
            # Define MCP command patterns
            mcp_patterns = {
                "get calendar": {"command": "get_calendar", "params": {}},
                "check schedule": {"command": "check_schedule", "params": {}},
                "get events": {"command": "get_events", "params": {}},
                "get tasks": {"command": "get_tasks", "params": {}},
                "list files": {"command": "list_files", "params": {}},
                "plan day": {"command": "plan_day", "params": {}},
                "plan my day": {"command": "plan_day", "params": {}},
                "create event": {"command": "create_event", "params": self._parse_event_params(mission)},
                "create task": {"command": "create_task", "params": self._parse_task_params(mission)},
                
                # DateTime patterns
                "current time": {"command": "current_time", "params": {}},
                "what time": {"command": "current_time", "params": {}},
                "days until": {"command": "days_until", "params": self._parse_days_until_params(mission)},
                "how many days": {"command": "days_until", "params": self._parse_days_until_params(mission)},
                "when is": {"command": "day_of_week", "params": self._parse_date_params(mission)},
                "what day": {"command": "day_of_week", "params": self._parse_date_params(mission)},
                "leap year": {"command": "is_leap_year", "params": self._parse_year_params(mission)},
                "next holiday": {"command": "next_holiday", "params": {}},
                "is holiday": {"command": "is_holiday", "params": self._parse_date_params(mission)},
            }
            
            # Check for MCP command patterns
            for pattern, config in mcp_patterns.items():
                if pattern in mission_lower:
                    # Check agent authorization for this command
                    if not self._agent_can_execute(agent_role, config["command"]):
                        error_response = f"I don't have permission to {config['command']} - that's outside my role as {agent_role.value}"
                        return {"is_mcp_command": True, "response": error_response}
                    
                    # Execute MCP command directly through server manager
                    result = await self._execute_mcp_command(config["command"], config["params"])
                    
                    if result["success"]:
                        response = self._format_mcp_response(config["command"], result["data"])
                        return {"is_mcp_command": True, "response": response}
                    else:
                        error_response = f"I encountered an error accessing external data: {result['error']}"
                        return {"is_mcp_command": True, "response": error_response}
            
            # Not an MCP command
            return {"is_mcp_command": False, "response": None}
            
        except Exception as e:
            logger.error(f"Error processing MCP command for agent {agent_id}: {e}")
            return {"is_mcp_command": False, "response": None}
    
    def _parse_event_params(self, mission: str) -> Dict[str, Any]:
        """Parse event creation parameters from mission text."""
        # Simple parsing - in a real implementation this would be more sophisticated
        params = {}
        
        # Extract basic event info (this is a simplified example)
        words = mission.split()
        if "tomorrow" in mission.lower():
            from datetime import datetime, timedelta
            tomorrow = datetime.now() + timedelta(days=1)
            params["start_time"] = tomorrow.strftime("%Y-%m-%d 09:00:00")
            params["end_time"] = tomorrow.strftime("%Y-%m-%d 10:00:00")
        
        return params
    
    def _parse_task_params(self, mission: str) -> Dict[str, Any]:
        """Parse task creation parameters from mission text."""
        # Simple parsing - in a real implementation this would be more sophisticated
        params = {}
        
        # Extract task title (everything after "create task")
        if "create task" in mission.lower():
            title_start = mission.lower().find("create task") + len("create task")
            title = mission[title_start:].strip()
            if title:
                params["title"] = title
        
        return params
    
    def _parse_days_until_params(self, mission: str) -> Dict[str, Any]:
        """Parse 'days until' parameters from mission text."""
        params = {}
        mission_lower = mission.lower()
        
        # Look for holiday names
        holidays = ["christmas", "new year", "thanksgiving", "halloween", "valentine", "easter"]
        for holiday in holidays:
            if holiday in mission_lower:
                params["target_date"] = holiday.title()
                return params
        
        # Look for dates (simple patterns)
        import re
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, mission)
            if match:
                params["target_date"] = match.group(1)
                return params
        
        return params
    
    def _parse_date_params(self, mission: str) -> Dict[str, Any]:
        """Parse date parameters from mission text."""
        params = {}
        
        import re
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\d{1,2}/\d{1,2}/\d{4})',  # MM/DD/YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, mission)
            if match:
                params["date"] = match.group(1)
                return params
        
        return params
    
    def _parse_year_params(self, mission: str) -> Dict[str, Any]:
        """Parse year parameters from mission text."""
        params = {}
        
        import re
        year_match = re.search(r'\b(\d{4})\b', mission)
        if year_match:
            params["year"] = int(year_match.group(1))
        
        return params
    
    def _format_mcp_response(self, command: str, data: Dict[str, Any]) -> str:
        """Format MCP response data into a human-readable response."""
        try:
            if command == "get_calendar" or command == "get_events":
                events = data.get("events", [])
                if not events:
                    return "No events found in your calendar."
                
                response = f"Found {len(events)} calendar events:\n"
                for event in events[:5]:  # Show first 5 events
                    title = event.get("title", "Untitled")
                    start = event.get("start_time", "Unknown time")
                    response += f"• {title} at {start}\n"
                
                if len(events) > 5:
                    response += f"... and {len(events) - 5} more events"
                
                return response
            
            elif command == "get_tasks":
                tasks = data.get("tasks", [])
                if not tasks:
                    return "No tasks found."
                
                response = f"Found {len(tasks)} tasks:\n"
                for task in tasks[:5]:  # Show first 5 tasks
                    title = task.get("title", "Untitled")
                    status = task.get("status", "unknown")
                    response += f"• {title} ({status})\n"
                
                if len(tasks) > 5:
                    response += f"... and {len(tasks) - 5} more tasks"
                
                return response
            
            elif command == "check_schedule":
                date = data.get("date", "today")
                total_events = data.get("total_events", 0)
                recommendations = data.get("recommendations", [])
                
                response = f"Schedule for {date}: {total_events} events"
                if recommendations:
                    response += "\nRecommendations:\n"
                    for rec in recommendations:
                        response += f"• {rec}\n"
                
                return response
            
            elif command == "plan_day":
                date = data.get("date", "today")
                events = data.get("scheduled_events", [])
                tasks = data.get("available_tasks", [])
                recommendations = data.get("recommendations", [])
                
                response = f"Daily plan for {date}:\n"
                response += f"• {len(events)} scheduled events\n"
                response += f"• {len(tasks)} available tasks\n"
                
                if recommendations:
                    response += "\nRecommendations:\n"
                    for rec in recommendations[:3]:
                        response += f"• {rec}\n"
                
                return response
            
            elif command == "list_files":
                files = data.get("files", [])
                if not files:
                    return "No files found."
                
                response = f"Found {len(files)} files:\n"
                for file_info in files[:5]:
                    name = file_info.get("name", "Unknown")
                    path = file_info.get("path", "")
                    response += f"• {name} ({path})\n"
                
                if len(files) > 5:
                    response += f"... and {len(files) - 5} more files"
                
                return response
            
            elif command == "create_event":
                return "Calendar event created successfully."
            
            elif command == "create_task":
                return "Task created successfully."
            
            # DateTime commands
            elif command == "current_time":
                formatted = data.get("formatted", data.get("datetime", ""))
                return f"Current time: {formatted}"
            
            elif command == "days_until":
                if "error" in data:
                    return data["error"]
                message = data.get("message", "")
                if message:
                    return message
                days = data.get("days_until", 0)
                target = data.get("target_date", "")
                return f"{days} days until {target}"
            
            elif command == "day_of_week":
                if "error" in data:
                    return data["error"]
                message = data.get("message", "")
                if message:
                    return message
                day = data.get("day_of_week", "")
                date_str = data.get("date", "")
                return f"{date_str} is a {day}"
            
            elif command == "is_leap_year":
                if "error" in data:
                    return data["error"]
                message = data.get("message", "")
                if message:
                    return message
                year = data.get("year", "")
                is_leap = data.get("is_leap_year", False)
                return f"{year} {'is' if is_leap else 'is not'} a leap year"
            
            elif command == "next_holiday":
                if "error" in data:
                    return data["error"]
                message = data.get("message", "")
                if message:
                    return message
                holiday = data.get("holiday", "")
                days = data.get("days_until", 0)
                return f"Next holiday is {holiday} in {days} days"
            
            elif command == "is_holiday":
                if "error" in data:
                    return data["error"]
                message = data.get("message", "")
                if message:
                    return message
                is_holiday = data.get("is_holiday", False)
                date_str = data.get("date", "")
                if is_holiday:
                    holiday_name = data.get("holiday_name", "a holiday")
                    return f"{date_str} is {holiday_name}"
                else:
                    return f"{date_str} is not a holiday"
            
            else:
                return f"Command executed successfully. Data: {str(data)[:100]}..."
            
        except Exception as e:
            logger.error(f"Error formatting MCP response: {e}")
            return f"Command completed with data: {str(data)[:100]}..."
    
    async def get_agent_report(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get a status report from an agent"""
        try:
            agent = await db.get_agent(agent_id)
            if not agent:
                return None
            
            # In a real integration, this would query the actual agent
            # For now, return simulated report
            
            report = {
                "agent_id": agent_id,
                "name": agent["name"],
                "status": agent["status"],
                "current_task": agent.get("current_task"),
                "position": agent["position"],
                "assigned_station": agent.get("assigned_station"),
                "last_activity": agent["last_activity"],
                "simulated_metrics": {
                    "tasks_completed": 42,
                    "efficiency_rating": 85.5,
                    "uptime_hours": 23.7
                }
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error getting report from agent {agent_id}: {e}")
            return None
    
    async def handle_agent_communication(self, from_agent: str, to_agent: str, message: str):
        """Handle communication between agents"""
        try:
            # Log the communication
            logger.info(f"Agent communication: {from_agent} -> {to_agent}: {message}")
            
            # Broadcast the chat message
            await self.websocket_manager.broadcast_chat_message({
                "from": from_agent,
                "to": to_agent,
                "message": message,
                "type": "agent_communication",
                "timestamp": datetime.now().isoformat()
            })
            
            # In a real integration, this would route the message to the actual agent
            
        except Exception as e:
            logger.error(f"Error handling agent communication: {e}")
    
    async def emergency_all_stop(self):
        """Emergency stop for all agents"""
        try:
            agents = await db.get_all_agents()
            
            for agent in agents:
                await self.spaceship_service.update_agent_status(agent["id"], "idle", "Emergency stop activated")
            
            # Broadcast emergency status
            await self.websocket_manager.broadcast_bridge_status({
                "status": "emergency_stop",
                "message": "All agent activities halted",
                "timestamp": datetime.now().isoformat()
            })
            
            logger.warning("Emergency all-stop activated")
            
        except Exception as e:
            logger.error(f"Error in emergency all-stop: {e}")
    
    async def get_bridge_summary(self) -> Dict[str, Any]:
        """Get a summary of all bridge activities"""
        try:
            bridge_state = await self.spaceship_service.get_bridge_state()
            stats = await self.spaceship_service.get_bridge_statistics()
            
            return {
                "bridge_id": bridge_state["bridge_id"],
                "status": bridge_state["status"],
                "timestamp": datetime.now().isoformat(),
                "agent_count": len(bridge_state["agents"]),
                "station_count": len(bridge_state["stations"]),
                "statistics": stats,
                "recent_activities": [
                    # This would contain recent agent activities
                    # For now, just placeholder
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting bridge summary: {e}")
            return {"error": str(e)}
    
    async def set_persona(self, persona_id: str) -> bool:
        """Set the active persona for all agents"""
        try:
            success = config_service.set_active_persona(persona_id)
            if success:
                # Notify all agents that persona has changed
                agents = await db.get_all_agents()
                for agent in agents:
                    await self.websocket_manager.broadcast_agent_update(agent)
                
                # Broadcast persona change to frontend
                await self.websocket_manager.broadcast_bridge_status({
                    "persona_changed": persona_id,
                    "timestamp": datetime.now().isoformat()
                })
                
                logger.info(f"Persona set to: {persona_id}")
            return success
        except Exception as e:
            logger.error(f"Error setting persona: {e}")
            return False
    
    async def get_active_persona(self) -> Optional[str]:
        """Get the currently active persona"""
        return config_service.get_active_persona()
    
    async def get_available_personas(self) -> Dict[str, str]:
        """Get list of available personas"""
        return config_service.get_available_personas()
    
    async def send_mission_to_agent_with_persona(self, agent_id: str, mission: str, persona_id: str = None) -> bool:
        """Send a mission to an agent with persona-specific behavior"""
        try:
            # Get persona-modified agent config
            agent_config = config_service.apply_persona_to_agent(agent_id, persona_id)
            if not agent_config:
                # Fallback to regular mission sending
                return await self.send_mission_to_agent(agent_id, mission)
            
            # Update agent status with persona awareness
            await self.spaceship_service.update_agent_status(agent_id, "thinking", mission)
            
            # Get persona-modified system prompt
            system_prompt = agent_config.get("system_prompt", "You are a helpful AI assistant.")
            agent_name = agent_config.get("name", agent_id)
            
            # Check persona for Claude Code specific behaviors
            persona_config = config_service.get_persona_config(persona_id or config_service.get_active_persona())
            if persona_config:
                communication_style = persona_config.get("communication_style", "measured")
                work_pace = persona_config.get("work_pace", "balanced")
                
                # Modify response approach based on persona
                if work_pace == "intense":
                    system_prompt += " Respond quickly and focus on immediate actionable steps."
                elif work_pace == "sustainable":
                    system_prompt += " Take time to consider all implications and provide thorough analysis."
                elif work_pace == "thorough":
                    system_prompt += " Be extremely detailed and consider all security and quality aspects."
            
            # Check if this is an MCP command
            agent_role_str = agent_config.get("role", "bridge_crew")
            try:
                agent_role = AgentRole(agent_role_str)
            except ValueError:
                agent_role = AgentRole.BRIDGE_CREW
            
            mcp_result = await self._try_mcp_command(agent_id, agent_role, mission)
            
            if mcp_result["is_mcp_command"]:
                response = mcp_result["response"]
            else:
                # Get LLM response with persona-aware prompt
                response = await self.llm_service.generate_response(
                    prompt=mission,
                    system_prompt=system_prompt
                )
            
            if response and not response.startswith("I apologize"):
                # Update agent status to active
                await self.spaceship_service.update_agent_status(agent_id, "active", response)
                
                # Send chat message with persona-influenced tone
                await self.websocket_manager.broadcast_chat_message({
                    "from": agent_id,
                    "to": "bridge",
                    "message": response,
                    "persona_context": persona_id or config_service.get_active_persona(),
                    "timestamp": datetime.now().isoformat()
                })
                
                logger.info(f"Agent {agent_id} responded with persona {persona_id}: {response[:50]}...")
            else:
                # Handle error
                await self.spaceship_service.update_agent_status(agent_id, "idle", "Error processing mission")
                logger.error(f"Agent {agent_id} failed to process persona-aware mission: {response}")
            
            # Broadcast agent update
            agent = await db.get_agent(agent_id)
            if agent:
                await self.websocket_manager.broadcast_agent_update(agent)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending persona-aware mission to agent {agent_id}: {e}")
            return False
    
    def _agent_can_execute(self, agent_role: AgentRole, command: str) -> bool:
        """Check if an agent role is authorized to execute a specific command."""
        # Get command capabilities mapping
        command_capability_map = {
            "get_calendar": "calendar",
            "get_events": "calendar", 
            "create_event": "calendar",
            "check_schedule": "calendar",
            "get_tasks": "tasks",
            "create_task": "tasks",
            "update_task": "tasks",
            "get_projects": "tasks",
            "list_files": "files",
            "read_file": "files",
            "search_files": "files",
            "current_time": "datetime",
            "days_until": "datetime",
            "days_between": "datetime",
            "day_of_week": "datetime",
            "is_leap_year": "datetime",
            "next_holiday": "holidays",
            "is_holiday": "holidays",
            "plan_day": "planning",
            "analyze_workload": "planning",
            "generate_report": "reporting"
        }
        
        required_capability = command_capability_map.get(command)
        if not required_capability:
            return True  # Unknown commands are allowed by default
        
        agent_caps = self.agent_capabilities.get(agent_role, [])
        return required_capability in agent_caps
    
    async def _execute_mcp_command(self, command: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an MCP command directly through the server manager."""
        try:
            # Map commands to MCP server operations
            if command in ["current_time", "days_until", "days_between", "day_of_week", "is_leap_year", "next_holiday", "is_holiday"]:
                # DateTime commands go to datetime-tools server
                result = await self.mcp_client.call_tool("datetime-tools", command, parameters)
                return {"success": True, "data": result}
            
            elif command in ["get_calendar", "get_events", "create_event", "check_schedule"]:
                # Calendar commands - for now return mock data since actual calendar server isn't implemented
                return {"success": True, "data": {"events": [], "message": "Calendar integration not yet implemented"}}
            
            elif command in ["get_tasks", "create_task", "update_task", "get_projects"]:
                # Task commands - for now return mock data since actual task server isn't implemented  
                return {"success": True, "data": {"tasks": [], "message": "Task integration not yet implemented"}}
            
            elif command in ["list_files", "read_file", "search_files"]:
                # File commands - for now return mock data since actual file server isn't implemented
                return {"success": True, "data": {"files": [], "message": "File integration not yet implemented"}}
            
            elif command in ["plan_day", "analyze_workload", "generate_report"]:
                # Planning commands - these would combine multiple MCP sources
                return {"success": True, "data": {"message": "Planning integration not yet implemented"}}
            
            else:
                return {"success": False, "error": f"Unknown command: {command}"}
                
        except Exception as e:
            logger.error(f"Error executing MCP command {command}: {e}")
            return {"success": False, "error": str(e)}