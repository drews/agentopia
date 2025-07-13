# Agentopia: Simple Plan

## Core Concept
Spaceship bridge interface where AI agents help with your daily tasks. Think "Star Trek bridge" meets "personal assistant."

## MVP Features

### 1. Bridge Interface (Already 80% Done)
- Visual spaceship bridge with agent stations
- Real-time WebSocket updates
- Agent status indicators

### 2. Three Core Agents
- **Commander**: Plans your day, sets priorities
- **Science Officer**: Researches and analyzes information  
- **Operations Officer**: Executes tasks and manages workflows

### 3. Basic MCP Integration
- Connect to calendar (Google/Outlook)
- Connect to task manager (Todoist/Notion)
- Connect to files (Google Drive/local)

### 4. Simple Task Flow
1. User says "Plan my day"
2. Commander agent reads calendar via MCP
3. Creates prioritized task list
4. Shows progress on bridge

## Technical Implementation
- Keep existing FastAPI backend + React frontend
- Add MCP client to backend
- Connect existing agent visualization to real LLM calls
- Store results in SQLite

## Success Criteria
- Can plan a day by reading calendar
- Can create and track simple tasks
- Bridge shows real agent activity
- Everything works locally first

## What We're NOT Doing (Yet)
- Complex gamification
- Advanced personalization
- Multiple LLM providers
- Advanced UI animations
- Mobile apps
- Complex agent interactions

## Next Steps
1. Connect existing bridge to MCP
2. Add simple LLM integration for one agent
3. Test with real calendar/task data
4. Polish the core experience

Keep it simple, make it work, then expand.