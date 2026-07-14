"""
Smoke test for the FastMCP tool registry (openspec tasks 2.1/2.2).

Spins up a real `@modelcontextprotocol/server-filesystem` stdio server
(via npx) scoped to a temp directory and proves a direct tool dispatch
through MCPToolRegistry returns a real listing -- not a mock. Requires
npx/node and network access to fetch the npm package, same as the
container does at runtime.
"""

import tempfile
from pathlib import Path

import pytest

from services.mcp.fastmcp_manager import MCPToolRegistry


@pytest.mark.asyncio
async def test_registry_lists_real_directory_via_filesystem_server():
    with tempfile.TemporaryDirectory() as tmpdir:
        (Path(tmpdir) / "hello.txt").write_text("hi")

        registry = MCPToolRegistry({
            "max_exposed_tools": 10,
            "servers": {
                "filesystem": {
                    "command": "npx",
                    "args": ["-y", "@modelcontextprotocol/server-filesystem", tmpdir],
                    "allowed_tools": ["list_directory"],
                }
            },
        })

        try:
            await registry.initialize()
            assert "filesystem" in registry.connected_servers
            assert "filesystem_list_directory" in [t["name"] for t in registry.list_tools()]

            result = await registry.call_tool("filesystem_list_directory", {"path": tmpdir})
            assert "hello.txt" in str(result)
        finally:
            await registry.shutdown()


@pytest.mark.asyncio
async def test_registry_degrades_gracefully_on_bad_server():
    """A server that fails to connect must not raise out of initialize()."""
    registry = MCPToolRegistry({
        "servers": {"broken": {"command": "/no/such/binary", "args": []}},
    })

    await registry.initialize()  # must not raise
    assert registry.connected_servers == []
    assert "broken" in registry.get_status()["failed_servers"]

    await registry.shutdown()
