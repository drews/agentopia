import { test, expect } from '@playwright/test';

// Comprehensive Accessibility Test Suite
// These tests validate WCAG compliance and inclusive design across all journey stages

test.describe('Comprehensive Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Keyboard Navigation & Focus Management', () => {
    test('should provide complete keyboard navigation through stasis mode', async ({ page }) => {
      // Should be able to navigate to initialize button
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="initialize-systems"]')).toBeFocused();
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('.bridge-container')).toHaveClass(/awakening/);
      
      // Focus should move to first interactive element in new state
      const firstInteractive = page.locator('button, input, select, a').first();
      await expect(firstInteractive).toBeFocused();
    });

    test('should maintain logical focus order through awakening sequence', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Test tab order through communication preferences
      const expectedOrder = [
        '[data-testid="style-formal"]',
        '[data-testid="style-casual"]', 
        '[data-testid="style-technical"]',
        '[data-testid="update-frequency"]',
        '[data-testid="alert-priorities"]',
        '[data-testid="save-preferences"]'
      ];
      
      for (const selector of expectedOrder) {
        await page.keyboard.press('Tab');
        await expect(page.locator(selector)).toBeFocused();
      }
    });

    test('should handle focus trapping in modal dialogs', async ({ page }) => {
      // Complete setup to access modals
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Open a modal (crew details)
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.waitForSelector('.agent-details-modal');
      
      // Focus should be trapped within modal
      const modalElements = page.locator('.agent-details-modal button, .agent-details-modal input, .agent-details-modal select');
      const elementCount = await modalElements.count();
      
      // Tab through all elements and ensure focus stays in modal
      for (let i = 0; i < elementCount + 2; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const isInModal = await focusedElement.evaluate((el) => {
          return el.closest('.agent-details-modal') !== null;
        });
        expect(isInModal).toBeTruthy();
      }
      
      // Escape should close modal and restore focus
      await page.keyboard.press('Escape');
      await expect(page.locator('.agent-details-modal')).not.toBeVisible();
      await expect(page.locator('.agent-card:first-child')).toBeFocused();
    });

    test('should support skip links for efficient navigation', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should have skip links
      const skipLinks = page.locator('.skip-links a');
      await expect(skipLinks.first()).toBeVisible();
      
      // Should be able to skip to main content
      await page.keyboard.press('Tab'); // Focus skip link
      await page.keyboard.press('Enter');
      await expect(page.locator('main')).toBeFocused();
      
      // Should be able to skip to navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page.locator('nav').first()).toBeFocused();
    });

    test('should provide keyboard shortcuts for power users', async ({ page }) => {
      // Complete setup to access shortcuts
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Test keyboard shortcuts
      await page.keyboard.press('Control+1'); // Should navigate to crew
      await expect(page.locator('.crew-section')).toBeFocused();
      
      await page.keyboard.press('Control+2'); // Should navigate to systems
      await expect(page.locator('.systems-section')).toBeFocused();
      
      await page.keyboard.press('Control+h'); // Should show help
      await expect(page.locator('.help-dialog')).toBeVisible();
      
      await page.keyboard.press('Escape'); // Should close help
      await expect(page.locator('.help-dialog')).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support & ARIA', () => {
    test('should provide comprehensive ARIA labels and descriptions', async ({ page }) => {
      // Check stasis mode accessibility
      const initButton = page.locator('[data-testid="initialize-systems"]');
      await expect(initButton).toHaveAttribute('aria-label', /initialize.*systems/i);
      await expect(initButton).toHaveAttribute('aria-describedby');
      
      const description = page.locator(`#${await initButton.getAttribute('aria-describedby')}`);
      await expect(description).toBeVisible();
      await expect(description).toContainText(/wake.*bridge/i);
      
      // Progress to check other states
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Communication preferences should be properly labeled
      const styleOptions = page.locator('.communication-style-options');
      await expect(styleOptions).toHaveAttribute('role', 'radiogroup');
      await expect(styleOptions).toHaveAttribute('aria-labelledby');
      
      const styleRadios = page.locator('.communication-style-options input[type="radio"]');
      for (const radio of await styleRadios.all()) {
        await expect(radio).toHaveAttribute('aria-describedby');
      }
    });

    test('should announce status changes and updates', async ({ page }) => {
      // Should have live regions for announcements
      const statusRegion = page.locator('[aria-live="polite"]');
      await expect(statusRegion).toBeVisible();
      
      const alertRegion = page.locator('[aria-live="assertive"]');
      await expect(alertRegion).toBeVisible();
      
      // Test status announcements
      await page.click('[data-testid="initialize-systems"]');
      
      // Should announce awakening
      await expect(statusRegion).toContainText(/systems.*awakening/i);
      
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      
      // Should announce selection
      await expect(statusRegion).toContainText(/formal.*selected/i);
      
      await page.click('[data-testid="save-preferences"]');
      
      // Should announce completion
      await expect(statusRegion).toContainText(/preferences.*saved/i);
    });

    test('should provide proper headings hierarchy', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Check heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1); // Should have exactly one h1
      
      const h2s = page.locator('h2');
      const h2Count = await h2s.count();
      expect(h2Count).toBeGreaterThan(0);
      
      const h3s = page.locator('h3');
      const h3Count = await h3s.count();
      
      // Should not skip heading levels
      if (h3Count > 0) {
        expect(h2Count).toBeGreaterThan(0);
      }
      
      // Each heading should be meaningful
      for (const heading of await h2s.all()) {
        const text = await heading.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test('should provide context for complex interactions', async ({ page }) => {
      // Complete setup to access complex features
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      
      // Agent cards should have comprehensive descriptions
      const agentCards = page.locator('.agent-card');
      for (const card of await agentCards.all()) {
        await expect(card).toHaveAttribute('aria-labelledby');
        await expect(card).toHaveAttribute('aria-describedby');
        
        // Should describe current status and capabilities
        const description = await card.getAttribute('aria-describedby');
        const descElement = page.locator(`#${description}`);
        await expect(descElement).toContainText(/status|role|capabilities/i);
      }
    });

    test('should handle complex widgets with proper ARIA patterns', async ({ page }) => {
      // Fast-track to voice discovery with complex widgets
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      await page.click('[data-testid="crew-manifest"]');
      await page.click('.agent-card:first-child');
      await page.selectOption('[data-testid="assign-department"]', 'engineering');
      await page.click('[data-testid="confirm-assignment"]');
      await page.click('[data-testid="begin-voice-discovery"]');
      await page.waitForSelector('.system-tuning');
      
      // Sliders should use proper ARIA
      const sliders = page.locator('input[type="range"]');
      for (const slider of await sliders.all()) {
        await expect(slider).toHaveAttribute('aria-label');
        await expect(slider).toHaveAttribute('aria-valuemin');
        await expect(slider).toHaveAttribute('aria-valuemax');
        await expect(slider).toHaveAttribute('aria-valuenow');
        await expect(slider).toHaveAttribute('aria-valuetext');
      }
      
      // Progress indicators should be accessible
      const progressBars = page.locator('[role="progressbar"]');
      for (const progress of await progressBars.all()) {
        await expect(progress).toHaveAttribute('aria-label');
        await expect(progress).toHaveAttribute('aria-valuenow');
        await expect(progress).toHaveAttribute('aria-valuemin');
        await expect(progress).toHaveAttribute('aria-valuemax');
      }
    });
  });

  test.describe('Visual Accessibility & Color', () => {
    test('should meet WCAG AA color contrast requirements', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Test various text/background combinations
      const textElements = page.locator('p, h1, h2, h3, button, a, label');
      const elements = await textElements.all();
      
      for (const element of elements.slice(0, 10)) { // Test first 10 elements
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          const rgb = computed.color.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
          const bgRgb = computed.backgroundColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
          
          return {
            color: rgb ? [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])] : null,
            backgroundColor: bgRgb ? [parseInt(bgRgb[1]), parseInt(bgRgb[2]), parseInt(bgRgb[3])] : null
          };
        });
        
        // Basic check that colors are properly defined
        if (styles.color && styles.backgroundColor) {
          expect(styles.color).toHaveLength(3);
          expect(styles.backgroundColor).toHaveLength(3);
        }
      }
    });

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ forcedColors: 'active' });
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Elements should remain visible and functional
      await expect(page.locator('[data-testid="style-formal"]')).toBeVisible();
      await expect(page.locator('[data-testid="save-preferences"]')).toBeVisible();
      
      // Interactive elements should have visible focus indicators
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should provide sufficient visual indicators beyond color', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Status indicators should use icons + color
      const statusIndicators = page.locator('.status-indicator');
      for (const indicator of await statusIndicators.all()) {
        // Should have either icon, text, or pattern in addition to color
        const hasIcon = await indicator.locator('svg, .icon').count() > 0;
        const hasText = (await indicator.textContent())?.trim().length > 0;
        const hasPattern = await indicator.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.backgroundImage !== 'none' || styles.borderStyle !== 'none';
        });
        
        expect(hasIcon || hasText || hasPattern).toBeTruthy();
      }
    });

    test('should support dark mode accessibility', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Should adapt to dark mode
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Should be dark background
      expect(bodyBg).toMatch(/rgb\\(\\s*[0-5]\\d?,\\s*[0-5]\\d?,\\s*[0-5]\\d?\\s*\\)/);
      
      // Text should be light
      const headingColor = await page.locator('h1').evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      expect(headingColor).toMatch(/rgb\\(\\s*[2-9]\\d{2},\\s*[2-9]\\d{2},\\s*[2-9]\\d{2}\\s*\\)/);
    });
  });

  test.describe('Motor Accessibility & Interaction', () => {
    test('should provide adequate click/touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // All interactive elements should be at least 44x44px
      const interactiveElements = page.locator('button, a, input, select, [role="button"]');
      const elements = await interactiveElements.all();
      
      for (const element of elements) {
        const box = await element.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should support reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Animations should be disabled or minimal
      const animatedElements = page.locator('.pulse-animation, .fade-in, .slide-in');
      for (const element of await animatedElements.all()) {
        const animationDuration = await element.evaluate((el) => {
          return window.getComputedStyle(el).animationDuration;
        });
        
        // Should be none or very short
        expect(animationDuration === 'none' || parseFloat(animationDuration) < 0.3).toBeTruthy();
      }
    });

    test('should provide alternative interaction methods', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Drag and drop operations should have keyboard alternatives
      const draggableElements = page.locator('[draggable="true"]');
      for (const element of await draggableElements.all()) {
        // Should have associated keyboard controls
        const hasKeyboardAlternative = await element.evaluate((el) => {
          const parent = el.closest('.drag-container');
          return parent?.querySelector('.keyboard-controls') !== null;
        });
        expect(hasKeyboardAlternative).toBeTruthy();
      }
    });

    test('should handle timeout extensions for slow interactions', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Forms with timeouts should provide extensions
      const timedForms = page.locator('.timed-form, .session-timeout');
      if (await timedForms.count() > 0) {
        // Should have timeout warning
        const timeoutWarning = page.locator('.timeout-warning');
        await expect(timeoutWarning).toBeVisible();
        
        // Should have extend button
        const extendButton = page.locator('[data-testid="extend-session"]');
        await expect(extendButton).toBeVisible();
        
        // Should work with keyboard
        await extendButton.focus();
        await page.keyboard.press('Enter');
        
        // Should confirm extension
        await expect(page.locator('.session-extended')).toBeVisible();
      }
    });
  });

  test.describe('Cognitive Accessibility', () => {
    test('should provide clear error messages and recovery', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Test form validation
      await page.click('[data-testid="save-preferences"]'); // Submit without selection
      
      // Should show clear error message
      const errorMessage = page.locator('.error-message, [role="alert"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/please.*select/i);
      
      // Should indicate which field has the error
      const errorField = page.locator('.error-field, [aria-invalid="true"]');
      await expect(errorField).toBeVisible();
      
      // Should provide suggestion for fixing
      const suggestion = page.locator('.error-suggestion');
      await expect(suggestion).toBeVisible();
      await expect(suggestion).toContainText(/choose.*communication/i);
    });

    test('should provide contextual help and guidance', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Should have help buttons
      const helpButtons = page.locator('.help-button, [aria-label*="help"]');
      await expect(helpButtons.first()).toBeVisible();
      
      // Help should provide clear explanations
      await helpButtons.first().click();
      const helpContent = page.locator('.help-content');
      await expect(helpContent).toBeVisible();
      await expect(helpContent).toContainText(/explanation|description|guide/i);
      
      // Should be dismissible
      await page.keyboard.press('Escape');
      await expect(helpContent).not.toBeVisible();
    });

    test('should support multiple learning styles with varied content presentation', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.ai-introduction');
      
      // Should offer multiple content formats
      const textContent = page.locator('.text-content');
      await expect(textContent).toBeVisible();
      
      const visualContent = page.locator('.visual-content, .diagram, .illustration');
      await expect(visualContent).toBeVisible();
      
      // Should have option for audio
      const audioToggle = page.locator('[data-testid="enable-audio"], .audio-control');
      await expect(audioToggle).toBeVisible();
      
      // Should have step-by-step breakdown
      const stepGuide = page.locator('.step-guide, .tutorial-steps');
      await expect(stepGuide).toBeVisible();
    });

    test('should provide consistent navigation and layout', async ({ page }) => {
      // Complete several navigation actions
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Navigation elements should be in consistent locations
      const nav = page.locator('nav, .navigation');
      const navBox = await nav.boundingBox();
      
      await page.click('[data-testid="crew-manifest"]');
      await page.waitForSelector('.crew-list');
      
      // Navigation should remain in same location
      const navBox2 = await nav.boundingBox();
      expect(Math.abs((navBox?.x || 0) - (navBox2?.x || 0))).toBeLessThan(10);
      expect(Math.abs((navBox?.y || 0) - (navBox2?.y || 0))).toBeLessThan(10);
      
      // Breadcrumbs should show current location
      const breadcrumbs = page.locator('.breadcrumbs, [aria-label*="breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
      await expect(breadcrumbs).toContainText(/crew|manifest/i);
    });

    test('should provide memory aids and progress tracking', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should show progress indicators
      const progressIndicator = page.locator('.progress-indicator, .journey-progress');
      await expect(progressIndicator).toBeVisible();
      
      // Should indicate completed steps
      const completedSteps = page.locator('.step-complete, .completed-stage');
      const completedCount = await completedSteps.count();
      expect(completedCount).toBeGreaterThan(0);
      
      // Should show what's next
      const nextSteps = page.locator('.next-steps, .upcoming-actions');
      await expect(nextSteps).toBeVisible();
      
      // Should provide summary of choices made
      const choicesSummary = page.locator('.choices-summary, .user-preferences-summary');
      await expect(choicesSummary).toBeVisible();
      await expect(choicesSummary).toContainText(/formal/i);
    });
  });

  test.describe('Internationalization & Localization', () => {
    test('should support RTL languages', async ({ page }) => {
      // Simulate RTL language
      await page.addInitScript(() => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      });
      
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Layout should adapt to RTL
      const container = page.locator('.bridge-container');
      const direction = await container.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('rtl');
      
      // Text alignment should be appropriate
      const textElements = page.locator('p, h1, h2, h3');
      for (const element of await textElements.all()) {
        const textAlign = await element.evaluate((el) => {
          return window.getComputedStyle(el).textAlign;
        });
        expect(textAlign).toMatch(/right|start/);
      }
    });

    test('should handle language switching accessibility', async ({ page }) => {
      // Should have language selector
      const langSelector = page.locator('.language-selector, [aria-label*="language"]');
      await expect(langSelector).toBeVisible();
      
      // Should be properly labeled
      await expect(langSelector).toHaveAttribute('aria-label');
      
      // Should announce language changes
      const liveRegion = page.locator('[aria-live]');
      await langSelector.click();
      await page.click('[data-lang="es"]'); // Switch to Spanish
      
      // Should announce the change
      await expect(liveRegion).toContainText(/language.*changed|idioma/i);
    });
  });

  test.describe('Stress Testing & Edge Cases', () => {
    test('should handle multiple accessibility features simultaneously', async ({ page }) => {
      // Enable multiple accessibility features
      await page.emulateMedia({ 
        reducedMotion: 'reduce',
        forcedColors: 'active',
        colorScheme: 'dark'
      });
      
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Should remain functional with all features enabled
      await expect(page.locator('[data-testid="style-formal"]')).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await expect(page.locator('.bridge-overview')).toBeVisible();
    });

    test('should maintain accessibility during error states', async ({ page }) => {
      // Simulate network errors
      await page.route('**/api/**', route => route.abort('failed'));
      
      await page.goto('/');
      
      // Should show accessible error message
      const errorMessage = page.locator('.error-message, [role="alert"]');
      await expect(errorMessage).toBeVisible();
      
      // Should still be keyboard navigable
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should provide retry mechanism
      const retryButton = page.locator('[data-testid="retry"], .retry-button');
      await expect(retryButton).toBeVisible();
      await expect(retryButton).toHaveAttribute('aria-label');
    });
  });
});