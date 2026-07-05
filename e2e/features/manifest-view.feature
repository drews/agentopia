Feature: Manifest View - Meso-Scale Data Visualization
  As a systems operator
  I want to monitor agent performance and system health in real-time
  So that I can track operational intelligence at the meso-scale level

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @manifest @visual @critical
  Scenario: Manifest view loads with all three tabs
    Given I am on the bridge interface
    When I navigate to the manifest view
    Then I should see the manifest header with "Manifest"
    And I should see three tabs: "Agent Performance", "System Health", and "Task Flow"
    And the "Agent Performance" tab should be active by default
    And I should take a screenshot of the "manifest-overview"

  @manifest @agents @visual
  Scenario: Agent Performance tab displays metrics correctly
    Given I am on the manifest view
    When I am viewing the "Agent Performance" tab
    Then I should see 3 agent cards
    And each agent card should display:
      | Field | Type |
      | Name | text |
      | Status | badge |
      | Tasks Completed | number |
      | Average Response Time | time |
      | Success Rate | percentage |
      | Uptime | duration |
      | CPU Usage | progress_bar |
      | Memory Usage | progress_bar |
      | API Calls | number |
      | Tokens | number |
      | Current Activity | text |
    And I should take a screenshot of the "manifest-agent-performance"

  @manifest @system @visual
  Scenario: System Health tab displays status overview
    Given I am on the manifest view
    When I click on the "System Health" tab
    Then I should see the overall system health status
    And I should see component status for:
      | Component | Expected Status |
      | Backend | online |
      | Database | online |
      | WebSocket | connected |
      | MCP | active |
    And I should see system metrics including:
      | Metric | Type |
      | Total Agents | number |
      | Active Connections | number |
      | Queue Depth | number |
      | Error Rate | percentage |
    And I should take a screenshot of the "manifest-system-health"

  @manifest @tasks @visual
  Scenario: Task Flow tab displays active tasks
    Given I am on the manifest view
    When I click on the "Task Flow" tab
    Then I should see the task counts summary
    And I should see active tasks with:
      | Field | Type |
      | Task ID | identifier |
      | Priority | badge |
      | Type | text |
      | Assigned Agent | text |
      | Status | text |
      | Progress | progress_bar |
      | Start Time | timestamp |
      | ETA | timestamp |
    And task priorities should be color-coded:
      | Priority | Color |
      | Critical | red |
      | High | orange |
      | Normal | blue |
      | Low | gray |
    And I should take a screenshot of the "manifest-task-flow"

  @manifest @responsive @visual
  Scenario: Manifest view adapts to different screen sizes
    Given I am on the manifest view
    When I resize the viewport to mobile dimensions
    Then the manifest tabs should stack appropriately
    And agent cards should reflow to single column
    And all metrics should remain readable
    And I should take a screenshot of the "manifest-mobile"
    
    When I resize the viewport to tablet dimensions
    Then the manifest should adapt to tablet layout
    And I should take a screenshot of the "manifest-tablet"

  @manifest @realtime @visual
  Scenario: Real-time updates display correctly
    Given I am on the manifest view
    And I am viewing the "Agent Performance" tab
    When I wait for 5 seconds for real-time updates
    Then the CPU and memory usage bars should update dynamically
    And the timestamp should reflect recent updates
    And resource utilization should show live data
    And I should take a screenshot of the "manifest-realtime-updates"

  @manifest @navigation @visual
  Scenario: Tab navigation works smoothly
    Given I am on the manifest view
    When I click through each tab in sequence
    Then each tab should activate with proper styling
    And the content should switch without flickering
    And tab transitions should be smooth
    And I should take a screenshot of the "manifest-tab-navigation"

  @manifest @dark-theme @visual
  Scenario: Manifest view maintains dark theme consistency
    Given I am on the manifest view
    Then the manifest should use the spaceship bridge dark theme
    And background colors should match the bridge aesthetic
    And text contrast should be appropriate for readability
    And status indicators should be clearly visible
    And I should take a screenshot of the "manifest-dark-theme"

  @manifest @data-visualization @visual
  Scenario: Data visualization elements display correctly
    Given I am on the manifest view
    When I examine the data visualization elements
    Then progress bars should have appropriate gradients
    And status badges should have correct color coding
    And metric values should be properly formatted
    And charts should be responsive to container size
    And I should take a screenshot of the "manifest-data-viz"

  @manifest @accessibility @visual
  Scenario: Manifest view meets accessibility requirements
    Given I am on the manifest view
    Then tab navigation should work with keyboard
    And color contrast should meet WCAG standards
    And status indicators should have text labels
    And interactive elements should have focus indicators
    And I should take a screenshot of the "manifest-accessibility"

  @manifest @error-states @visual
  Scenario: Manifest view handles error states gracefully
    Given I am on the manifest view
    When system metrics indicate error conditions
    Then error states should be clearly indicated with red coloring
    And warning states should use orange/yellow indicators
    And degraded performance should be visually distinct
    And I should take a screenshot of the "manifest-error-states"