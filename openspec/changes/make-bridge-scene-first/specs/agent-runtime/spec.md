# agent-runtime Spec Delta

## ADDED Requirements

### Requirement: Runtime broadcasts activity events for scene choreography

The backend SHALL broadcast typed WebSocket events for agent and tool activity: `agent_activity` (agent id + thinking/responding/idle) at LLM call start and finish, and `tool_activity` (tool name, server, success/failure) at MCP tool dispatch completion.

#### Scenario: LLM activity is observable

- **WHEN** an agent's PydanticAI call starts and later completes
- **THEN** connected WebSocket clients receive agent_activity thinking followed by responding/idle for that agent

#### Scenario: Tool activity is observable

- **WHEN** the MCP registry dispatches a tool call
- **THEN** clients receive a tool_activity event naming the tool and server with the call's outcome
