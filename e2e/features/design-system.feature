Feature: Design System Visual States & Aesthetic
  As a starship captain
  I want to experience a cohesive lo-fi retro aesthetic
  So that the interface feels immersive and consistent

  Background:
    Given the spaceship bridge backend is running on port 8000
    And the React frontend is running on port 3000

  @visual @aesthetic @stasis
  Scenario: Stasis mode visual design
    Given I am on the bridge interface in stasis mode
    When I examine the visual design elements
    Then the interface should have a dark, minimal appearance
    And emergency lighting should use red/amber color scheme
    And the initialize button should have a subtle pulse animation
    And background should show dormant system indicators
    And I should take a screenshot of the "stasis-mode-design"

  @visual @aesthetic @awakening
  Scenario: Awakening sequence visual progression
    Given I am on the bridge interface in stasis mode
    When I click the initialize systems button
    Then the interface should gradually illuminate
    And system panels should fade in progressively
    And status indicators should transition from red to amber to green
    And the overall aesthetic should shift from dark to operational
    And I should take a screenshot of the "awakening-sequence-design"

  @visual @aesthetic @responsive
  Scenario: Design consistency across screen sizes
    Given I am on the bridge interface
    When I test different viewport sizes
    Then the retro aesthetic should be maintained at all sizes
    And color schemes should remain consistent
    And typography should scale appropriately
    And UI elements should maintain visual hierarchy
    And I should take screenshots of "responsive-design-mobile", "responsive-design-tablet", "responsive-design-desktop"

  @visual @animation @status-changes
  Scenario: Animation consistency and performance
    Given I am on the bridge interface
    When system status changes occur
    Then animations should follow consistent timing patterns
    And color transitions should be smooth and purposeful
    And no animation should interfere with usability
    And animations should respect reduced motion preferences
    And I should take a screenshot of the "animation-consistency"

  @visual @aesthetic @voice-discovery
  Scenario: Voice discovery interface aesthetic
    Given I have completed Act I awakening
    When I access the voice discovery interface
    Then the interface should maintain the spaceship aesthetic
    And scenario presentations should feel narrative-driven
    And command approach options should be visually distinct
    And system tuning controls should feel tactile and responsive
    And I should take a screenshot of the "voice-discovery-design"

  @visual @aesthetic @fleet-operations
  Scenario: Advanced fleet operations visual complexity
    Given I have unlocked fleet operations in Act III
    When I access the fleet management interface
    Then the interface should handle visual complexity gracefully
    And multiple ship displays should be clearly differentiated
    And coordination status should be immediately recognizable
    And executive controls should be prominently positioned
    And I should take a screenshot of the "fleet-operations-design"

  @accessibility @visual @contrast
  Scenario: Color contrast and readability
    Given I am on any bridge interface
    When I examine text and background combinations
    Then all text should meet WCAG AA contrast requirements
    And status indicators should be distinguishable by color-blind users
    And interactive elements should have clear visual focus states
    And emergency information should have high contrast ratios

  @accessibility @visual @focus
  Scenario: Focus indicators and keyboard navigation
    Given I am on the bridge interface
    When I navigate using keyboard only
    Then focus indicators should be clearly visible
    And focus order should follow logical visual flow
    And all interactive elements should be keyboard accessible
    And focus should never become trapped or lost

  @theming @visual @customization
  Scenario: Visual customization and themes
    Given I am in Act II personalization
    When I access visual customization options
    Then I should be able to adjust color themes within aesthetic constraints
    And contrast options should be available for accessibility
    And animation preferences should be configurable
    And changes should preview in real-time
    And I should take a screenshot of the "theme-customization"

  @visual @performance @large-scale
  Scenario: Visual performance with large datasets
    Given I have multiple ships and agents active
    When the interface displays many concurrent operations
    Then visual elements should render smoothly
    And animations should maintain consistent frame rates
    And layout should not shift unexpectedly
    And scrolling should be smooth and responsive
    And I should take a screenshot of the "large-scale-operations"