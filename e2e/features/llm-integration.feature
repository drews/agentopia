Feature: LLM Integration Testing
  As a developer
  I want to verify that agents are using real LLM responses
  So that I can confirm the system is working with actual AI

  Background:
    Given the spaceship bridge backend is running on port 8000

  @llm @integration @api
  Scenario: Agent API returns real LLM responses
    When I send a POST request to "/api/agents/red_agent/chat" with message "What is the capital of France?"
    Then the response should have status 200
    And the response should contain "success"
    When I check the backend logs
    Then the logs should show "Agent red_agent responded:" 
    And the logs should not show "mock" or "I understand your request"
    And the logs should show actual LLM content

  @llm @integration @configuration
  Scenario: System is configured to use Ollama
    When I check the application configuration
    Then the default LLM provider should be "ollama"
    And the Ollama base URL should be "http://host.docker.internal:11434"
    And the Ollama model should be "qwen3:latest"

  @llm @integration @fallback
  Scenario: System has proper fallback mechanisms
    When the primary LLM provider fails
    Then the system should fall back to mock responses
    And the system should log the fallback event
    And the system should remain operational