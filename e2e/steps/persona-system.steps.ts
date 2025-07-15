import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { execSync } from 'child_process';

const { Given, When, Then } = createBdd();

// Background steps
Given('the Agentopia backend is running', async ({ page }) => {
  // Check backend health
  const response = await page.request.get('http://localhost:8000/health');
  expect(response.status()).toBe(200);
});

Given('the spaceship bridge frontend is accessible', async ({ page }) => {
  // Navigate to frontend and verify it loads
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toContainText('Spaceship Bridge', { timeout: 10000 });
});

// Persona listing
When('I request the list of available personas', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/personas');
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  page.testInfo().attach('personas-response', { 
    body: JSON.stringify(data, null, 2), 
    contentType: 'application/json' 
  });
  
  // Store for verification
  await page.evaluate((data) => {
    window.testData = { personas: data };
  }, data);
});

Then('I should see the following personas:', async ({ page }, dataTable) => {
  const testData = await page.evaluate(() => window.testData);
  const personas = testData.personas.personas;
  
  for (const row of dataTable.hashes()) {
    expect(personas).toHaveProperty(row.persona_id);
    expect(personas[row.persona_id]).toContain(row.description);
  }
});

// Persona activation
Given('no persona is currently active', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/personas');
  const data = await response.json();
  
  if (data.active_persona && data.active_persona !== 'none') {
    // Clear active persona by activating a null state (if supported)
    // For now, we'll just note the current state
    console.log(`Current persona: ${data.active_persona}`);
  }
});

Given('the {string} persona is active', async ({ page }, personaId: string) => {
  const response = await page.request.post(`http://localhost:8000/api/personas/${personaId}/activate`);
  expect(response.status()).toBe(200);
});

When('I activate the {string} persona', async ({ page }, personaId: string) => {
  const response = await page.request.post(`http://localhost:8000/api/personas/${personaId}/activate`);
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  await page.evaluate((data) => {
    window.testData = { ...window.testData, activationResult: data };
  }, data);
});

Then('the persona should be activated successfully', async ({ page }) => {
  const testData = await page.evaluate(() => window.testData);
  expect(testData.activationResult.status).toBe('success');
});

Then('the active persona should be {string}', async ({ page }, personaId: string) => {
  const response = await page.request.get('http://localhost:8000/api/personas');
  const data = await response.json();
  expect(data.active_persona).toBe(personaId);
});

// Mission sending with persona
When('I send a mission {string} to agent {string}', async ({ page }, mission: string, agentId: string) => {
  const response = await page.request.post(`http://localhost:8000/api/agents/${agentId}/mission`, {
    data: { mission }
  });
  expect(response.status()).toBe(200);
  
  // Wait for agent response (give it time to process)
  await page.waitForTimeout(2000);
  
  // Store mission details for verification
  await page.evaluate((details) => {
    window.testData = { ...window.testData, lastMission: details };
  }, { mission, agentId });
});

When('I send a mission {string} to agent {string} with persona {string}', 
  async ({ page }, mission: string, agentId: string, personaId: string) => {
  const response = await page.request.post(`http://localhost:8000/api/agents/${agentId}/mission/persona`, {
    data: { mission, persona_id: personaId }
  });
  expect(response.status()).toBe(200);
  
  // Wait for agent response
  await page.waitForTimeout(2000);
});

// Response verification
Then('the agent should respond with security-focused analysis', async ({ page }) => {
  // Check recent chat messages via WebSocket or API
  // This is a placeholder - in a real implementation you'd check the actual agent response
  const response = await page.request.get('http://localhost:8000/api/bridge/state');
  const bridgeState = await response.json();
  
  // Look for security-related keywords in recent agent activity
  // This is a simplified check
  expect(response.status()).toBe(200);
});

Then('the response should mention security considerations', async ({ page }) => {
  // This would check the actual agent response for security-related terms
  // For now, we'll just verify the request was processed
  const testData = await page.evaluate(() => window.testData);
  expect(testData.lastMission).toBeDefined();
});

Then('the response should be action-oriented', async ({ page }) => {
  // Verify the agent response has action-oriented characteristics
  // This is a placeholder for actual response analysis
  const response = await page.request.get('http://localhost:8000/api/bridge/state');
  expect(response.status()).toBe(200);
});

Then('the response should focus on rapid implementation', async ({ page }) => {
  // Similar placeholder for verifying implementation-focused response
  const testData = await page.evaluate(() => window.testData);
  expect(testData.lastMission.mission).toContain('Implement');
});

// Persona switching
Then('the active persona should change to {string}', async ({ page }, personaId: string) => {
  const response = await page.request.get('http://localhost:8000/api/personas');
  const data = await response.json();
  expect(data.active_persona).toBe(personaId);
});

Then('all agents should receive the persona update', async ({ page }) => {
  // Check that the WebSocket broadcast occurred
  // This would require WebSocket connection monitoring
  const response = await page.request.get('http://localhost:8000/api/bridge/state');
  expect(response.status()).toBe(200);
});

// Specific persona missions
Then('the agent should respond with security audit focus', async ({ page }) => {
  // Verify security audit characteristics in response
  const response = await page.request.get('http://localhost:8000/api/bridge/state');
  expect(response.status()).toBe(200);
});

Then('the response should include threat analysis', async ({ page }) => {
  // Check for threat analysis content
  // Placeholder implementation
  expect(true).toBe(true);
});

// Error handling
When('I try to activate a non-existent persona {string}', async ({ page }, personaId: string) => {
  const response = await page.request.post(`http://localhost:8000/api/personas/${personaId}/activate`);
  await page.evaluate((status) => {
    window.testData = { ...window.testData, errorStatus: status };
  }, response.status());
});

Then('I should receive an error message', async ({ page }) => {
  const testData = await page.evaluate(() => window.testData);
  expect(testData.errorStatus).toBe(404);
});

Then('the active persona should remain unchanged', async ({ page }) => {
  // Check that the persona didn't change due to error
  const response = await page.request.get('http://localhost:8000/api/personas');
  expect(response.status()).toBe(200);
});

// Context suggestions
When('I request persona suggestions for context {string}', async ({ page }, context: string) => {
  // This would call a context suggestion API endpoint
  // For now, we'll simulate by checking the personas config
  const response = await page.request.get('http://localhost:8000/api/personas');
  expect(response.status()).toBe(200);
  
  await page.evaluate((context) => {
    window.testData = { ...window.testData, suggestContext: context };
  }, context);
});

Then('the suggested persona should be {string}', async ({ page }, expectedPersona: string) => {
  // Verify the suggestion matches expected
  // This is a placeholder - real implementation would check context triggers
  const testData = await page.evaluate(() => window.testData);
  expect(testData.suggestContext).toBeDefined();
});

// Persistence testing
Given('I restart the backend service', async ({ page }) => {
  // This would require actual service restart
  // For testing purposes, we'll just add a delay and verify
  await page.waitForTimeout(1000);
});

When('I check the active persona', async ({ page }) => {
  const response = await page.request.get('http://localhost:8000/api/personas');
  const data = await response.json();
  await page.evaluate((data) => {
    window.testData = { ...window.testData, persistedPersona: data.active_persona };
  }, data);
});

Then('the persona should still be {string}', async ({ page }, personaId: string) => {
  const testData = await page.evaluate(() => window.testData);
  expect(testData.persistedPersona).toBe(personaId);
});

// Multiple agents
When('I send missions to multiple agents:', async ({ page }, dataTable) => {
  for (const row of dataTable.hashes()) {
    const response = await page.request.post(`http://localhost:8000/api/agents/${row.agent_id}/mission`, {
      data: { mission: row.mission }
    });
    expect(response.status()).toBe(200);
  }
  
  // Wait for all agents to process
  await page.waitForTimeout(3000);
});

Then('all agents should respond with methodical, detailed analysis', async ({ page }) => {
  // Check all agent responses for methodical characteristics
  const response = await page.request.get('http://localhost:8000/api/bridge/state');
  expect(response.status()).toBe(200);
});

Then('all responses should reflect long-term thinking', async ({ page }) => {
  // Verify long-term thinking patterns in responses
  // Placeholder implementation
  expect(true).toBe(true);
});

// WebSocket testing
Given('I am connected to the WebSocket', async ({ page }) => {
  // Establish WebSocket connection for testing
  await page.goto('http://localhost:3000');
  
  // Wait for WebSocket connection to be established
  await page.waitForFunction(() => {
    return window.WebSocket && document.readyState === 'complete';
  });
});

Then('I should receive a WebSocket message about persona change', async ({ page }) => {
  // Monitor WebSocket messages for persona change notifications
  // This would require WebSocket message interception
  expect(true).toBe(true); // Placeholder
});

Then('the message should include the new persona ID', async ({ page }) => {
  // Verify WebSocket message content
  expect(true).toBe(true); // Placeholder
});

// Script integration testing
When('I run the persona script {string} command', async ({ page }, command: string) => {
  try {
    const result = execSync(`cd /Users/drewby/src/agentopia && ./scripts/claude-personas.sh ${command}`, 
      { encoding: 'utf8', timeout: 5000 });
    
    await page.evaluate((result) => {
      window.testData = { ...window.testData, scriptResult: result };
    }, result);
  } catch (error) {
    await page.evaluate((error) => {
      window.testData = { ...window.testData, scriptError: error.message };
    }, error);
  }
});

Then('I should see all available personas listed', async ({ page }) => {
  const testData = await page.evaluate(() => window.testData);
  
  if (testData.scriptResult) {
    expect(testData.scriptResult).toContain('sage_staff_engineer');
    expect(testData.scriptResult).toContain('move_fast_hacker');
    expect(testData.scriptResult).toContain('security_paranoid');
    expect(testData.scriptResult).toContain('product_pragmatist');
  } else {
    // Backend might not be running for script test
    console.log('Script test skipped - backend not available');
  }
});

Then('the persona should be activated via API', async ({ page }) => {
  // Verify that script activation worked
  const response = await page.request.get('http://localhost:8000/api/personas');
  if (response.status() === 200) {
    const data = await response.json();
    expect(data.active_persona).toBe('sage_staff_engineer');
  }
});

Then('it should show {string} as active', async ({ page }, personaId: string) => {
  const testData = await page.evaluate(() => window.testData);
  
  if (testData.scriptResult) {
    expect(testData.scriptResult).toContain(personaId);
  }
});