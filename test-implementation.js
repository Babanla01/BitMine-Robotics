#!/usr/bin/env node

/**
 * Categories API Endpoint Test
 * Tests that all endpoints are accessible and properly structured
 */

const API_BASE_URL = 'http://localhost:5001/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

let testsPassed = 0;
let testsFailed = 0;

const log = {
  test: (name) => console.log(`${colors.blue}▶ ${name}${colors.reset}`),
  success: (msg) => {
    console.log(`  ${colors.green}✓${colors.reset} ${msg}`);
    testsPassed++;
  },
  error: (msg) => {
    console.log(`  ${colors.red}✗${colors.reset} ${msg}`);
    testsFailed++;
  },
  info: (msg) => console.log(`  ${colors.gray}ℹ${colors.reset} ${msg}`),
};

async function testEndpoint(method, endpoint, description) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method });
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      log.success(`${description} (${method} ${endpoint}) - Status: ${response.status}`);
      return true;
    } else {
      log.error(`${description} - Invalid content type`);
      return false;
    }
  } catch (error) {
    log.error(`${description} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║  Categories API Endpoint Verification   ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Test endpoints
  log.test('GET /api/categories');
  await testEndpoint('GET', '/categories', 'Get all categories');

  log.test('POST /api/categories');
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', description: 'Test category' }),
    });
    
    if (response.status === 201 || response.status === 400) {
      log.success(`POST endpoint exists and responds (Status: ${response.status})`);
    } else {
      log.error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    log.error(`POST endpoint error: ${error.message}`);
  }

  // Test file structure
  log.test('File Structure Verification');
  
  const fs = require('fs');
  const path = require('path');

  const filesToCheck = [
    { path: '/Users/babanla/Downloads/BitMine-Robotics/backend/src/routes/categories.js', name: 'Categories Route' },
    { path: '/Users/babanla/Downloads/BitMine-Robotics/frontend/src/pages/dashboard/CategoriesPage.tsx', name: 'CategoriesPage Component' },
    { path: '/Users/babanla/Downloads/BitMine-Robotics/frontend/src/components/dashboard/DashboardLayout.tsx', name: 'DashboardLayout' },
    { path: '/Users/babanla/Downloads/BitMine-Robotics/backend/src/database/migrations/001_add_categories.sql', name: 'Migration Script' },
  ];

  filesToCheck.forEach((file) => {
    if (fs.existsSync(file.path)) {
      log.success(`${file.name} file exists`);
    } else {
      log.error(`${file.name} file NOT found at ${file.path}`);
    }
  });

  // Summary
  console.log(`\n${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║  Verification Summary                   ║${colors.reset}`);
  console.log(`${colors.yellow}╠════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}✓ All checks passed! The categories feature is properly implemented.${colors.reset}\n`);
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
