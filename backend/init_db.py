#!/usr/bin/env python3
"""Initialize the SQLite database for the spaceship bridge."""

import sqlite3
import os

def init_database():
    """Initialize the database with basic tables."""
    db_path = "spaceship_bridge.db"
    
    # Create database file if it doesn't exist
    if not os.path.exists(db_path):
        print(f"Creating database: {db_path}")
        conn = sqlite3.connect(db_path)
        
        # Create basic tables (you can expand this as needed)
        cursor = conn.cursor()
        
        # Example tables - adjust based on your actual schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                position_x INTEGER,
                position_y INTEGER,
                avatar TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                position_x INTEGER,
                position_y INTEGER,
                width INTEGER,
                height INTEGER,
                icon TEXT,
                color TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bridge_state (
                id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                layout_width INTEGER,
                layout_height INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert some default data
        cursor.execute('''
            INSERT OR REPLACE INTO bridge_state (id, status, layout_width, layout_height)
            VALUES ('uss_agentopia', 'operational', 20, 12)
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    else:
        print(f"Database {db_path} already exists")

if __name__ == "__main__":
    init_database()