// Generated from: e2e/features/health-check.feature
import { test } from "playwright-bdd";

test.describe('Basic Health Check and Screenshot Capture', () => {

  test.beforeEach('Background', async ({ Given, request, And }) => {
    await Given('the spaceship bridge backend is running on port 8000', null, { request }); 
    await And('the React frontend is running on port 3000', null, { request }); 
  });
  
  test('Backend health check', { tag: ['@health', '@critical'] }, async ({ When, request, Then, And }) => { 
    await When('I check the backend health endpoint', null, { request }); 
    await Then('the backend should respond with status 200', null, { request }); 
    await And('the response should indicate the service is healthy', null, { request }); 
  });

  test('Frontend health check', { tag: ['@health', '@critical'] }, async ({ When, page, Then, And }) => { 
    await When('I navigate to the frontend application', null, { page }); 
    await Then('the frontend should load successfully', null, { page }); 
    await And('I should see the USS AGENTOPIA BRIDGE interface', null, { page }); 
  });

  test('Capture current bridge state', { tag: ['@visual', '@progress'] }, async ({ When, page, And, Then }) => { 
    await When('I navigate to the bridge interface', null, { page }); 
    await And('I wait for the interface to fully load', null, { page }); 
    await Then('I should take a screenshot for progress documentation', null, { page }); 
    await And('the screenshot should show the current development state', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use('e2e/features/health-check.feature'),
  $bddFileData: ({}, use) => use(bddFileData),
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":11,"pickleLine":11,"tags":["@health","@critical"],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the spaceship bridge backend is running on port 8000","isBg":true,"stepMatchArguments":[{"group":{"start":48,"value":"8000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And the React frontend is running on port 3000","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"3000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":12,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I check the backend health endpoint","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the backend should respond with status 200","stepMatchArguments":[{"group":{"start":39,"value":"200","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":14,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"And the response should indicate the service is healthy","stepMatchArguments":[]}]},
  {"pwTestLine":17,"pickleLine":17,"tags":["@health","@critical"],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the spaceship bridge backend is running on port 8000","isBg":true,"stepMatchArguments":[{"group":{"start":48,"value":"8000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And the React frontend is running on port 3000","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"3000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":18,"gherkinStepLine":18,"keywordType":"Action","textWithKeyword":"When I navigate to the frontend application","stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"Then the frontend should load successfully","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"And I should see the USS AGENTOPIA BRIDGE interface","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":23,"tags":["@visual","@progress"],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given the spaceship bridge backend is running on port 8000","isBg":true,"stepMatchArguments":[{"group":{"start":48,"value":"8000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"And the React frontend is running on port 3000","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"3000","children":[]},"parameterTypeName":"int"}]},{"pwStepLine":24,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I navigate to the bridge interface","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":25,"keywordType":"Action","textWithKeyword":"And I wait for the interface to fully load","stepMatchArguments":[]},{"pwStepLine":26,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"Then I should take a screenshot for progress documentation","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":27,"keywordType":"Outcome","textWithKeyword":"And the screenshot should show the current development state","stepMatchArguments":[]}]},
]; // bdd-data-end