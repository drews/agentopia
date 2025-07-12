import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

// Note: Basic health check steps are defined in health-check.steps.ts to avoid duplicates
// This file can be used for smoke-test specific steps that don't overlap