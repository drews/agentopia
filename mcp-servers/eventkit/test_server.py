#!/usr/bin/env python3
"""
Standalone verification for the EventKit MCP server.

Run this AFTER starting the server (./run.sh) in another terminal, or let it
launch nothing itself — it only connects as a client. It:

  1. Connects over streamable-HTTP to http://127.0.0.1:3010/mcp
  2. Lists tools and asserts all 6 expected flat-schema tools are present
  3. Calls list_todays_events() and asserts a well-formed response

TCC (macOS permission) awareness: EventKit tools time out (~10s) rather than
hang if the permission dialog never resolves. A `{"error": ...}` payload that
mentions "denied", "restricted", or "timed out" is treated as an ACCEPTABLE
result here, not a failure — it proves the server is reachable, speaks MCP
correctly, and fails safe on missing authorization. Only a hang or a
transport/protocol error is a real failure.

Usage:
    source .venv/bin/activate
    python3 test_server.py
"""

import asyncio
import sys

from fastmcp import Client

SERVER_URL = "http://127.0.0.1:3010/mcp"

EXPECTED_TOOLS = {
    "list_todays_events",
    "list_upcoming_events",
    "list_reminders",
    "create_reminder",
    "complete_reminder",
    "create_event",
}

CLIENT_TIMEOUT_S = 20  # generous margin over the server's own ~10s TCC timeout


async def main() -> int:
    print(f"Connecting to {SERVER_URL} ...")
    client = Client(SERVER_URL)

    try:
        async with client:
            async with asyncio.timeout(CLIENT_TIMEOUT_S):
                tools = await client.list_tools()
    except (TimeoutError, asyncio.TimeoutError):
        print(
            "FAIL: timed out connecting/listing tools. Is the server running?\n"
            "  Start it with: ./run.sh"
        )
        return 1
    except Exception as exc:
        print(f"FAIL: could not connect to {SERVER_URL}: {exc}")
        print("Start the server first with: ./run.sh")
        return 1

    tool_names = {t.name for t in tools}
    print(f"Tools advertised: {sorted(tool_names)}")

    missing = EXPECTED_TOOLS - tool_names
    assert not missing, f"Missing expected tools: {missing}"
    print(f"PASS: all {len(EXPECTED_TOOLS)} expected tools are present.")

    print("Calling list_todays_events() ...")
    try:
        async with client:
            async with asyncio.timeout(CLIENT_TIMEOUT_S):
                result = await client.call_tool("list_todays_events", {})
    except (TimeoutError, asyncio.TimeoutError):
        print(
            "FAIL: list_todays_events did not return within "
            f"{CLIENT_TIMEOUT_S}s. The server is supposed to fail fast "
            "(~10s) on unresolved TCC prompts instead of hanging — this "
            "indicates a real bug, not a permission issue."
        )
        return 1

    data = result.data if hasattr(result, "data") else result
    print(f"Response: {data}")

    if isinstance(data, dict) and "error" in data:
        msg = str(data["error"]).lower()
        if any(word in msg for word in ("denied", "restricted", "timed out", "not determined")):
            print(
                "ACCEPTABLE: tool reported a TCC authorization problem "
                "instead of hanging or crashing. To grant access:\n"
                "  System Settings > Privacy & Security > Calendars\n"
                "  (and > Reminders) > enable access for the terminal app "
                "or python3 binary running this server, then restart it."
            )
            print("PASS (up to the TCC authorization boundary).")
            return 0
        print(f"FAIL: unexpected error from list_todays_events: {data['error']}")
        return 1

    assert isinstance(data, dict) and "events" in data, f"Unexpected shape: {data}"
    assert isinstance(data["events"], list), f"'events' should be a list: {data}"
    print(f"PASS: list_todays_events returned {len(data['events'])} event(s).")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
