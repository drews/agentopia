import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// Simple smoke tests
When('I check the backend health endpoint', async ({ request }) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const response = await request.get(`${backendUrl}/health`);
  // Store response for later assertions
  (request as any).lastResponse = response;
});

Then('the backend should respond with status {int}', async ({ request }, expectedStatus: number) => {
  const response = (request as any).lastResponse;
  expect(response.status()).toBe(expectedStatus);
});

Then('the response should indicate the service is healthy', async ({ request }) => {
  const response = (request as any).lastResponse;
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody.status).toBe('healthy');
});