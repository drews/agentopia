import { test, expect } from '@playwright/test';

// Responsive Design Test Suite
// These tests validate interface adaptation across different screen sizes and orientations

test.describe('Responsive Design Validation', () => {
  
  test.describe('Mobile Experience (320px - 768px)', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE dimensions
    
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
    });

    test('should adapt stasis mode for mobile', async ({ page }) => {
      // Should show mobile-optimized stasis mode
      await expect(page.locator('.bridge-container')).toHaveClass(/stasis-mode/);
      
      // Initialize button should be prominently placed
      const initButton = page.locator('[data-testid="initialize-systems"]');
      await expect(initButton).toBeVisible();
      
      // Should use mobile-appropriate sizing
      const buttonBox = await initButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThan(44); // Minimum touch target
      
      // Title should be appropriately sized
      const title = page.locator('.bridge-header h1');
      await expect(title).toBeVisible();
      
      // Should stack elements vertically
      const container = page.locator('.bridge-container');
      await expect(container).toHaveCSS('flex-direction', 'column');
      
      await expect(page).toHaveScreenshot('mobile-stasis-mode.png');
    });

    test('should handle awakening sequence on mobile', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.ai-introduction');
      
      // AI introduction should be mobile-optimized
      const aiIntro = page.locator('.ai-introduction');
      await expect(aiIntro).toBeVisible();
      
      // Text should be readable
      const introText = page.locator('.ai-introduction-text');
      const textBox = await introText.boundingBox();
      expect(textBox?.width).toBeLessThan(375); // Should fit in viewport
      
      // Communication options should be touch-friendly
      const commOptions = page.locator('.communication-style-options button');
      for (const option of await commOptions.all()) {
        const buttonBox = await option.boundingBox();
        expect(buttonBox?.height).toBeGreaterThan(44);
      }
      
      await expect(page).toHaveScreenshot('mobile-awakening-sequence.png');
    });

    test('should adapt bridge overview for mobile navigation', async ({ page }) => {
      // Complete initial setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Bridge grid should adapt to mobile
      const bridgeGrid = page.locator('.bridge-grid');
      await expect(bridgeGrid).toBeVisible();
      
      // Should use mobile navigation patterns
      const mobileNav = page.locator('.mobile-navigation');
      await expect(mobileNav).toBeVisible();
      
      // Sidebar should be collapsible or bottom-sheet style
      const sidebar = page.locator('.bridge-sidebar');
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox?.y).toBeGreaterThan(400); // Should be below main content
      
      // Touch areas should be appropriately sized
      const crewManifest = page.locator('[data-testid="crew-manifest"]');
      const manifestBox = await crewManifest.boundingBox();
      expect(manifestBox?.height).toBeGreaterThan(44);
      
      await expect(page).toHaveScreenshot('mobile-bridge-overview.png');
    });

    test('should optimize mission interface for mobile', async ({ page }) => {
      // Fast-track to mission interface
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
      await page.click('[data-testid="quick-setup"]');
      await page.waitForSelector('.mission-interface');
      
      // Mission cards should be appropriately sized for mobile
      const missionCards = page.locator('.starter-mission');
      for (const card of await missionCards.all()) {
        const cardBox = await card.boundingBox();
        expect(cardBox?.width).toBeLessThan(375);
        expect(cardBox?.height).toBeGreaterThan(120);
      }
      
      // Should use mobile-appropriate layouts
      const missionInterface = page.locator('.mission-interface');
      await expect(missionInterface).toHaveCSS('flex-direction', 'column');
      
      await expect(page).toHaveScreenshot('mobile-mission-interface.png');
    });

    test('should handle touch interactions properly', async ({ page }) => {
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // Test touch targets
      const styleOptions = page.locator('.communication-style-options button');
      
      for (const option of await styleOptions.all()) {
        // Should respond to touch
        await option.tap();
        await expect(option).toHaveClass(/selected|active/);
        
        // Should provide visual feedback
        await page.waitForTimeout(100);
      }
      
      // Test scroll behavior
      await page.touchscreen.tap(200, 300);
      await page.mouse.wheel(0, 100);
      
      // Should scroll smoothly
      const scrollContainer = page.locator('.scrollable-content');
      await expect(scrollContainer).toBeVisible();
    });
  });

  test.describe('Tablet Experience (768px - 1024px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad dimensions
    
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
    });

    test('should provide hybrid mobile-desktop experience', async ({ page }) => {
      // Complete setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should show more content than mobile but less than desktop
      const bridgeGrid = page.locator('.bridge-grid');
      const gridBox = await bridgeGrid.boundingBox();
      expect(gridBox?.width).toBeGreaterThan(600);
      expect(gridBox?.width).toBeLessThan(1200);
      
      // Sidebar should be partially visible or expandable
      const sidebar = page.locator('.bridge-sidebar');
      await expect(sidebar).toBeVisible();
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox?.width).toBeLessThan(300);
      
      await expect(page).toHaveScreenshot('tablet-bridge-overview.png');
    });

    test('should optimize for landscape and portrait orientations', async ({ page }) => {
      // Test portrait orientation (768x1024)
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      await expect(page).toHaveScreenshot('tablet-portrait.png');
      
      // Switch to landscape orientation (1024x768)
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(500);
      
      // Layout should adapt
      const bridgeContainer = page.locator('.bridge-container');
      await expect(bridgeContainer).toBeVisible();
      
      // Should use horizontal layout in landscape
      const sidebarLandscape = page.locator('.bridge-sidebar');
      const sidebarLandscapeBox = await sidebarLandscape.boundingBox();
      expect(sidebarLandscapeBox?.x).toBeGreaterThan(600); // Should be to the side
      
      await expect(page).toHaveScreenshot('tablet-landscape.png');
    });
  });

  test.describe('Desktop Experience (1024px+)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });
    
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
    });

    test('should provide full desktop experience', async ({ page }) => {
      // Complete setup
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should show full layout
      const bridgeGrid = page.locator('.bridge-grid');
      const gridBox = await bridgeGrid.boundingBox();
      expect(gridBox?.width).toBeGreaterThan(1200);
      
      // Sidebar should be fully visible
      const sidebar = page.locator('.bridge-sidebar');
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox?.width).toBeGreaterThan(250);
      expect(sidebarBox?.x).toBeGreaterThan(1400); // Should be on the right
      
      await expect(page).toHaveScreenshot('desktop-full-layout.png');
    });

    test('should handle large screen displays (4K, ultrawide)', async ({ page }) => {
      // Test 4K resolution
      await page.setViewportSize({ width: 3840, height: 2160 });
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Content should not be stretched too wide
      const mainContent = page.locator('.bridge-main');
      const contentBox = await mainContent.boundingBox();
      expect(contentBox?.width).toBeLessThan(2400); // Should have max-width
      
      // Should center content appropriately
      expect(contentBox?.x).toBeGreaterThan(600); // Should have margins
      
      await expect(page).toHaveScreenshot('4k-display.png');
      
      // Test ultrawide (21:9)
      await page.setViewportSize({ width: 2560, height: 1080 });
      await page.waitForTimeout(500);
      
      // Should handle ultrawide appropriately
      const ultrawideContent = page.locator('.bridge-container');
      const ultrawideBox = await ultrawideContent.boundingBox();
      expect(ultrawideBox?.width).toBeLessThan(2000); // Should not stretch full width
      
      await expect(page).toHaveScreenshot('ultrawide-display.png');
    });
  });

  test.describe('Cross-Device Feature Consistency', () => {
    test('should maintain feature parity across devices', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        
        // Complete basic setup
        await page.click('[data-testid="initialize-systems"]');
        await page.waitForSelector('.communication-preferences');
        await page.click('[data-testid="style-formal"]');
        await page.click('[data-testid="save-preferences"]');
        await page.waitForSelector('.bridge-overview');
        
        // Core features should be available
        await expect(page.locator('[data-testid="crew-manifest"]')).toBeVisible();
        
        // Complete crew assignment
        await page.click('[data-testid="crew-manifest"]');
        await page.waitForSelector('.crew-list');
        await page.click('.agent-card:first-child');
        await page.selectOption('[data-testid="assign-department"]', 'engineering');
        await page.click('[data-testid="confirm-assignment"]');
        
        // Voice discovery should unlock
        await expect(page.locator('[data-testid="begin-voice-discovery"]')).toBeVisible();
        
        await expect(page).toHaveScreenshot(`feature-parity-${viewport.name}.png`);
      }
    });
  });

  test.describe('Responsive Typography and Spacing', () => {
    test('should scale typography appropriately', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, expectedMinSize: 14 },
        { width: 768, height: 1024, expectedMinSize: 16 },
        { width: 1920, height: 1080, expectedMinSize: 16 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        await page.click('[data-testid="initialize-systems"]');
        await page.waitForSelector('.ai-introduction');
        
        // Check body text size
        const bodyText = page.locator('.ai-introduction-text');
        const fontSize = await bodyText.evaluate((el) => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });
        
        expect(fontSize).toBeGreaterThanOrEqual(viewport.expectedMinSize);
        
        // Check heading sizes
        const heading = page.locator('.bridge-header h1');
        const headingSize = await heading.evaluate((el) => {
          return parseInt(window.getComputedStyle(el).fontSize);
        });
        
        expect(headingSize).toBeGreaterThan(fontSize);
      }
    });

    test('should provide appropriate touch targets on touch devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      // All interactive elements should meet minimum touch target size (44px)
      const interactiveElements = page.locator('button, a, input, select');
      const elements = await interactiveElements.all();
      
      for (const element of elements) {
        const box = await element.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Performance Across Devices', () => {
    test('should maintain performance on lower-powered devices', async ({ page }) => {
      // Simulate lower-powered device
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      // Animations should be reduced
      const animatedElements = page.locator('.pulse-animation');
      const animationDuration = await animatedElements.first().evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });
      
      // Should either be 'none' or very short
      expect(animationDuration === 'none' || parseFloat(animationDuration) < 0.5).toBeTruthy();
    });
  });

  test.describe('Accessibility Across Screen Sizes', () => {
    test('should maintain accessibility at all screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        
        await page.click('[data-testid="initialize-systems"]');
        await page.waitForSelector('.communication-preferences');
        
        // Focus should be visible
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        
        // Should have proper ARIA labels
        const ariaLabels = page.locator('[aria-label]');
        const labelCount = await ariaLabels.count();
        expect(labelCount).toBeGreaterThan(0);
        
        // Color contrast should be maintained
        const textElements = page.locator('p, h1, h2, h3, button, a');
        const elements = await textElements.all();
        
        for (const element of elements.slice(0, 5)) { // Check first 5 elements
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });
          
          // Basic check that colors are defined
          expect(styles.color).toBeTruthy();
        }
      }
    });
  });

  test.describe('Responsive Navigation Patterns', () => {
    test('should adapt navigation patterns appropriately', async ({ page }) => {
      // Mobile: hamburger menu or bottom navigation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.click('[data-testid="initialize-systems"]');
      await page.waitForSelector('.communication-preferences');
      await page.click('[data-testid="style-formal"]');
      await page.click('[data-testid="save-preferences"]');
      await page.waitForSelector('.bridge-overview');
      
      // Should have mobile navigation
      const mobileNav = page.locator('.mobile-navigation, .hamburger-menu, .bottom-navigation');
      await expect(mobileNav).toBeVisible();
      
      // Tablet: expanded but compact navigation
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      const tabletNav = page.locator('.tablet-navigation, .compact-sidebar');
      await expect(tabletNav).toBeVisible();
      
      // Desktop: full sidebar or top navigation
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      const desktopNav = page.locator('.desktop-navigation, .full-sidebar');
      await expect(desktopNav).toBeVisible();
    });
  });
});