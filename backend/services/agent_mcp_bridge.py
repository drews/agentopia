"""
Bridge between Agentopia agents and MCP resources.

This module provides the integration layer that allows agents to access
real-world data and tools through MCP servers.
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
import json

from .mcp.resource_manager import MCPResourceManager
from models.agent import AgentRole

logger = logging.getLogger(__name__)


class AgentMCPBridge:
    """
    Bridge that connects Agentopia agents to MCP resources.
    
    Provides high-level methods that agents can use to access
    calendar, tasks, files, and other external resources.
    """
    
    def __init__(self):
        self.resource_manager = MCPResourceManager()
        self.agent_capabilities: Dict[AgentRole, List[str]] = {
            AgentRole.EXECUTIVE_OFFICER: [
                "calendar", "tasks", "planning", "scheduling", "reporting"
            ],
            AgentRole.SCIENCE_OFFICER: [
                "files", "research", "analysis", "documents", "data"
            ],
            AgentRole.OPERATIONS_OFFICER: [
                "tasks", "workflow", "automation", "monitoring", "execution"
            ]
        }
        self.command_handlers: Dict[str, Callable] = {}
        self._register_command_handlers()
        
    async def initialize(self):
        """Initialize the agent-MCP bridge."""
        try:
            await self.resource_manager.initialize()
            logger.info("Agent-MCP bridge initialized")
        except Exception as e:
            logger.error(f"Failed to initialize agent-MCP bridge: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown the agent-MCP bridge."""
        try:
            await self.resource_manager.shutdown()
            logger.info("Agent-MCP bridge shut down")
        except Exception as e:
            logger.error(f"Error during bridge shutdown: {e}")
    
    def _register_command_handlers(self):
        """Register command handlers for different MCP operations."""
        self.command_handlers = {
            # Calendar commands
            "get_calendar": self._handle_get_calendar,
            "get_events": self._handle_get_events,
            "create_event": self._handle_create_event,
            "check_schedule": self._handle_check_schedule,
            
            # Task commands
            "get_tasks": self._handle_get_tasks,
            "create_task": self._handle_create_task,
            "update_task": self._handle_update_task,
            "get_projects": self._handle_get_projects,
            
            # File commands
            "list_files": self._handle_list_files,
            "read_file": self._handle_read_file,
            "search_files": self._handle_search_files,
            
            # Planning commands
            "plan_day": self._handle_plan_day,
            "analyze_workload": self._handle_analyze_workload,
            "generate_report": self._handle_generate_report,
        }
    
    async def execute_agent_command(self, agent_id: str, agent_role: AgentRole, 
                                   command: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an MCP command for an agent."""
        try:
            # Check if agent has capability for this command
            if not self._agent_can_execute(agent_role, command):
                return {
                    "success": False,
                    "error": f"Agent role {agent_role} not authorized for command: {command}",
                    "data": None
                }
            
            # Get command handler
            if command not in self.command_handlers:
                return {
                    "success": False,
                    "error": f"Unknown command: {command}",
                    "data": None
                }
            
            handler = self.command_handlers[command]
            
            # Execute command
            result = await handler(agent_id, parameters)
            
            logger.info(f"Agent {agent_id} executed MCP command: {command}")
            
            return {
                "success": True,
                "error": None,
                "data": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error executing command {command} for agent {agent_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    def _agent_can_execute(self, agent_role: AgentRole, command: str) -> bool:
        """Check if an agent role can execute a specific command."""
        role_capabilities = self.agent_capabilities.get(agent_role, [])
        
        # Map commands to capabilities
        command_capabilities = {
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
            "plan_day": "planning",
            "analyze_workload": "analysis",
            "generate_report": "reporting"
        }
        
        required_capability = command_capabilities.get(command)
        return required_capability in role_capabilities if required_capability else False
    
    # Calendar command handlers
    async def _handle_get_calendar(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle get calendar command."""
        start_date = params.get("start_date")
        end_date = params.get("end_date")
        calendar_id = params.get("calendar_id")
        
        events = await self.resource_manager.get_calendar_events(
            start_date=start_date,
            end_date=end_date,
            calendar_id=calendar_id
        )
        
        return {"events": events, "count": len(events)}
    
    async def _handle_get_events(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle get events command."""
        return await self._handle_get_calendar(agent_id, params)
    
    async def _handle_create_event(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle create event command."""
        title = params.get("title")
        start_time = params.get("start_time")
        end_time = params.get("end_time")
        description = params.get("description")
        calendar_id = params.get("calendar_id")
        
        if not all([title, start_time, end_time]):
            raise ValueError("Missing required parameters: title, start_time, end_time")
        
        result = await self.resource_manager.create_calendar_event(
            title=title,
            start_time=start_time,
            end_time=end_time,
            description=description,
            calendar_id=calendar_id
        )
        
        return result
    
    async def _handle_check_schedule(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle check schedule command."""
        date = params.get("date", datetime.now().strftime("%Y-%m-%d"))
        
        events = await self.resource_manager.get_calendar_events(
            start_date=date,
            end_date=date
        )
        
        # Analyze schedule
        analysis = {
            "date": date,
            "total_events": len(events),
            "events": events,
            "free_time_slots": [],  # Would calculate based on events
            "busy_periods": [],
            "recommendations": []
        }
        
        # Add basic recommendations
        if len(events) > 8:
            analysis["recommendations"].append("Schedule appears very busy - consider rescheduling non-critical meetings")
        elif len(events) == 0:
            analysis["recommendations"].append("No scheduled events - good day for focused work")
        
        return analysis
    
    # Task command handlers
    async def _handle_get_tasks(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle get tasks command."""
        project_id = params.get("project_id")
        status = params.get("status")
        limit = params.get("limit")
        
        tasks = await self.resource_manager.get_tasks(
            project_id=project_id,
            status=status,
            limit=limit
        )
        
        return {"tasks": tasks, "count": len(tasks)}
    
    async def _handle_create_task(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle create task command."""
        title = params.get("title")
        description = params.get("description")
        project_id = params.get("project_id")
        due_date = params.get("due_date")
        priority = params.get("priority")
        
        if not title:
            raise ValueError("Missing required parameter: title")
        
        result = await self.resource_manager.create_task(
            title=title,
            description=description,
            project_id=project_id,
            due_date=due_date,
            priority=priority
        )
        
        return result
    
    async def _handle_update_task(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle update task command."""
        # This would need to be implemented in the resource manager
        task_id = params.get("task_id")
        updates = params.get("updates", {})
        
        if not task_id:
            raise ValueError("Missing required parameter: task_id")
        
        # For now, return placeholder
        return {"task_id": task_id, "updated": True, "changes": updates}
    
    async def _handle_get_projects(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle get projects command."""
        # This would need to be implemented in the resource manager
        return {"projects": [], "count": 0}
    
    # File command handlers
    async def _handle_list_files(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle list files command."""
        path = params.get("path")
        file_type = params.get("file_type")
        recursive = params.get("recursive", False)
        
        files = await self.resource_manager.get_files(
            path=path,
            file_type=file_type,
            recursive=recursive
        )
        
        return {"files": files, "count": len(files)}
    
    async def _handle_read_file(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle read file command."""
        file_path = params.get("file_path")
        
        if not file_path:
            raise ValueError("Missing required parameter: file_path")
        
        result = await self.resource_manager.read_file(file_path)
        return result
    
    async def _handle_search_files(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle search files command."""
        query = params.get("query")
        path = params.get("path")
        
        if not query:
            raise ValueError("Missing required parameter: query")
        
        # This would need to be implemented as a search tool in MCP
        return {"files": [], "query": query, "count": 0}
    
    # Planning command handlers
    async def _handle_plan_day(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle plan day command - combines calendar and tasks."""
        date = params.get("date", datetime.now().strftime("%Y-%m-%d"))
        
        # Get calendar events
        events = await self.resource_manager.get_calendar_events(
            start_date=date,
            end_date=date
        )
        
        # Get pending tasks
        tasks = await self.resource_manager.get_tasks(status="pending")
        
        # Generate daily plan
        plan = {
            "date": date,
            "scheduled_events": events,
            "available_tasks": tasks[:10],  # Top 10 tasks
            "recommendations": [],
            "time_blocks": [],
            "priorities": []
        }
        
        # Add planning logic
        if events:
            plan["recommendations"].append(f"You have {len(events)} scheduled events today")
        
        if tasks:
            high_priority_tasks = [t for t in tasks if t.get("priority") == "high"]
            if high_priority_tasks:
                plan["recommendations"].append(f"{len(high_priority_tasks)} high-priority tasks require attention")
        
        return plan
    
    async def _handle_analyze_workload(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle analyze workload command."""
        period = params.get("period", "week")  # day, week, month
        
        # This would analyze calendar and tasks over the specified period
        analysis = {
            "period": period,
            "total_events": 0,
            "total_tasks": 0,
            "workload_score": 0,  # 0-100
            "recommendations": [],
            "busy_days": [],
            "free_time": []
        }
        
        return analysis
    
    async def _handle_generate_report(self, agent_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle generate report command."""
        report_type = params.get("type", "daily")
        date_range = params.get("date_range", {})
        
        report = {
            "type": report_type,
            "generated_at": datetime.now().isoformat(),
            "agent_id": agent_id,
            "summary": {},
            "details": {},
            "recommendations": []
        }
        
        return report
    
    async def get_mcp_status(self) -> Dict[str, Any]:
        """Get status of MCP connections and resources."""
        return await self.resource_manager.get_server_status()
    
    async def clear_cache(self):
        """Clear MCP resource cache."""
        self.resource_manager.clear_cache()
    
    def get_agent_capabilities(self, agent_role: AgentRole) -> List[str]:
        """Get MCP capabilities for an agent role."""
        return self.agent_capabilities.get(agent_role, [])