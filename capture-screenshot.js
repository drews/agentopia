const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshot() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Set viewport for desktop
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Wait for content to load
    console.log('Waiting for agent components to load...');
    await page.waitForSelector('.retro-agent, .modern-agent, .minimal-agent', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for animations to settle
    
    // Take screenshot
    console.log('Capturing screenshot...');
    await page.screenshot({
      path: 'agent-showcase-screenshot.png',
      fullPage: true
    });
    
    console.log('Screenshot saved as agent-showcase-screenshot.png');
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot();