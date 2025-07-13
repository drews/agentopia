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
from services.agent_mcp_bridge import AgentMCPBridge
from backend.core.config import get_settings
from models.agent import AgentRole

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
        self.mcp_bridge = AgentMCPBridge()  # Add MCP integration bridge
        
    async def initialize(self):
        """Initialize the agent manager"""
        try:
            # LLM service is ready to use (no async initialization needed with LangChain)
            
            # Initialize MCP bridge
            await self.mcp_bridge.initialize()
            
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
        await self.mcp_bridge.shutdown()
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
                    # Execute MCP command
                    result = await self.mcp_bridge.execute_agent_command(
                        agent_id, agent_role, config["command"], config["params"]
                    )
                    
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