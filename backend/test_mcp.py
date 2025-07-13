#!/usr/bin/env python3
"""
Test MCP integration from within the backend container.
"""

import asyncio
import sys
sys.path.append('/app')

from services.mcp.mcp_client import MCPClient, MCPServerConfig

async def test_mcp_integration():
    """Test the complete MCP integration."""
    print("🔧 Testing MCP Integration...")
    
    client = MCPClient()
    await client.initialize()
    
    config = MCPServerConfig(
        name="datetime-tools",
        url="http://host.docker.internal:3000",
        capabilities=["datetime", "calendar", "holidays", "calculations"],
        timeout=30
    )
    client.add_server(config)
    
    try:
        # Test connection
        print("1. Testing connection...")
        connected = await client.connect_to_server("datetime-tools")
        if not connected:
            print("❌ Failed to connect")
            return False
        print("✅ Connected successfully")
        
        # Test capabilities
        print("2. Testing capabilities...")
        capabilities = await client.get_server_capabilities("datetime-tools")
        tools = capabilities.get('tools', [])
        print(f"✅ Available tools: {tools[:3]}... ({len(tools)} total)")
        
        # Test simple tool call
        print("3. Testing current_time tool...")
        result = await client.call_tool("datetime-tools", "current_time", {})
        print(f"✅ Current time: {result.get('formatted', 'No time')}")
        
        # Test tool call with parameters
        print("4. Testing days_until tool...")
        result = await client.call_tool("datetime-tools", "days_until", {"target_date": "Christmas"})
        print(f"✅ {result.get('message', 'No message')}")
        
        # Test resource access
        print("5. Testing resource access...")
        result = await client.get_resource("datetime-tools", "datetime://help")
        help_size = len(result.get('content', ''))
        print(f"✅ Retrieved help resource ({help_size} chars)")
        
        print("🎉 MCP integration working perfectly!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await client.shutdown()

if __name__ == "__main__":
    success = asyncio.run(test_mcp_integration())
    sys.exit(0 if success else 1)