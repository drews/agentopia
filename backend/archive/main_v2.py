from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Spaceship Bridge", version="1.0.0")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple WebSocket manager
class SimpleWebSocketManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

manager = SimpleWebSocketManager()

@app.get("/")
def read_root():
    return {"message": "AI Spaceship Bridge API", "status": "operational"}

@app.get("/health")
def health():
    return {
        "status": "healthy", 
        "connections": len(manager.active_connections),
        "bridge_status": "operational"
    }

@app.get("/api/bridge/state")
def get_bridge_state():
    """Mock bridge state for now"""
    return {
        "bridge_id": "uss_agentopia",
        "status": "operational",
        "agents": [
            {
                "id": "red_agent",
                "name": "Commander",
                "position": {"x": 12, "y": 7},
                "status": "active",
                "avatar": "👨‍✈️"
            },
            {
                "id": "blue_agent", 
                "name": "Science Officer",
                "position": {"x": 19, "y": 5},
                "status": "thinking",
                "avatar": "👩‍🔬"
            },
            {
                "id": "yellow_agent",
                "name": "Operations Officer",
                "position": {"x": 4, "y": 11}, 
                "status": "working",
                "avatar": "👨‍🔧"
            }
        ],
        "stations": [
            {
                "id": "command_station",
                "name": "Command Station",
                "position": {"x": 10, "y": 6},
                "dimensions": {"width": 4, "height": 3},
                "icon": "⭐",
                "color": "#FFD700"
            },
            {
                "id": "engineering_station",
                "name": "Engineering Station", 
                "position": {"x": 3, "y": 10},
                "dimensions": {"width": 3, "height": 2},
                "icon": "⚙️",
                "color": "#FF6B35"
            },
            {
                "id": "science_station",
                "name": "Science Station",
                "position": {"x": 18, "y": 4},
                "dimensions": {"width": 3, "height": 2},
                "icon": "🔬", 
                "color": "#4A90E2"
            }
        ],
        "layout": {"width": 24, "height": 16}
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial bridge state
        initial_data = {
            "type": "initial_state",
            "data": get_bridge_state()
        }
        await websocket.send_text(json.dumps(initial_data))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo message back for now
            response = {
                "type": "echo",
                "data": message
            }
            await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)