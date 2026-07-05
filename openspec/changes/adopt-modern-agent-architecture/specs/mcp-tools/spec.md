# mcp-tools Spec Delta

## ADDED Requirements

### Requirement: Backend aggregates MCP servers into one curated tool registry

The backend SHALL maintain a long-lived FastMCP client in the FastAPI lifespan that connects to configured stdio MCP servers, namespaces their tools by server, and exposes only an allowlisted subset (at most 10 tools) to agent models.

#### Scenario: Servers connect at startup

- **WHEN** the backend starts with MCP servers configured in `config/agentopia.json`
- **THEN** each configured server is spawned and its tools appear in the registry under a server-prefixed name (e.g. `calendar_list_events`)
- **AND** tools not on the allowlist are not exposed to models

#### Scenario: A server failing does not break the bridge

- **WHEN** one configured MCP server fails to start
- **THEN** the bridge and remaining servers operate normally and the failure is visible in logs and the bridge status endpoint

### Requirement: Agents can read real calendar and reminders data

A crew agent SHALL be able to answer "plan my day" by reading the user's actual calendar events and reminders through MCP tools and returning a prioritized brief.

#### Scenario: Plan my day against real data

- **WHEN** the user asks the Commander to plan their day and the EventKit MCP server is connected
- **THEN** the response reflects the user's real calendar events and reminders for today, not mock data

### Requirement: Intent is routed through a planner/executor tier

User intents requiring tools SHALL be decomposed by a planner model into single-tool steps, each executed by a fast executor model with a flat schema, with persona voice applied only when rendering the final response.

#### Scenario: Multi-step intent decomposed

- **WHEN** a user intent requires more than one tool call (e.g. read calendar then create a reminder)
- **THEN** the planner emits discrete single-tool steps executed sequentially, and the final reply is rendered in the addressed persona's voice
