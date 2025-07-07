from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from typing import Dict, List, Optional
import logging

from services import WebSocketManager, SpaceshipService, AgentManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Spaceship Bridge", version="1.0.0")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
websocket_manager = WebSocketManager()
spaceship_service = SpaceshipService()
agent_manager = AgentManager(spaceship_service, websocket_manager)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await spaceship_service.initialize()
    await agent_manager.initialize()
    await agent_manager.start_monitoring()
    logger.info("AI Spaceship Bridge started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await agent_manager.stop_monitoring()
    logger.info("AI Spaceship Bridge shut down")

@app.get("/")
async def get():
    return {"message": "AI Spaceship Bridge API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "connections": websocket_manager.get_connection_count(),
        "bridge_status": "operational"
    }

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

@app.post("/api/agents/{agent_id}/mission")
async def assign_mission(agent_id: str, mission_data: dict):
    """Assign a mission to an agent"""
    mission = mission_data.get("mission", "")
    if not mission:
        raise HTTPException(status_code=400, detail="Mission text required")
    
    success = await agent_manager.send_mission_to_agent(agent_id, mission)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to assign mission")
    
    return {"status": "success", "message": f"Mission assigned to {agent_id}"}

@app.post("/api/agents/{agent_id}/chat")
async def chat_with_agent(agent_id: str, chat_data: dict):
    """Chat with a specific agent"""
    message = chat_data.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message text required")
    
    # This is essentially the same as sending a mission, but with different semantics
    success = await agent_manager.send_mission_to_agent(agent_id, message)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send message to agent")
    
    return {"status": "success", "message": f"Message sent to {agent_id}"}

@app.post("/api/agents/{agent_id}/move")
async def move_agent(agent_id: str, position_data: dict):
    """Move an agent to a new position"""
    try:
        x = position_data["x"]
        y = position_data["y"]
        from models.spaceship import Position
        position = Position(x=x, y=y)
        
        success = await spaceship_service.move_agent(agent_id, position)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid move")
        
        return {"status": "success", "message": f"Agent {agent_id} moved to ({x}, {y})"}
    except KeyError:
        raise HTTPException(status_code=400, detail="x and y coordinates required")

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
    uvicorn.run(app, host="0.0.0.0", port=8000)