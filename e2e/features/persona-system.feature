Feature: Persona System
  As a user of Agentopia
  I want to switch between different AI personas 
  So that I can get appropriate responses based on my current working context

  Background:
    Given the Agentopia backend is running
    And the spaceship bridge frontend is accessible

  Scenario: List available personas
    When I request the list of available personas
    Then I should see the following personas:
      | persona_id           | description                                    |
      | sage_staff_engineer  | Seasoned, methodical senior engineer          |
      | move_fast_hacker     | Speed-first button masher                     |
      | security_paranoid    | Zero-trust mindset                            |
      | product_pragmatist   | User-focused, business-aware engineer         |

  Scenario: Activate a persona
    Given no persona is currently active
    When I activate the "sage_staff_engineer" persona
    Then the persona should be activated successfully
    And the active persona should be "sage_staff_engineer"

  Scenario: Send mission with persona context
    Given the "security_paranoid" persona is active
    When I send a mission "Review the authentication system" to agent "red_agent"
    Then the agent should respond with security-focused analysis
    And the response should mention security considerations

  Scenario: Persona affects agent behavior
    Given I activate the "move_fast_hacker" persona
    When I send a mission "Implement user registration" to agent "yellow_agent"
    Then the response should be action-oriented
    And the response should focus on rapid implementation

  Scenario: Switch between personas
    Given the "sage_staff_engineer" persona is active
    When I activate the "move_fast_hacker" persona
    Then the active persona should change to "move_fast_hacker"
    And all agents should receive the persona update

  Scenario: Persona-specific mission assignment
    When I send a mission "Audit code for vulnerabilities" to agent "blue_agent" with persona "security_paranoid"
    Then the agent should respond with security audit focus
    And the response should include threat analysis

  Scenario: Invalid persona handling
    When I try to activate a non-existent persona "invalid_persona"
    Then I should receive an error message
    And the active persona should remain unchanged

  Scenario: Context-based persona suggestions
    When I request persona suggestions for context "security_review"
    Then the suggested persona should be "security_paranoid"
    When I request persona suggestions for context "prototype_phase"
    Then the suggested persona should be "move_fast_hacker"

  Scenario: Persona persistence across sessions
    Given I activate the "product_pragmatist" persona
    And I restart the backend service
    When I check the active persona
    Then the persona should still be "product_pragmatist"

  Scenario: Multiple agents with same persona
    Given the "sage_staff_engineer" persona is active
    When I send missions to multiple agents:
      | agent_id    | mission                           |
      | red_agent   | Plan the next sprint              |
      | blue_agent  | Analyze performance metrics       |
      | yellow_agent| Optimize deployment pipeline      |
    Then all agents should respond with methodical, detailed analysis
    And all responses should reflect long-term thinking

  Scenario: WebSocket persona updates
    Given I am connected to the WebSocket
    When I activate the "move_fast_hacker" persona
    Then I should receive a WebSocket message about persona change
    And the message should include the new persona ID

  Scenario: Claude Code persona script integration
    When I run the persona script "list" command
    Then I should see all available personas listed
    When I run the persona script "activate sage_staff_engineer" command
    Then the persona should be activated via API
    When I run the persona script "active" command
    Then it should show "sage_staff_engineer" as active