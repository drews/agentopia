# Agentopia

**Empowering self-directed productivity through agentic thought augmentation.**

## Overview

Agentopia is an executive functioning framework designed to help users manage projects, time, and priorities effectively. Built with a focus on flexibility, privacy, and user empowerment, the system provides a virtual environment for LLM-powered agents to interact in meaningful ways.

Core capabilities include:

- **Virtual Agent Environment**: A lo-fi but semantically rich space for agent interactions
- **Room-Based Metaphor**: Agents can move between different "rooms" designed for specific activities
- **MCP Integration**: Rooms serve as metaphysical MCP clients with theatrical/narrative scaffolding
- **Self-Improvement Framework**: Computer-assisted resilience and personal development workflows
- **Privacy-First Design**: Local deployment with user control over data and interactions

## Quick Start

### Option 1: Interactive Setup (Recommended)
```bash
python run.py
```

### Option 2: Docker (Consistent Environment)
```bash
docker-compose up
```

### Option 3: Manual Setup
```bash
pip install -r requirements.txt
python server.py
```

### Option 4: Make Commands
```bash
make start    # Interactive menu
make run      # Start web server
make test     # Run automated tests
make demo     # Command-line demo
```

## Architecture

The system is built using **Python**, **FastAPI**, and **WebSockets**, with optional **Docker** containerization for consistent deployment.

### Current Components

#### **Virtual Environment Engine**
- **Agent Management**: Create, track, and manage LLM-powered agents
- **Room System**: Metaphysical spaces with different purposes and tool access
- **Interaction Logging**: Track all agent interactions and tool usage
- **State Management**: Maintain agent states and room occupancy

#### **User Interface**
- **Web Interface**: Lo-fi terminal aesthetic with real-time updates
- **REST API**: Programmatic access to all environment functions
- **WebSocket Support**: Real-time interaction streaming
- **Command Line**: Direct Python interaction for development

#### **MCP Integration Framework**
- **Room-Based Tool Access**: Different rooms provide different MCP tool sets
- **Narrative Contexts**: Rooms have semantic meaning for coherent agent behavior
- **Tool Simulation**: Mock MCP tools for development and testing
- **Extensible Architecture**: Easy to add new MCP clients and tools

### Room Types

- **Central Plaza**: Main gathering space for general interactions
- **Workshop**: Focused work environment with productivity tools
- **Reflection Chamber**: Quiet space for contemplation and planning
- **Learning Hall**: Knowledge sharing and research activities
- **Meditation Garden**: Mindfulness and wellness practices
- **Research Library**: Deep research with web search and knowledge tools
- **Creative Studio**: Ideation and creative work environment
- **Productivity Workshop**: Task management and scheduling tools
- **Wellness Sanctuary**: Self-care and mood tracking tools

## Development

### Testing
```bash
make test           # Run all tests
pytest -v          # Direct pytest usage
python test_agentopia.py  # Run test file directly
```

### Docker Development
```bash
docker-compose up --build    # Build and run
docker-compose logs -f       # Follow logs
docker-compose down          # Stop services
```

## Data Flow

1. **Agent Creation**: Agents are created with specific roles and capabilities
2. **Room Navigation**: Agents move between rooms based on their current needs
3. **Tool Usage**: Agents access MCP tools appropriate to their current room
4. **Interaction Logging**: All activities are logged for analysis and improvement
5. **Real-time Updates**: Web interface shows live agent activities and room status

## Future Enhancements

While the initial implementation focuses on core functionalities, future developments may include:

- **Voice Interaction**: Incorporate voice commands and responses for hands-free interaction.
- **Advanced Analytics**: Provide insights into productivity patterns and suggest improvements.
- **Customization Options**: Allow users to personalize the agent’s behavior, appearance, and responses.

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Agentopia is designed to enhance self-empowerment by integrating agentic design principles into everyday productivity workflows. Let’s build the future of intelligent personal assistance together!
