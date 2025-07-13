Feature: Smoke Tests
  Simple smoke tests to verify basic system functionality

  Scenario: Backend is responding
    When I check the backend health endpoint
    Then the backend should respond with status 200

  Scenario: Backend returns valid health data
    When I check the backend health endpoint
    Then the response should indicate the service is healthy