import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import sys
import os

# Add the parent directory to sys.path to import from the existing agentopia system
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database import db
from services.spaceship_service import SpaceshipService
from services.websocket_manager import WebSocketManager
from services.llm_service import LLMService
from backend.core.config import get_settings

logger = logging.getLogger(__name__)

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
        self.update_interval = 2.0  # Update every 2 seconds
        self.llm_service = LLMService(get_settings())  # Add LangChain-based LLM service
        
    async def initialize(self):
        """Initialize the agent manager"""
        try:
            # LLM service is ready to use (no async initialization needed with LangChain)
            
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
        
        # Start the monitoring loop
        asyncio.create_task(self._monitoring_loop())
    
    async def stop_monitoring(self):
        """Stop monitoring agent activities"""
        self.running = False
        logger.info("Stopped agent monitoring")
    
    async def _monitoring_loop(self):
        """Main monitoring loop that updates agent status and positions"""
        while self.running:
            try:
                await self._update_agent_status()
                await asyncio.sleep(self.update_interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(5)  # Wait longer if there's an error
    
    async def _update_agent_status(self):
        """Update agent status and broadcast changes"""
        try:
            # Get current agent states from database
            agents = await db.get_all_agents()
            
            for agent in agents:
                # Simulate agent activity for now
                # In a real integration, this would check actual agent status
                await self._simulate_agent_activity(agent)
                
                # Broadcast agent update
                await self.websocket_manager.broadcast_agent_update(agent)
                
        except Exception as e:
            logger.error(f"Error updating agent status: {e}")
    
    async def _simulate_agent_activity(self, agent: Dict[str, Any]):
        """Simulate agent activity (replace with real agent integration)"""
        import random
        
        agent_id = agent["id"]
        current_status = agent["status"]
        
        # Simulate random status changes
        if random.random() < 0.1:  # 10% chance of status change
            new_status = random.choice(["active", "thinking", "working", "idle"])
            if new_status != current_status:
                await self.spaceship_service.update_agent_status(agent_id, new_status)
                logger.info(f"Agent {agent_id} status changed to {new_status}")
        
        # Simulate random movement occasionally
        if random.random() < 0.05:  # 5% chance of movement
            await self._simulate_agent_movement(agent_id)
    
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
            
            # Get agent info for personality
            agent = await db.get_agent(agent_id)
            agent_name = agent.get("name", agent_id) if agent else agent_id
            
            # Create system prompt based on agent role
            system_prompt = f"You are {agent_name}, an AI agent on a starship bridge. Respond professionally and helpfully to missions and requests."
            
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