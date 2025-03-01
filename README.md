# Agentopia

**Empowering self-directed productivity through agentic thought augmentation.**

## Overview

Agentopia is an executive functioning framework designed to help users manage projects, time, and priorities effectively. Built with a focus on flexibility, privacy, and user empowerment, the agent offers:

- **Project Management**: Organize and track tasks and milestones.
- **Time Management**: Assist with scheduling and time blocking.
- **Priority and Values Alignment**: Ensure tasks align with user-defined priorities.
- **Reflection and Accountability**: Facilitate regular reviews and progress tracking.
- **Flexibility and Understanding**: Adapt to user preferences and provide empathetic support.

## Build Instructions

To build the Agentopia project, ensure you have Python installed and follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/agentopia.git
   cd agentopia
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Agent

To run the Agentopia agent, execute the following command:
    ```bash
    python main.py
    ```

## Architecture

The agent is built using **Python** and the **smolagents** library, containerized with **Docker** for consistent deployment across environments.

### Components

#### **User Interface (UI)**
- **Discord Integration**: Interact via a Discord bot with commands and interactive buttons.
- **Obsidian Integration**: Sync notes and tasks with Obsidian for knowledge management.

#### **Agent Core**
- **Task Management Module**: Handle task creation, tracking, and updates.
- **Scheduler Module**: Integrate with Google Calendar for scheduling and reminders.
- **Knowledge Graph Module**: Develop a personal knowledge graph grounded in Wikipedia articles, allowing users to build and customize their own schema over time.

#### **Data Storage**
- **Local Database**: Store user data securely on their device to ensure privacy and control.

## Data Flow

1. **User Interaction**: Users interact with the agent via Discord or Obsidian.
2. **Processing**: The Agent Core processes inputs, updates tasks, schedules events, and manages the knowledge graph.
3. **Storage**: Data is stored locally, with regular backups to prevent data loss.

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
