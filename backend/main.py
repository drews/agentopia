from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from typing import Dict, List, Optional
import logging

from core.config import get_settings, configure_logging
from core.exceptions import (
    AgentopiaException, AgentNotFoundException, ConfigurationError,
    agentopia_exception_handler, general_exception_handler, http_exception_handler
)
from core.schemas import (
    HealthResponse, BridgeState, ChatRequest, ChatResponse, 
    MissionRequest, MoveRequest, SuccessResponse, ConfigurationResponse
)
from services import WebSocketManager, SpaceshipService, AgentManager
from database import db

# Get settings and configure logging
settings = get_settings()
configure_logging(settings)
logger = logging.getLogger(__name__)

# Global service instances - will be initialized in lifespan
websocket_manager: WebSocketManager
spaceship_service: SpaceshipService  
agent_manager: AgentManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - handles startup and shutdown"""
    # Startup
    global websocket_manager, spaceship_service, agent_manager
    
    logger.info("Initializing AI Spaceship Bridge services...")
    
    try:
        # Initialize services
        websocket_manager = WebSocketManager()
        spaceship_service = SpaceshipService()
        agent_manager = AgentManager(spaceship_service, websocket_manager)
        
        await spaceship_service.initialize()
        await agent_manager.initialize()
        await agent_manager.start_monitoring()
        
        logger.info("AI Spaceship Bridge started successfully")
        
        yield  # Application runs here
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    finally:
        # Shutdown
        logger.info("Shutting down AI Spaceship Bridge...")
        try:
            await agent_manager.stop_monitoring()
            logger.info("AI Spaceship Bridge shut down successfully")
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")


app = FastAPI(
    title=settings.app_name, 
    version=settings.app_version,
    description="AI-powered executive functioning tool with spaceship bridge interface",
    debug=settings.debug,
    lifespan=lifespan
)

# Add exception handlers
app.add_exception_handler(AgentopiaException, agentopia_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def get():
    return {"message": "AI Spaceship Bridge API", "status": "operational"}

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint with proper response validation"""
    try:
        connection_count = websocket_manager.get_connection_count()
        return HealthResponse(
            status="healthy",
            connections=connection_count,
            bridge_status="operational"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail="Service temporarily unavailable"
        )


@app.get("/api/llm/status")
async def get_llm_status():
    """Get LLM provider status and availability"""
    try:
        llm_service = agent_manager.llm_service
        providers = llm_service.list_available_providers()
        
        status = {
            "default_provider": settings.default_llm_provider,
            "providers": {}
        }
        
        for provider in providers:
            provider_info = llm_service.get_provider_info(provider)
            is_available = await llm_service.is_provider_available(provider)
            
            status["providers"][provider] = {
                **provider_info,
                "available": is_available,
                "is_default": provider == settings.default_llm_provider
            }
        
        return status
    except Exception as e:
        logger.error(f"LLM status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"LLM status check failed: {str(e)}")

@app.post("/api/llm/test")
async def test_llm_response(chat_data: ChatRequest):
    """Test LLM response generation"""
    try:
        llm_service = agent_manager.llm_service
        
        response = await llm_service.generate_response(
            prompt=chat_data.message,
            system_prompt="You are a helpful AI assistant on a starship bridge."
        )
        
        return {
            "response": response,
            "provider": settings.default_llm_provider,
            "success": True
        }
    except Exception as e:
        logger.error(f"LLM test failed: {e}")
        raise HTTPException(status_code=500, detail=f"LLM test failed: {str(e)}")

@app.get("/api/bridge/state")
async def get_bridge_state():
    """Get the current state of the bridge"""
    return await spaceship_service.get_bridge_state()

@app.get("/api/bridge/statistics")
async def get_bridge_statistics():
    """Get bridge operational statistics"""
    return await spaceship_service.get_bridge_statistics()

@app.get("/api/agents")
async def get_all_agents():
    """Get all agents"""
    bridge_state = await spaceship_service.get_bridge_state()
    return bridge_state["agents"]

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent details"""
    report = await agent_manager.get_agent_report(agent_id)
    if not report:
        raise HTTPException(status_code=404, detail="Agent not found")
    return report

@app.post("/api/agents/{agent_id}/mission", response_model=SuccessResponse)
async def assign_mission(agent_id: str, mission_data: MissionRequest) -> SuccessResponse:
    """Assign a mission to an agent with proper validation"""
    try:
        # Validate agent exists
        agent = await db.get_agent(agent_id)
        if not agent:
            raise AgentNotFoundException(agent_id)
        
        # Send mission to agent
        success = await agent_manager.send_mission_to_agent(agent_id, mission_data.mission)
        if not success:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to assign mission to agent {agent_id}"
            )
        
        priority_text = f" (priority: {mission_data.priority})" if mission_data.priority else ""
        return SuccessResponse(message=f"Mission assigned to {agent_id}{priority_text}")
        
    except AgentNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error assigning mission to agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to assign mission"
        )

@app.post("/api/agents/{agent_id}/chat", response_model=SuccessResponse)
async def chat_with_agent(agent_id: str, chat_data: ChatRequest) -> SuccessResponse:
    """Chat with a specific agent with proper validation"""
    try:
        # Validate agent exists
        agent = await db.get_agent(agent_id)
        if not agent:
            raise AgentNotFoundException(agent_id)
        
        # Send message to agent
        success = await agent_manager.send_mission_to_agent(agent_id, chat_data.message)
        if not success:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to send message to agent {agent_id}"
            )
        
        return SuccessResponse(message=f"Message sent to {agent_id}")
        
    except AgentNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error in chat with agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request"
        )

@app.post("/api/agents/{agent_id}/move", response_model=SuccessResponse)
async def move_agent(agent_id: str, move_data: MoveRequest) -> SuccessResponse:
    """Move an agent to a new position with proper validation"""
    try:
        # Validate agent exists
        agent = await db.get_agent(agent_id)
        if not agent:
            raise AgentNotFoundException(agent_id)
        
        # Create position object using our schema
        from models.spaceship import Position
        position = Position(x=move_data.x, y=move_data.y)
        
        # Attempt to move agent
        success = await spaceship_service.move_agent(agent_id, position)
        if not success:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid move for agent {agent_id} to position ({move_data.x}, {move_data.y})"
            )
        
        return SuccessResponse(message=f"Agent {agent_id} moved to ({move_data.x}, {move_data.y})")
        
    except AgentNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error moving agent {agent_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to move agent"
        )

@app.get("/api/stations")
async def get_all_stations():
    """Get all stations"""
    bridge_state = await spaceship_service.get_bridge_state()
    return bridge_state["stations"]

@app.post("/api/emergency/stop")
async def emergency_stop():
    """Emergency stop all agents"""
    await agent_manager.emergency_all_stop()
    return {"status": "success", "message": "Emergency stop activated"}

@app.post("/api/config/reload")
async def reload_config():
    """Reload agent configuration from files"""
    try:
        # Reload agent manager's LLM service config
        await agent_manager.llm_service.initialize()
        return {"status": "success", "message": "Configuration reloaded successfully"}
    except Exception as e:
        logger.error(f"Error reloading config: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reload config: {str(e)}")

@app.get("/api/config/agents")
async def get_agent_configs():
    """Get current agent configurations"""
    try:
        from services.config_service import config_service
        configs = config_service.get_all_agent_configs()
        return {"agents": configs}
    except Exception as e:
        logger.error(f"Error getting agent configs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get configs: {str(e)}")

@app.get("/api/personas")
async def get_available_personas():
    """Get all available personas with descriptions"""
    try:
        personas = await agent_manager.get_available_personas()
        active_persona = await agent_manager.get_active_persona()
        return {
            "personas": personas,
            "active_persona": active_persona
        }
    except Exception as e:
        logger.error(f"Error getting personas: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get personas: {str(e)}")

@app.post("/api/personas/{persona_id}/activate")
async def activate_persona(persona_id: str):
    """Activate a specific persona for all agents"""
    try:
        success = await agent_manager.set_persona(persona_id)
        if success:
            return {"status": "success", "message": f"Persona '{persona_id}' activated", "active_persona": persona_id}
        else:
            raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
    except Exception as e:
        logger.error(f"Error activating persona: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to activate persona: {str(e)}")

@app.post("/api/agents/{agent_id}/mission/persona", response_model=SuccessResponse)
async def assign_mission_with_persona(agent_id: str, mission_data: MissionRequest, persona_id: Optional[str] = None):
    """Assign a mission to an agent with a specific persona"""
    try:
        # Validate agent exists
        agent = await db.get_agent(agent_id)
        if not agent:
            raise AgentNotFoundException(agent_id)
        
        # Send persona-aware mission to agent
        success = await agent_manager.send_mission_to_agent_with_persona(
            agent_id, mission_data.mission, persona_id
        )
        if not success:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to assign persona mission to agent {agent_id}"
            )
        
        return SuccessResponse(
            success=True, 
            message=f"Mission assigned to {agent_id} with persona context"
        )
    except AgentNotFoundException:
        raise  # Re-raise the custom exception
    except Exception as e:
        logger.error(f"Error assigning persona mission to {agent_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mcp/status")
async def get_mcp_status():
    """Get MCP server connection status"""
    try:
        status = await agent_manager.mcp_bridge.get_mcp_status()
        return status
    except Exception as e:
        logger.error(f"Error getting MCP status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get MCP status: {str(e)}")

@app.post("/api/mcp/clear-cache")
async def clear_mcp_cache():
    """Clear MCP resource cache"""
    try:
        await agent_manager.mcp_bridge.clear_cache()
        return {"status": "success", "message": "MCP cache cleared"}
    except Exception as e:
        logger.error(f"Error clearing MCP cache: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

@app.get("/api/mcp/capabilities/{agent_id}")
async def get_agent_mcp_capabilities(agent_id: str):
    """Get MCP capabilities for a specific agent"""
    try:
        agent = await db.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        from models.agent import AgentRole
        agent_role_str = agent.get("role", "bridge_crew")
        try:
            agent_role = AgentRole(agent_role_str)
        except ValueError:
            agent_role = AgentRole.BRIDGE_CREW
        
        capabilities = agent_manager.mcp_bridge.get_agent_capabilities(agent_role)
        return {
            "agent_id": agent_id,
            "role": agent_role_str,
            "mcp_capabilities": capabilities
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent MCP capabilities: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get capabilities: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        # Send initial bridge state
        bridge_state = await spaceship_service.get_bridge_state()
        await websocket_manager.send_personal_message(websocket, {
            "type": "initial_state",
            "data": bridge_state
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            message_type = message.get("type")
            
            if message_type == "subscribe":
                topics = message.get("topics", [])
                websocket_manager.subscribe_client(websocket, topics)
                
            elif message_type == "unsubscribe":
                topics = message.get("topics", [])
                websocket_manager.unsubscribe_client(websocket, topics)
                
            elif message_type == "agent_command":
                # Handle agent commands
                agent_id = message.get("agent_id")
                command = message.get("command")
                if agent_id and command:
                    await agent_manager.send_mission_to_agent(agent_id, command)
                    
            elif message_type == "chat_message":
                # Handle chat messages
                await websocket_manager.broadcast_chat_message(message.get("data", {}))
            
            else:
                # Echo unknown messages
                await websocket_manager.broadcast({
                    "type": "echo",
                    "data": message
                })
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
        await websocket_manager.broadcast({
            "type": "client_disconnected",
            "data": {"message": "A client left the bridge"}
        })

# Mount static files (for React frontend)
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.host, 
        port=settings.port,
        log_level=settings.log_level.lower(),
        reload=settings.debug
    )