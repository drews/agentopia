import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections and broadcasting for the spaceship bridge"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_info: Dict[str, Any] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store client metadata
        self.connection_metadata[websocket] = {
            "connected_at": datetime.now().isoformat(),
            "client_info": client_info or {},
            "subscriptions": []  # Topics this client is subscribed to
        }
        
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message with bridge status
        await self.send_personal_message(websocket, {
            "type": "connection_established",
            "data": {
                "bridge_id": "uss_agentopia",
                "status": "operational",
                "timestamp": datetime.now().isoformat(),
                "connection_id": id(websocket)
            }
        })
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
            
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            # Remove disconnected client
            if websocket in self.active_connections:
                self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any], exclude: List[WebSocket] = None):
        """Broadcast a message to all connected clients"""
        exclude = exclude or []
        message["timestamp"] = datetime.now().isoformat()
        
        disconnected = []
        for connection in self.active_connections:
            if connection not in exclude:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_subscribers(self, topic: str, message: Dict[str, Any]):
        """Broadcast a message to clients subscribed to a specific topic"""
        message["timestamp"] = datetime.now().isoformat()
        message["topic"] = topic
        
        disconnected = []
        for connection in self.active_connections:
            metadata = self.connection_metadata.get(connection, {})
            subscriptions = metadata.get("subscriptions", [])
            
            if topic in subscriptions or "all" in subscriptions:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending to subscriber: {e}")
                    disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    def subscribe_client(self, websocket: WebSocket, topics: List[str]):
        """Subscribe a client to specific topics"""
        if websocket in self.connection_metadata:
            current_subs = self.connection_metadata[websocket].get("subscriptions", [])
            new_subs = list(set(current_subs + topics))
            self.connection_metadata[websocket]["subscriptions"] = new_subs
            logger.info(f"Client subscribed to topics: {topics}")
    
    def unsubscribe_client(self, websocket: WebSocket, topics: List[str]):
        """Unsubscribe a client from specific topics"""
        if websocket in self.connection_metadata:
            current_subs = self.connection_metadata[websocket].get("subscriptions", [])
            new_subs = [topic for topic in current_subs if topic not in topics]
            self.connection_metadata[websocket]["subscriptions"] = new_subs
            logger.info(f"Client unsubscribed from topics: {topics}")
    
    async def broadcast_agent_update(self, agent_data: Dict[str, Any]):
        """Broadcast agent position/status updates"""
        await self.broadcast_to_subscribers("agents", {
            "type": "agent_update",
            "data": agent_data
        })
    
    async def broadcast_station_update(self, station_data: Dict[str, Any]):
        """Broadcast station status updates"""
        await self.broadcast_to_subscribers("stations", {
            "type": "station_update", 
            "data": station_data
        })
    
    async def broadcast_bridge_status(self, status_data: Dict[str, Any]):
        """Broadcast overall bridge status"""
        await self.broadcast({
            "type": "bridge_status",
            "data": status_data
        })
    
    async def broadcast_mission_update(self, mission_data: Dict[str, Any]):
        """Broadcast mission progress updates"""
        await self.broadcast_to_subscribers("missions", {
            "type": "mission_update",
            "data": mission_data
        })
    
    async def broadcast_chat_message(self, message_data: Dict[str, Any]):
        """Broadcast agent chat/communication messages"""
        await self.broadcast_to_subscribers("chat", {
            "type": "chat_message",
            "data": message_data
        })
    
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
    
    def get_connection_info(self) -> List[Dict[str, Any]]:
        """Get information about all connections"""
        return [
            {
                "connection_id": id(ws),
                "metadata": self.connection_metadata.get(ws, {})
            }
            for ws in self.active_connections
        ]