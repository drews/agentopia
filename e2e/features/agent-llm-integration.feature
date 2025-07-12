Feature: Agent LLM Integration
  As a starship captain
  I want my AI agents to respond intelligently to missions using real LLM
  So that they can provide meaningful assistance and communication

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @llm @critical
  Scenario: LLM service is available and configured
    When I check the LLM service status
    Then the LLM service should be running
    And the default provider should be configured
    And at least one LLM provider should be available

  @llm @agent-communication
  Scenario: Agent responds to mission using LLM
    Given I am on the bridge interface
    And I can see the Commander agent
    When I send a mission "Analyze ship status and report" to the Commander
    Then the Commander should respond with an LLM-generated message
    And the response should be relevant to the mission
    And the agent status should update to show they received and processed the mission

  @llm @chat-integration
  Scenario: Agent chat messages use real LLM responses
    Given I am on the bridge interface  
    And the WebSocket connection is established
    When I send a chat message "What is the current bridge status?" to the Science Officer
    Then I should receive an LLM-generated response via WebSocket
    And the response should be contextually appropriate
    And the message should appear in the bridge communication log

  @llm @provider-fallback
  Scenario: LLM service gracefully handles provider failures
    When I test the LLM service with various providers
    Then unavailable providers should fall back to mock responses
    And the service should remain operational
    And error messages should be logged appropriately

  @llm @system-prompts
  Scenario: Agents use role-specific system prompts
    Given I send the same mission to all three agents
    When the Commander, Science Officer, and Operations Officer respond
    Then each agent's response should reflect their unique role and personality
    And the responses should be distinguishably different based on their specialization

  @llm @realtime-integration
  Scenario: LLM responses trigger real-time UI updates
    Given I am on the bridge interface
    And I can see all agents with their current status
    When I assign a complex mission to an agent
    Then I should see the agent status change to "thinking"
    And then see the status change to "active" when LLM response is received
    And the agent's response should be broadcast to all connected clients