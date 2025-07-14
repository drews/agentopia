#!/usr/bin/env python3
"""
Test MCP integration from within the backend container.
"""

import asyncio
import sys
import json
from pathlib import Path
sys.path.append('/app')

from services.mcp.mcp_server_manager import MCPServerManager

async def test_mcp_integration():
    """Test the complete MCP integration."""
    print("🔧 Testing MCP Integration...")
    
    # Test configuration loading
    print("1. Testing configuration loading...")
    config_path = "/workspace/config/mcp_config.json"
    
    # Check if config exists and is valid
    if not Path(config_path).exists():
        print(f"❌ Config file not found at {config_path}")
        return False
    
    try:
        with open(config_path) as f:
            config_data = json.load(f)
        server_count = len(config_data.get("servers", {}))
        print(f"✅ Config loaded: {server_count} servers configured")
    except Exception as e:
        print(f"❌ Failed to load config: {e}")
        return False
    
    # Test server manager initialization
    print("2. Testing server manager initialization...")
    server_manager = MCPServerManager(config_path)
    await server_manager.initialize()
    
    try:
        # Test server status
        print("3. Testing server status...")
        status = server_manager.get_server_status()
        if not status:
            print("❌ No servers configured")
            return False
        
        connected_servers = [name for name, info in status.items() if info.get('connected')]
        print(f"✅ Server status: {len(connected_servers)}/{len(status)} servers connected")
        for name, info in status.items():
            status_icon = "✅" if info.get('connected') else "❌"
            print(f"  {status_icon} {name}: {info.get('url')}")
        
        # Test tool call if datetime-tools is available
        if "datetime-tools" in connected_servers:
            print("4. Testing datetime-tools...")
            try:
                result = await server_manager.call_tool("current_time", {}, "datetime-tools")
                print(f"✅ Current time: {result.get('formatted', 'No time')}")
                
                result = await server_manager.call_tool("days_until", {"target_date": "Christmas"}, "datetime-tools")
                print(f"✅ {result.get('message', 'No message')}")
            except Exception as e:
                print(f"⚠️ Datetime tools not accessible: {e}")
        
        # Test resource discovery
        print("5. Testing resource discovery...")
        try:
            resources = await server_manager.get_available_resources()
            total_resources = sum(len(server_resources) for server_resources in resources.values())
            print(f"✅ Found {total_resources} total resources across {len(resources)} servers")
            for server_name, server_resources in resources.items():
                if server_resources:
                    print(f"  - {server_name}: {len(server_resources)} resources")
        except Exception as e:
            print(f"⚠️ Resource discovery failed: {e}")
        
        print("🎉 MCP integration test completed!")
        return len(connected_servers) > 0  # Success if at least one server connected
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await server_manager.shutdown()

if __name__ == "__main__":
    success = asyncio.run(test_mcp_integration())
    sys.exit(0 if success else 1)