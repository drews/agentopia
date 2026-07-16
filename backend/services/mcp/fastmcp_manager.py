"""
FastMCP-backed tool registry.

Connects to one or more stdio MCP servers (configured in config/agentopia.json
under "mcp") and aggregates their tools into a single namespaced, allowlisted
registry (`{server}_{tool}`, capped at `max_exposed_tools`). Wired into the
FastAPI lifespan so the clients (and their stdio subprocesses) live for the
duration of the app.

Each server gets its own FastMCP `Client` and is connected independently: if
one server fails to start (missing binary, bad args, npx offline, ...) it is
logged and skipped, the rest still connect, and startup never fails because
of it. Tool names are namespaced by us (not by FastMCP) because FastMCP only
auto-prefixes tool names when 2+ servers are mounted on one client -- a
single-server client (our common case, e.g. filesystem-only) returns bare
tool names, so relying on FastMCP's own prefixing breaks the one-server
config that this project actually ships.
"""

from typing import Any, Dict, List, Optional
import logging

from fastmcp import Client

logger = logging.getLogger(__name__)

DEFAULT_MAX_EXPOSED_TOOLS = 10


class MCPToolRegistry:
    """Aggregates tools from configured stdio MCP servers, one FastMCP client per server."""

    def __init__(self, mcp_config: Optional[Dict[str, Any]] = None):
        mcp_config = mcp_config or {}
        self._server_configs: Dict[str, Dict[str, Any]] = mcp_config.get("servers", {})
        self._max_exposed_tools = mcp_config.get("max_exposed_tools", DEFAULT_MAX_EXPOSED_TOOLS)
        self._clients: Dict[str, Client] = {}  # server name -> connected client
        self._tools: Dict[str, Dict[str, Any]] = {}  # namespaced tool name -> metadata
        self._failed_servers: Dict[str, str] = {}  # server name -> error message

    @property
    def enabled_servers(self) -> Dict[str, Dict[str, Any]]:
        return {name: cfg for name, cfg in self._server_configs.items() if cfg.get("enabled", True)}

    @property
    def connected_servers(self) -> List[str]:
        return list(self._clients.keys())

    async def initialize(self):
        """Connect to each configured stdio MCP server independently and build the tool registry."""
        servers = self.enabled_servers
        if not servers:
            logger.info("No MCP servers configured; tool registry empty")
            return

        for name, cfg in servers.items():
            await self._connect_server(name, cfg)

        logger.info(
            f"MCP tool registry ready: {len(self._clients)}/{len(servers)} servers connected, "
            f"{len(self._tools)} tools exposed: {list(self._tools)}"
        )
        if self._failed_servers:
            logger.warning(f"MCP servers that failed to connect: {self._failed_servers}")

    async def _connect_server(self, name: str, cfg: Dict[str, Any]):
        """Connect to a single MCP server; failures (bad config, unreachable, refused, ...)
        are logged and never propagate to startup or to other servers."""
        try:
            if cfg.get("transport") == "http" or "url" in cfg:
                client = Client(cfg["url"])  # http(s) URL -> streamable-http/SSE, auto-inferred
            else:
                client = Client({"mcpServers": {name: {"command": cfg["command"], "args": cfg.get("args", [])}}})
            await client.__aenter__()
            tools = await client.list_tools()
        except Exception as e:
            logger.error(f"Failed to connect MCP server '{name}': {e}")
            self._failed_servers[name] = str(e)
            return

        allowed = cfg.get("allowed_tools")
        for tool in tools:
            if allowed and tool.name not in allowed:
                continue
            if len(self._tools) >= self._max_exposed_tools:
                logger.warning(
                    f"MCP tool allowlist cap ({self._max_exposed_tools}) reached, dropping '{name}_{tool.name}'"
                )
                break

            namespaced_name = f"{name}_{tool.name}"
            self._tools[namespaced_name] = {
                "server": name,
                "tool_name": tool.name,
                "description": tool.description,
                "input_schema": tool.inputSchema,
            }

        self._clients[name] = client

    def list_tools(self) -> List[Dict[str, Any]]:
        """Return the allowlisted, namespaced tool registry."""
        return [{"name": name, **info} for name, info in self._tools.items()]

    def get_status(self) -> Dict[str, Any]:
        """Summarize connection state: which servers connected/failed and which tools are exposed."""
        return {
            "connected_servers": self.connected_servers,
            "failed_servers": self._failed_servers,
            "tools": list(self._tools.keys()),
        }

    async def call_tool(self, tool_name: str, arguments: Optional[Dict[str, Any]] = None) -> Any:
        """Directly invoke a namespaced tool by name (bypasses model tool-calling)."""
        info = self._tools.get(tool_name)
        if not info:
            raise ValueError(f"Tool '{tool_name}' is not in the registry")

        client = self._clients.get(info["server"])
        if not client:
            raise RuntimeError(f"MCP server '{info['server']}' is not connected")

        result = await client.call_tool(info["tool_name"], arguments or {})
        return result

    async def shutdown(self):
        for name, client in self._clients.items():
            try:
                await client.__aexit__(None, None, None)
            except Exception as e:
                logger.warning(f"Error shutting down MCP client for '{name}': {e}")
        self._clients = {}
        self._tools = {}
        self._failed_servers = {}
