Feature: Modern Developer Workflow with Turborepo
  As a developer
  I want unified task orchestration with intelligent caching
  So that I can have a fast, consistent development experience

  Background:
    Given the project has Turborepo configured
    And the project has task dependencies defined

  Scenario: Single command development startup
    When I run "turbo dev"
    Then all required services should start in the correct order
    And MCP servers should be available
    And the frontend should be accessible on port 3000
    And the backend should be accessible on port 8000
    And I should see "All services ready" in the output

  Scenario: Intelligent task caching
    Given I have previously run "turbo build"
    When I run "turbo build" again without changes
    Then the build should complete in under 5 seconds
    And I should see "FULL TURBO" cache hit messages
    And no actual compilation should occur

  Scenario: Task dependency resolution
    When I run "turbo test"
    Then the build task should complete first
    And then the test task should run
    And I should see the dependency chain in the output

  Scenario: Parallel task execution
    When I run "turbo lint test"
    Then both tasks should run in parallel
    And the total execution time should be optimized
    And I should see parallel execution indicators

  Scenario: Service health checks
    Given services are starting with "turbo dev"
    When all services are ready
    Then the backend health endpoint should return 200
    And the frontend should be serving content
    And MCP services should be responsive

  Scenario: Fast local development mode
    When I run "turbo dev --local"
    Then services should start without Docker containers
    And startup time should be under 30 seconds
    And hot reload should be functional

  Scenario: Docker integration mode
    When I run "turbo dev --docker"
    Then services should start in Docker containers
    And environment should be consistent with production
    And containers should have proper health checks