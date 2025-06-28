# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agentopia is an executive functioning framework built in Python using the smolagents library. It implements a multi-agent system with three specialized agents:
- **Executive_Officer** (red_agent): Manages missions and coordinates subordinate agents
- **Science_Officer** (blue_agent): Handles theoretical aspects of missions
- **Operations_Officer** (yellow_agent): Handles practical execution of missions

## Development Setup

### Environment Setup
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Application
```bash
python main.py
```

The application requires Ollama running locally on port 11434 with the deepseek-r1:latest model.

## Architecture

### Core Components
- **main.py**: Entry point with agent initialization and user interaction loop
- **missions/__init__.py**: Contains core classes (Mission, MissionOrientedLogger, MissionDrivenAgent)
- **splash.py**: Animated splash screen using asciimatics
- **timing_utils.py**: Performance measurement utilities
- **AE_sandbox/**: Experimental features and testing area

### Agent System
The system uses a hierarchical agent structure where the Executive_Officer manages two subordinate agents. All agents use:
- Local LLM via Ollama (deepseek-r1:latest model)
- DuckDuckGoSearchTool for web search capabilities
- Custom MissionOrientedLogger for mission-specific logging

### Key Classes
- **MissionDrivenAgent**: Extends smolagents.CodeAgent with mission-oriented capabilities
- **MissionOrientedLogger**: Extends smolagents.AgentLogger with mission-specific logging
- **Mission**: Framework for mission definition and tracking (currently placeholder)

## Dependencies
- smolagents[transformers]: Core agent framework
- inquirer: Interactive command-line prompts
- asciimatics: Terminal UI animations

## Development Notes
- The project uses local LLM inference to avoid API costs and maintain privacy
- Character system prompts and directives are stored in the characters/ directory
- The AE_sandbox directory contains experimental async processing features
- Mission framework is partially implemented with TODOs for future development