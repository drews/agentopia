Feature: Ship View Commander Dashboard
  As a fleet commander
  I want to see a strategic overview of fleet operations
  So that I can make informed decisions about macro-scale operations

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @critical @visual @golden-screenshot
  Scenario: Commander Dashboard loads with fleet metrics
    When I navigate to the bridge interface
    And I click on the "Ship" tab
    Then I should see the Fleet Command Strategic Overview header
    And I should see the fleet operations panel
    And I should see total ships metric
    And I should see operational ships metric
    And I should see crew efficiency metric
    And I should capture golden screenshot "commander-dashboard-overview"

  @visual @golden-screenshot @missions
  Scenario: Mission Command Center displays active missions
    Given I am on the commander dashboard
    When I look at the Mission Command Center panel
    Then I should see active missions with progress bars
    And I should see mission status badges
    And I should see mission priority indicators
    And I should see estimated completion times
    And I should capture golden screenshot "mission-command-center"

  @visual @golden-screenshot @performance
  Scenario: System Performance metrics are displayed
    Given I am on the commander dashboard
    When I examine the System Performance panel
    Then I should see power efficiency metrics
    And I should see crew productivity metrics
    And I should see system uptime metrics
    And I should see error rate metrics
    And I should capture golden screenshot "system-performance-panel"

  @visual @golden-screenshot @resources
  Scenario: Resource Allocation displays utilization data
    Given I am on the commander dashboard
    When I look at the Resource Allocation panel
    Then I should see computational resource utilization
    And I should see power resource utilization
    And I should see network resource utilization
    And I should see storage resource utilization
    And each resource should show current usage percentage
    And I should capture golden screenshot "resource-allocation-panel"

  @visual @golden-screenshot @intelligence
  Scenario: Strategic Intelligence panel shows recommendations
    Given I am on the commander dashboard
    When I examine the Strategic Intelligence panel
    Then I should see optimization recommendations
    And I should see trend analysis indicators
    And I should see improvement suggestions
    And I should capture golden screenshot "strategic-intelligence-panel"

  @visual @golden-screenshot @timeline
  Scenario: Operational Timeline shows recent events
    Given I am on the commander dashboard
    When I look at the Recent Operations panel
    Then I should see a timeline of operational events
    And I should see event timestamps
    And I should see event types with icons
    And I should see event descriptions
    And I should capture golden screenshot "operational-timeline-panel"

  @visual @golden-screenshot @responsive
  Scenario: Commander Dashboard adapts to mobile viewport
    Given I am on the commander dashboard
    When I resize the viewport to mobile dimensions
    Then the dashboard should adapt to smaller screen
    And panels should stack vertically
    And content should remain readable
    And I should capture golden screenshot "commander-dashboard-mobile"

  @visual @golden-screenshot @full-dashboard
  Scenario: Full Commander Dashboard visual regression test
    Given I am on the commander dashboard
    When I wait for all panels to load completely
    Then I should see all dashboard panels rendered
    And I should capture golden screenshot "commander-dashboard-full-view"
    And I should verify the screenshot matches the golden baseline

  @visual-diff @regression
  Scenario: Commander Dashboard visual regression detection
    Given I am on the commander dashboard
    When I capture the current dashboard screenshot
    Then the screenshot should match the golden baseline within acceptable thresholds
    And any differences should be highlighted in the diff report