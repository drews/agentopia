const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    // Navigate to the agent showcase
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Set viewport for desktop
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Wait for content to load
    await page.waitForSelector('.retro-agent, .modern-agent, .minimal-agent', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for animations to settle
    
    // 1. Full showcase overview (Retro theme by default)
    await page.screenshot({
      path: path.join(screenshotsDir, '01-agent-showcase-retro-overview.png'),
      fullPage: true
    });
    
    // 2. Switch to Modern theme
    await page.click('button:nth-of-type(2)'); // Modern theme button
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '02-agent-showcase-modern-theme.png'),
      fullPage: true
    });
    
    // 3. Switch to Minimal theme
    await page.click('button:nth-of-type(3)'); // Minimal theme button
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-agent-showcase-minimal-theme.png'),
      fullPage: true
    });
    
    // 4. Back to Retro and focus on agent grid
    await page.click('button:nth-of-type(1)'); // Retro theme button
    await page.waitForTimeout(1000);
    
    const agentGrid = await page.$('div[style*="grid-template-columns"]');
    if (agentGrid) {
      await agentGrid.screenshot({
        path: path.join(screenshotsDir, '04-agent-grid-retro-closeup.png')
      });
    }
    
    // 5. Click on an agent to show selection state
    await page.click('div[style*="grid-template-columns"] > div:first-child');
    await page.waitForTimeout(500);
    await agentGrid.screenshot({
      path: path.join(screenshotsDir, '05-agent-selected-state.png')
    });
    
    // 6. Capture theme comparison section
    const themeComparison = await page.$('h2:contains("Theme Comparison") + p + div');
    if (themeComparison) {
      await themeComparison.screenshot({
        path: path.join(screenshotsDir, '06-theme-comparison.png')
      });
    }
    
    // 7. Capture status states section
    const statusStates = await page.$('h2:contains("Status States") + p + div');
    if (statusStates) {
      await statusStates.screenshot({
        path: path.join(screenshotsDir, '07-status-states-demo.png')
      });
    }
    
    // 8. Mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '08-mobile-responsive.png'),
      fullPage: true
    });
    
    // 9. Tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '09-tablet-responsive.png'),
      fullPage: true
    });
    
    console.log('Screenshots captured successfully!');
    console.log('Files saved to:', screenshotsDir);
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Handle the case where puppeteer might not be installed
async function main() {
  try {
    await captureScreenshots();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Puppeteer not found. Installing...');
      const { exec } = require('child_process');
      exec('npm install puppeteer', (err, stdout, stderr) => {
        if (err) {
          console.error('Failed to install puppeteer:', err);
          return;
        }
        console.log('Puppeteer installed. Please run the script again.');
      });
    } else {
      throw error;
    }
  }
}

main().catch(console.error);