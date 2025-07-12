import { test, expect } from '@playwright/test';

test.describe('Agent Showcase Screenshots', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('capture agent showcase screenshots', async ({ page }) => {
    // Navigate to the showcase
    await page.goto('http://localhost:3001');
    
    // Wait for content to load
    await page.waitForSelector('.retro-agent, .modern-agent, .minimal-agent', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for animations to settle
    
    // 1. Full showcase overview (Retro theme by default)
    await expect(page).toHaveScreenshot('01-agent-showcase-retro-overview.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 2. Switch to Modern theme
    await page.getByRole('button', { name: 'modern' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('02-agent-showcase-modern-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 3. Switch to Minimal theme
    await page.getByRole('button', { name: 'minimal' }).click();
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('03-agent-showcase-minimal-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 4. Back to Retro and focus on agent grid
    await page.getByRole('button', { name: 'retro' }).click();
    await page.waitForTimeout(1000);
    
    const agentGrid = page.locator('div[style*="grid-template-columns"]').first();
    await expect(agentGrid).toHaveScreenshot('04-agent-grid-retro-closeup.png');
    
    // 5. Click on an agent to show selection state
    await agentGrid.locator('> div').first().click();
    await page.waitForTimeout(500);
    await expect(agentGrid).toHaveScreenshot('05-agent-selected-state.png');
    
    // 6. Capture theme comparison section
    const themeComparison = page.locator('text=Theme Comparison').locator('..').locator('div[style*="flex"]');
    await expect(themeComparison).toHaveScreenshot('06-theme-comparison.png');
    
    // 7. Capture status states section
    const statusStates = page.locator('text=Status States').locator('..').locator('div[style*="flex"]');
    await expect(statusStates).toHaveScreenshot('07-status-states-demo.png');
  });

  test('capture responsive screenshots', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('.retro-agent, .modern-agent, .minimal-agent');
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('08-mobile-responsive.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('09-tablet-responsive.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('capture individual agent states', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('.retro-agent, .modern-agent, .minimal-agent');
    await page.waitForTimeout(2000);
    
    // Focus on the status states section and capture each theme
    const themes = ['retro', 'modern', 'minimal'];
    
    for (const theme of themes) {
      await page.getByRole('button', { name: theme }).click();
      await page.waitForTimeout(500);
      
      const statusSection = page.locator('text=Status States').locator('..').locator('div[style*="flex"]');
      await expect(statusSection).toHaveScreenshot(`10-status-states-${theme}.png`);
    }
  });
});