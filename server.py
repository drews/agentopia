#!/usr/bin/env python3

import asyncio
import json
import os
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from virtual_env_db import DatabaseVirtualEnvironment
from database import db_manager

app = FastAPI(title="Agentopia Virtual Environment")

# Global environment instance
env: DatabaseVirtualEnvironment = None
connected_clients: Dict[str, WebSocket] = {}

@app.on_event("startup")
async def startup_event():
    global env
    env = DatabaseVirtualEnvironment(db_manager)
    await env.start()
    print("🚀 Agentopia server started with database backend")

@app.on_event("shutdown")
async def shutdown_event():
    global env
    if env:
        await env.stop()
    print("🛑 Agentopia server stopped")

# Serve static files
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def read_root():
    return FileResponse("index.html")

@app.get("/api/status")
async def get_status():
    if not env:
        return {"error": "Environment not initialized"}
    return env.get_environment_status()

@app.get("/api/rooms")
async def get_rooms():
    if not env:
        return {"error": "Environment not initialized"}
    
    rooms = await env.get_all_rooms()
    room_data = {}
    
    for room in rooms:
        room_data[room.id] = await env.get_room_status(room.id)
    
    return room_data

@app.get("/api/agents")
async def get_agents():
    if not env:
        return {"error": "Environment not initialized"}
    
    agents = await env.get_all_agents()
    return {
        agent.id: {
            "id": agent.id,
            "name": agent.name,
            "state": agent.state,
            "current_room": agent.current_room,
            "properties": agent.properties
        }
        for agent in agents
    }

@app.post("/api/agents")
async def create_agent(agent_data: Dict[str, Any]):
    if not env:
        return {"error": "Environment not initialized"}
    
    name = agent_data.get("name", "Unknown Agent")
    properties = agent_data.get("properties", {})
    
    agent_id = await env.create_agent(name, properties)
    await broadcast_update("agent_created", {"agent_id": agent_id, "name": name})
    
    return {"agent_id": agent_id, "name": name}

@app.post("/api/agents/{agent_id}/move")
async def move_agent(agent_id: str, move_data: Dict[str, Any]):
    if not env:
        return {"error": "Environment not initialized"}
    
    room_id = move_data.get("room_id")
    if not room_id:
        return {"error": "room_id required"}
    
    success = await env.agent_enter_room(agent_id, room_id)
    if success:
        await broadcast_update("agent_moved", {"agent_id": agent_id, "room_id": room_id})
        return {"success": True}
    else:
        return {"error": "Failed to move agent"}

@app.post("/api/agents/{agent_id}/interact")
async def agent_interact(agent_id: str, interaction_data: Dict[str, Any]):
    if not env:
        return {"error": "Environment not initialized"}
    
    content = interaction_data.get("content", "")
    interaction_type = interaction_data.get("type", "general")
    
    success = await env.agent_interact(agent_id, content, interaction_type)
    if success:
        await broadcast_update("interaction", {
            "agent_id": agent_id, 
            "content": content, 
            "type": interaction_type
        })
        return {"success": True}
    else:
        return {"error": "Failed to process interaction"}

@app.post("/api/agents/{agent_id}/use_tool")
async def use_tool(agent_id: str, tool_data: Dict[str, Any]):
    if not env:
        return {"error": "Environment not initialized"}
    
    tool_name = tool_data.get("tool_name")
    parameters = tool_data.get("parameters", {})
    
    result = await env.agent_use_tool(agent_id, tool_name, parameters)
    await broadcast_update("tool_used", {
        "agent_id": agent_id,
        "tool_name": tool_name,
        "result": result
    })
    
    return result

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connected_clients[client_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            
    except WebSocketDisconnect:
        if client_id in connected_clients:
            del connected_clients[client_id]

async def broadcast_update(update_type: str, data: Dict[str, Any]):
    """Broadcast updates to all connected WebSocket clients"""
    if not connected_clients:
        return
    
    # Get recent interactions for timestamp
    recent_interactions = await env.db.get_interactions(limit=1)
    timestamp = recent_interactions[0].timestamp.isoformat() if recent_interactions else None
    
    message = json.dumps({
        "type": update_type,
        "data": data,
        "timestamp": timestamp
    })
    
    disconnected = []
    for client_id, websocket in connected_clients.items():
        try:
            await websocket.send_text(message)
        except:
            disconnected.append(client_id)
    
    # Clean up disconnected clients
    for client_id in disconnected:
        connected_clients.pop(client_id, None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")