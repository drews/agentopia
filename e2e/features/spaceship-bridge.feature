Feature: AI Spaceship Bridge Interface
  As a starship captain
  I want to see a real-time bridge interface
  So that I can monitor and command my AI agents

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @critical @visual
  Scenario: Bridge interface loads successfully
    When I navigate to the bridge interface
    Then I should see the bridge header with "USS AGENTOPIA BRIDGE"
    And I should see the connection status as "Connected"
    And I should see the bridge status as "OPERATIONAL"
    And I should take a screenshot of the "bridge-loaded"

  @agents @visual
  Scenario: Agents are displayed on the bridge grid
    Given I am on the bridge interface
    When the bridge loads agent data
    Then I should see 3 agents on the bridge grid
    And I should see the "Commander" agent with avatar "👨‍✈️"
    And I should see the "Science Officer" agent with avatar "👩‍🔬" 
    And I should see the "Operations Officer" agent with avatar "👨‍🔧"
    And I should take a screenshot of the "agents-displayed"

  @stations @layout
  Scenario: Bridge stations are positioned correctly
    Given I am on the bridge interface
    When I examine the bridge layout
    Then I should see the "Command Station" at position (10, 6)
    And I should see the "Engineering Station" at position (3, 10)
    And I should see the "Science Station" at position (18, 4)
    And each station should have proper dimensions
    And I should take a screenshot of the "stations-layout"

  @realtime @websocket
  Scenario: Real-time updates via WebSocket
    Given I am on the bridge interface
    And the WebSocket connection is established
    When an agent status changes
    Then I should see the updated status in real-time
    And the agent's visual appearance should reflect the new status

  @sidebar @status
  Scenario: Crew status panel displays correctly
    Given I am on the bridge interface  
    When I look at the bridge sidebar
    Then I should see a "Crew Status" panel
    And I should see all 3 agents listed with their current status
    And I should see a "Bridge Systems" panel
    And I should see all stations with "ONLINE" status
    And I should take a screenshot of the "sidebar-status"

  @responsive @mobile
  Scenario: Bridge interface adapts to smaller screens
    Given I am on the bridge interface
    When I resize the viewport to mobile dimensions
    Then the layout should adapt responsively
    And the sidebar should stack below the main grid
    And all elements should remain accessible
    And I should take a screenshot of the "mobile-layout"

  @animation @status-changes
  Scenario: Agent status animations work correctly
    Given I am on the bridge interface
    And I can see all agents
    When an agent status changes to "thinking"
    Then the agent should display a thinking animation
    When an agent status changes to "working"
    Then the agent should display a working animation
    When an agent status changes to "moving"
    Then the agent should display a moving animation

  @interaction @station-details
  Scenario: Station interaction shows details
    Given I am on the bridge interface
    When I hover over the "Command Station"
    Then the station should highlight
    When I click on the "Command Station"
    Then I should see station details or interaction options

  @lo-fi @aesthetic
  Scenario: Lo-fi pixelated aesthetic is properly applied
    Given I am on the bridge interface
    When I examine the visual design
    Then the interface should have a retro terminal aesthetic
    And text should use monospace font
    And colors should have a green terminal theme
    And animations should have a pixelated feel
    And I should take a screenshot of the "lo-fi-aesthetic"