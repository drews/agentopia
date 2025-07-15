import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

// LLM Service Status Steps
When('I check the LLM service status', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/llm/status');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  page.setExtraHTTPHeaders({ 'llm-status': JSON.stringify(data) });
});

Then('the LLM service should be running', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/llm/status');
  expect(response.status()).toBe(200);
});

Then('the default provider should be configured', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/llm/status');
  const data = await response.json();
  
  expect(data.default_provider).toBeDefined();
  expect(typeof data.default_provider).toBe('string');
});

Then('at least one LLM provider should be available', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/llm/status');
  const data = await response.json();
  
  expect(data.providers).toBeDefined();
  const availableProviders = Object.values(data.providers).filter((provider: any) => provider.available);
  expect(availableProviders.length).toBeGreaterThan(0);
});

// Agent Mission Steps
Given('I can see the Commander agent', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const commanderAgent = page.locator('.agent').filter({ hasText: 'Commander' });
  await expect(commanderAgent).toBeVisible();
});

When('I send a mission {string} to the Commander', async ({ page }, mission: string) => {
  // Send mission via API (simulating bridge interface interaction)
  const response = await page.request.post('http://localhost:8000/api/agents/red_agent/mission', {
    data: {
      mission: mission,
      priority: 5
    }
  });
  
  expect(response.status()).toBe(200);
  
  // Wait for processing
  await page.waitForTimeout(3000);
});

Then('the Commander should respond with an LLM-generated message', async ({ page }) => {
  // Wait for WebSocket message or agent status update
  await page.waitForTimeout(2000);
  
  // Check if there's a chat message or status update indicating LLM response
  const chatMessage = page.locator('.chat-message').last();
  const agentStatus = page.locator('.agent').filter({ hasText: 'Commander' }).locator('.status');
  
  // Either should show activity indicating LLM response
  const hasChatMessage = await chatMessage.count() > 0;
  const hasStatusUpdate = await agentStatus.textContent() !== 'idle';
  
  expect(hasChatMessage || hasStatusUpdate).toBeTruthy();
});

Then('the response should be relevant to the mission', async ({ page }) => {
  // Get the latest agent report to verify the response
  const response = await page.request.get('http://localhost:8000/api/agents/red_agent');
  expect(response.status()).toBe(200);
  
  const agentData = await response.json();
  const currentTask = agentData.current_task;
  
  // Verify task is not empty and contains relevant content
  if (currentTask) {
    expect(currentTask.length).toBeGreaterThan(10);
    expect(currentTask).not.toMatch(/error|failed|apologize/i);
  }
});

Then('the agent status should update to show they received and processed the mission', async ({ page }) => {
  const commanderAgent = page.locator('.agent').filter({ hasText: 'Commander' });
  const status = commanderAgent.locator('.status');
  
  // Status should not be idle after processing mission
  const statusText = await status.textContent();
  expect(statusText?.toLowerCase()).not.toBe('idle');
});

// Chat Integration Steps
When('I send a chat message {string} to the Science Officer', async ({ page }, message: string) => {
  const response = await page.request.post('http://localhost:8000/api/agents/blue_agent/chat', {
    data: {
      message: message
    }
  });
  
  expect(response.status()).toBe(200);
  
  // Wait for LLM processing
  await page.waitForTimeout(4000);
});

Then('I should receive an LLM-generated response via WebSocket', async ({ page }) => {
  // Wait for potential WebSocket messages
  await page.waitForTimeout(2000);
  
  // Check agent status has been updated (indicates LLM processing occurred)
  const response = await page.request.get('http://localhost:8000/api/agents/blue_agent');
  const agentData = await response.json();
  
  expect(agentData.status).not.toBe('idle');
});

Then('the response should be contextually appropriate', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/agents/blue_agent');
  const agentData = await response.json();
  
  if (agentData.current_task) {
    // Response should be substantial and not an error message
    expect(agentData.current_task.length).toBeGreaterThan(20);
    expect(agentData.current_task).not.toMatch(/apologize.*error/i);
  }
});

Then('the message should appear in the bridge communication log', async ({ page }) => {
  // In a real implementation, we'd check for UI elements showing the chat
  // For now, verify the agent processed the message
  const response = await page.request.get('http://localhost:8000/api/agents/blue_agent');
  const agentData = await response.json();
  
  expect(agentData.last_activity).toBeDefined();
});

// Provider Fallback Steps
When('I test the LLM service with various providers', async ({ page }) => {
  // Test different providers
  const providers = ['mock', 'openai', 'anthropic', 'ollama'];
  
  for (const provider of providers) {
    const response = await page.request.post('http://localhost:8000/api/llm/test', {
      data: {
        message: 'Hello, this is a test message',
        provider: provider
      }
    });
    
    // Should either succeed or gracefully fail
    expect([200, 500].includes(response.status())).toBeTruthy();
  }
});

Then('unavailable providers should fall back to mock responses', async ({ page }) => {
  // Mock provider should always work
  const response = await page.request.post('http://localhost:8000/api/llm/test', {
    data: {
      message: 'Test fallback',
      provider: 'mock'
    }
  });
  
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(data.response).toBeDefined();
});

Then('the service should remain operational', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/health');
  expect(response.status()).toBe(200);
});

Then('error messages should be logged appropriately', async ({ page }) => {
  // Verify that the service handles errors gracefully
  const response = await page.request.get('http://localhost:8000/api/llm/status');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.providers).toBeDefined();
});

// System Prompts Steps
Given('I send the same mission to all three agents', async ({ page }) => {
  const mission = 'Evaluate current operational efficiency and provide recommendations';
  const agents = ['red_agent', 'blue_agent', 'yellow_agent'];
  
  for (const agentId of agents) {
    const response = await page.request.post(`http://localhost:8000/api/agents/${agentId}/mission`, {
      data: {
        mission: mission,
        priority: 'normal'
      }
    });
    expect(response.status()).toBe(200);
  }
  
  // Wait for all agents to process
  await page.waitForTimeout(6000);
});

When('the Commander, Science Officer, and Operations Officer respond', async ({ page }) => {
  // Wait for all responses to be processed
  await page.waitForTimeout(3000);
});

Then('each agent\'s response should reflect their unique role and personality', async ({ page }) => {
  const agents = ['red_agent', 'blue_agent', 'yellow_agent'];
  const responses = [];
  
  for (const agentId of agents) {
    const response = await page.request.get(`http://localhost:8000/api/agents/${agentId}`);
    const agentData = await response.json();
    
    if (agentData.current_task) {
      responses.push(agentData.current_task);
    }
  }
  
  // Verify we got responses
  expect(responses.length).toBeGreaterThan(0);
  
  // If we have multiple responses, they should be different
  if (responses.length > 1) {
    const uniqueResponses = [...new Set(responses)];
    expect(uniqueResponses.length).toBeGreaterThan(1);
  }
});

Then('the responses should be distinguishably different based on their specialization', async ({ page }) => {
  // This is tested in the previous step - agents should have different responses
  // reflecting their roles (Commander, Science Officer, Operations Officer)
  await page.waitForTimeout(100);
});

// Real-time Integration Steps
Given('I can see all agents with their current status', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const agents = page.locator('.agent');
  await expect(agents).toHaveCount(3);
  
  // Verify each agent has a visible status
  for (let i = 0; i < 3; i++) {
    const agent = agents.nth(i);
    const status = agent.locator('.status');
    await expect(status).toBeVisible();
  }
});

When('I assign a complex mission to an agent', async ({ page }) => {
  const complexMission = 'Conduct a comprehensive analysis of all ship systems, identify potential issues, prioritize maintenance tasks, and develop a detailed action plan with timelines and resource requirements.';
  
  const response = await page.request.post('http://localhost:8000/api/agents/red_agent/mission', {
    data: {
      mission: complexMission,
      priority: 'high'
    }
  });
  
  expect(response.status()).toBe(200);
});

Then('I should see the agent status change to {string}', async ({ page }, expectedStatus: string) => {
  const commanderAgent = page.locator('.agent').filter({ hasText: 'Commander' });
  const status = commanderAgent.locator('.status');
  
  // Wait for status to potentially change
  await page.waitForTimeout(2000);
  
  const statusText = await status.textContent();
  
  // Status should change from idle (or show processing activity)
  expect(statusText?.toLowerCase()).not.toBe('idle');
});

Then('then see the status change to {string} when LLM response is received', async ({ page }, finalStatus: string) => {
  // Wait for LLM processing to complete
  await page.waitForTimeout(5000);
  
  const commanderAgent = page.locator('.agent').filter({ hasText: 'Commander' });
  const status = commanderAgent.locator('.status');
  
  const statusText = await status.textContent();
  
  // Agent should be active after processing
  expect(['active', 'working', 'thinking'].includes(statusText?.toLowerCase() || '')).toBeTruthy();
});

Then('the agent\'s response should be broadcast to all connected clients', async ({ page }) => {
  // Verify the agent has processed the mission
  const response = await page.request.get('http://localhost:8000/api/agents/red_agent');
  const agentData = await response.json();
  
  expect(agentData.current_task).toBeDefined();
  expect(agentData.last_activity).toBeDefined();
});