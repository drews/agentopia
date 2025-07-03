Feature: Basic Health Check and Screenshot Capture
  As a developer
  I want to verify that both frontend and backend services are running
  So that I can capture visual progress of the spaceship bridge

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @health @critical
  Scenario: Backend health check
    When I check the backend health endpoint
    Then the backend should respond with status 200
    And the response should indicate the service is healthy

  @health @critical  
  Scenario: Frontend health check
    When I navigate to the frontend application
    Then the frontend should load successfully
    And I should see the USS AGENTOPIA BRIDGE interface

  @visual @progress
  Scenario: Capture current bridge state
    When I navigate to the bridge interface
    And I wait for the interface to fully load
    Then I should take a screenshot for progress documentation
    And the screenshot should show the current development state