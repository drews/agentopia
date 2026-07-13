# EventKit MCP Server

Host-side [FastMCP](https://gofastmcp.com) server that exposes Apple
Calendar and Reminders (via PyObjC EventKit bindings) as a small,
flat-schema MCP tool surface over streamable-HTTP.

## Why this runs on the host, not in Docker

EventKit is a macOS framework accessed via PyObjC. It requires TCC
(Transparency, Consent, and Control) permission grants tied to the actual
process requesting access, and it has no meaning inside a Linux container.
Docker Desktop on macOS also puts a VM boundary between the containerized
backend and host frameworks, so a stdio MCP server can't be spawned across
that boundary either. This process therefore runs directly on the Mac
(outside Docker) and speaks streamable-HTTP; the Dockerized FastAPI backend
reaches it via `host.docker.internal`.

## Requirements

- macOS 14+ (uses the `requestFullAccessTo*` EventKit APIs)
- Python 3 (tested with the system `python3`, currently 3.14)

## Setup and run

```bash
cd mcp-servers/eventkit
./run.sh
```

`run.sh` creates a local `.venv` (gitignored, not shared with the backend's
own dependencies), installs `requirements.txt`, and starts the server on:

```
http://127.0.0.1:3010/mcp
```

The first tool call that touches Calendar or Reminders triggers the native
macOS TCC permission dialog for whatever process owns the Python
interpreter (usually your terminal app, e.g. Terminal.app or iTerm). If the
dialog isn't answered within ~10 seconds, the tool call returns a JSON
`{"error": "...timed out..."}` payload instead of hanging — the server
never blocks the MCP transport waiting on user input across a tool call.

### Granting access (TCC)

Go to **System Settings → Privacy & Security → Calendars** and **System
Settings → Privacy & Security → Reminders**, and enable access for the
app/binary running this server (typically your terminal app, or `python3`
if it's listed separately). If you don't see an entry yet, trigger a tool
call once (e.g. `list_todays_events`) to make macOS register the request,
then check Settings again and toggle it on. After granting, no restart is
required — reminders access observed during development was granted
asynchronously and the *next* tool call succeeded even though the call that
triggered the prompt had already timed out and returned an error.

## Verification performed

Ran `./run.sh` and drove the server with a standalone `fastmcp.Client`
against `http://127.0.0.1:3010/mcp`:

- `list_tools()` → all 6 expected tools present:
  `list_todays_events`, `list_upcoming_events`, `list_reminders`,
  `create_reminder`, `complete_reminder`, `create_event`.
- `list_todays_events()` and `list_upcoming_events(days=3)` → succeeded
  immediately, returning real events from the signed-in calendars
  (Calendar TCC access was already granted on this machine from prior use).
- `list_reminders(completed=False)` → **first call timed out** after 10s
  with `{"error": "Reminders access request timed out after 10s..."}`
  (Reminders authorization was not yet determined and no dialog was
  visible/answered in the test session). A **second call moments later
  succeeded** (`{"reminders": []}`), confirming the authorization had been
  granted asynchronously in the background and the server's fail-fast
  timeout did not leave anything in a broken state — it's safe to just
  retry the tool call.
- `create_reminder` / `complete_reminder` / `create_event` were not
  exercised against real data to avoid mutating the signed-in account's
  calendars/reminders; their code paths are identical to the read tools
  with respect to the auth-check-then-timeout behavior verified above.

Run `python3 test_server.py` (with the server already running via
`./run.sh`) to repeat the tool-listing and `list_todays_events` checks;
it treats a TCC `error` payload as an acceptable/expected result (it
proves the server fails safe) and only fails on a hang or transport error.

## Backend connection config

The Dockerized FastAPI backend should reach this server at:

```
http://host.docker.internal:3010/mcp
```

Add this as an MCP server entry in `config/agentopia.json` (see existing
entries for the expected shape) using transport `streamable-http` /
`http` and the URL above. `127.0.0.1:3010` only works for host-side
scripts/tests (like `test_server.py`); containers must use
`host.docker.internal`.

## Tools

| Tool | Args | Description |
|---|---|---|
| `list_todays_events` | — | List all calendar events on today's date |
| `list_upcoming_events` | `days: int = 7` | List events from now through N days ahead |
| `list_reminders` | `completed: bool = False` | List reminders filtered by completion status |
| `create_reminder` | `title: str, due_iso: str | None` | Create a reminder with optional ISO-8601 due date |
| `complete_reminder` | `id: str` | Mark a reminder completed by identifier |
| `create_event` | `title: str, start_iso: str, end_iso: str` | Create a calendar event |

All tools return a `dict`; on failure (including TCC authorization
problems) they return `{"error": "<message>"}` rather than raising, so
callers get a stable, inspectable shape either way.
