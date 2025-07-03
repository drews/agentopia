import aiosqlite
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path: str = "spaceship_bridge.db"):
        self.db_path = db_path
        
    async def init_database(self):
        """Initialize the database with required tables"""
        async with aiosqlite.connect(self.db_path) as db:
            await self._create_tables(db)
            await self._insert_default_data(db)
            await db.commit()
            logger.info("Database initialized successfully")
    
    async def _create_tables(self, db: aiosqlite.Connection):
        """Create all required tables"""
        
        # Agents table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                position_x INTEGER NOT NULL,
                position_y INTEGER NOT NULL,
                assigned_station TEXT,
                status TEXT NOT NULL DEFAULT 'idle',
                current_task TEXT,
                avatar TEXT DEFAULT '🤖',
                path_json TEXT DEFAULT '[]',
                last_activity TEXT NOT NULL
            )
        """)
        
        # Stations table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS stations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                station_type TEXT NOT NULL,
                position_x INTEGER NOT NULL,
                position_y INTEGER NOT NULL,
                width INTEGER NOT NULL,
                height INTEGER NOT NULL,
                capacity INTEGER DEFAULT 1,
                required_role TEXT,
                status TEXT NOT NULL DEFAULT 'operational',
                description TEXT DEFAULT '',
                mcp_tools_json TEXT DEFAULT '[]',
                resource_usage_json TEXT DEFAULT '{}',
                icon TEXT DEFAULT '🖥️',
                color TEXT DEFAULT '#4A90E2',
                last_updated TEXT NOT NULL
            )
        """)
        
        # Spaceship table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS spaceship (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                ship_class TEXT DEFAULT 'Constitution',
                registry TEXT DEFAULT 'NCC-1701',
                layout_json TEXT NOT NULL,
                current_mission TEXT,
                status TEXT NOT NULL DEFAULT 'operational',
                mcp_servers_json TEXT DEFAULT '{}',
                power_level REAL DEFAULT 100.0,
                crew_count INTEGER DEFAULT 0,
                commissioned TEXT NOT NULL,
                last_updated TEXT NOT NULL
            )
        """)
        
        # Rooms table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                room_type TEXT NOT NULL,
                description TEXT DEFAULT '',
                mcp_server_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'offline',
                icon TEXT DEFAULT '🏠',
                color TEXT DEFAULT '#7B68EE',
                metrics_json TEXT DEFAULT '{}',
                authorized_roles_json TEXT DEFAULT '[]',
                current_occupants_json TEXT DEFAULT '[]',
                max_occupancy INTEGER DEFAULT 5,
                help_text TEXT DEFAULT '',
                tool_descriptions_json TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                last_accessed TEXT,
                last_updated TEXT NOT NULL
            )
        """)
        
        logger.info("Database tables created")
    
    async def _insert_default_data(self, db: aiosqlite.Connection):
        """Insert default spaceship configuration"""
        
        # Check if spaceship already exists
        cursor = await db.execute("SELECT COUNT(*) FROM spaceship")
        count = await cursor.fetchone()
        if count[0] > 0:
            return  # Data already exists
        
        # Default spaceship configuration
        layout = {
            "dimensions": {"width": 24, "height": 16},
            "stations": [],
            "walls": [
                {"x1": 0, "y1": 0, "x2": 23, "y2": 0, "wall_type": "solid"},
                {"x1": 0, "y1": 15, "x2": 23, "y2": 15, "wall_type": "solid"},
                {"x1": 0, "y1": 0, "x2": 0, "y2": 15, "wall_type": "solid"},
                {"x1": 23, "y1": 0, "x2": 23, "y2": 15, "wall_type": "solid"}
            ],
            "corridors": [
                {"x1": 1, "y1": 8, "x2": 22, "y2": 8, "corridor_type": "main_corridor"}
            ]
        }
        
        now = datetime.now().isoformat()
        
        # Insert default spaceship
        await db.execute("""
            INSERT INTO spaceship (id, name, ship_class, registry, layout_json, status, 
                                 mcp_servers_json, commissioned, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "uss_agentopia",
            "USS Agentopia", 
            "Constitution",
            "NCC-1701-A",
            json.dumps(layout),
            "operational",
            json.dumps({
                "engineering": "filesystem_server",
                "science": "web_search_server", 
                "communications": "api_server",
                "bridge": "core_server"
            }),
            now,
            now
        ))
        
        # Insert default stations
        stations = [
            {
                "id": "command_station",
                "name": "Command Station",
                "station_type": "command",
                "position_x": 10, "position_y": 6,
                "width": 4, "height": 3,
                "capacity": 2,
                "required_role": "executive_officer",
                "description": "Primary ship command and control",
                "icon": "⭐",
                "color": "#FFD700"
            },
            {
                "id": "engineering_station", 
                "name": "Engineering Station",
                "station_type": "engineering",
                "position_x": 3, "position_y": 10,
                "width": 3, "height": 2,
                "capacity": 1,
                "required_role": "operations_officer",
                "description": "Ship systems and power management",
                "mcp_tools": ["file_read", "file_write", "directory_list"],
                "icon": "⚙️",
                "color": "#FF6B35"
            },
            {
                "id": "science_station",
                "name": "Science Station", 
                "station_type": "science",
                "position_x": 18, "position_y": 4,
                "width": 3, "height": 2,
                "capacity": 1,
                "required_role": "science_officer",
                "description": "Research and analysis workstation",
                "mcp_tools": ["web_search", "data_analysis", "research"],
                "icon": "🔬",
                "color": "#4A90E2"
            }
        ]
        
        for station in stations:
            await db.execute("""
                INSERT INTO stations (id, name, station_type, position_x, position_y,
                                    width, height, capacity, required_role, description,
                                    mcp_tools_json, icon, color, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                station["id"], station["name"], station["station_type"],
                station["position_x"], station["position_y"],
                station["width"], station["height"], station["capacity"],
                station.get("required_role"), station["description"],
                json.dumps(station.get("mcp_tools", [])),
                station["icon"], station["color"], now
            ))
        
        # Insert default agents
        agents = [
            {
                "id": "red_agent",
                "name": "Commander",
                "role": "executive_officer",
                "position_x": 12, "position_y": 7,
                "assigned_station": "command_station",
                "avatar": "👨‍✈️"
            },
            {
                "id": "blue_agent", 
                "name": "Science Officer",
                "role": "science_officer",
                "position_x": 19, "position_y": 5,
                "assigned_station": "science_station",
                "avatar": "👩‍🔬"
            },
            {
                "id": "yellow_agent",
                "name": "Operations Officer", 
                "role": "operations_officer",
                "position_x": 4, "position_y": 11,
                "assigned_station": "engineering_station",
                "avatar": "👨‍🔧"
            }
        ]
        
        for agent in agents:
            await db.execute("""
                INSERT INTO agents (id, name, role, position_x, position_y,
                                  assigned_station, avatar, last_activity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                agent["id"], agent["name"], agent["role"],
                agent["position_x"], agent["position_y"],
                agent.get("assigned_station"), agent["avatar"], now
            ))
        
        logger.info("Default data inserted")

    # Agent CRUD operations
    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent by ID"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "SELECT * FROM agents WHERE id = ?", (agent_id,)
            )
            row = await cursor.fetchone()
            if row:
                return self._row_to_agent_dict(row)
            return None
    
    async def get_all_agents(self) -> List[Dict[str, Any]]:
        """Get all agents"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT * FROM agents")
            rows = await cursor.fetchall()
            return [self._row_to_agent_dict(row) for row in rows]
    
    async def update_agent_position(self, agent_id: str, x: int, y: int):
        """Update agent position"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE agents SET position_x = ?, position_y = ?, last_activity = ?
                WHERE id = ?
            """, (x, y, datetime.now().isoformat(), agent_id))
            await db.commit()
    
    async def update_agent_status(self, agent_id: str, status: str, task: Optional[str] = None):
        """Update agent status and current task"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE agents SET status = ?, current_task = ?, last_activity = ?
                WHERE id = ?
            """, (status, task, datetime.now().isoformat(), agent_id))
            await db.commit()
    
    # Station CRUD operations
    async def get_all_stations(self) -> List[Dict[str, Any]]:
        """Get all stations"""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("SELECT * FROM stations")
            rows = await cursor.fetchall()
            return [self._row_to_station_dict(row) for row in rows]
    
    # Helper methods to convert database rows to dictionaries
    def _row_to_agent_dict(self, row) -> Dict[str, Any]:
        """Convert agent database row to dictionary"""
        return {
            "id": row[0],
            "name": row[1], 
            "role": row[2],
            "position": {"x": row[3], "y": row[4]},
            "assigned_station": row[5],
            "status": row[6],
            "current_task": row[7],
            "avatar": row[8],
            "path": json.loads(row[9]) if row[9] else [],
            "last_activity": row[10]
        }
    
    def _row_to_station_dict(self, row) -> Dict[str, Any]:
        """Convert station database row to dictionary"""
        return {
            "id": row[0],
            "name": row[1],
            "station_type": row[2],
            "position": {"x": row[3], "y": row[4]},
            "dimensions": {"width": row[5], "height": row[6]},
            "capacity": row[7],
            "required_role": row[8],
            "status": row[9],
            "description": row[10],
            "mcp_tools": json.loads(row[11]) if row[11] else [],
            "resource_usage": json.loads(row[12]) if row[12] else {},
            "icon": row[13],
            "color": row[14],
            "last_updated": row[15]
        }

# Global database instance
db = Database()