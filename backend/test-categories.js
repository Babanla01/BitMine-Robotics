#!/usr/bin/env node

/**
 * Categories API Test Script
 * Tests all CRUD operations for categories and subcategories
 */

const API_BASE_URL = 'http://localhost:5001/api';

// Color codes for terminal output
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

// Helper to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// Test runner
async function runTests() {
  console.log(`${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║  Categories API Test Suite              ║${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}\n`);

  let categoryId, subcategoryId;

  // Test 1: Create Category
  log.test('Create Category');
  try {
    const { status, data } = await apiCall('POST', '/categories', {
      name: 'Test Robotics Kits',
      description: 'Advanced robotics and electronics kits',
    });

    if (status === 201 && data.id) {
      categoryId = data.id;
      log.success(`Category created with ID: ${categoryId}`);
    } else {
      log.error(`Failed to create category (Status: ${status})`);
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
  }

  // Test 2: Get All Categories
  log.test('Get All Categories');
  try {
    const { status, data } = await apiCall('GET', '/categories');

    if (status === 200 && Array.isArray(data)) {
      log.success(`Retrieved ${data.length} categories`);
      log.info(`Categories: ${data.map((c) => c.name).join(', ')}`);
    } else {
      log.error(`Failed to retrieve categories (Status: ${status})`);
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
  }

  // Test 3: Get Single Category
  if (categoryId) {
    log.test('Get Single Category');
    try {
      const { status, data } = await apiCall('GET', `/categories/${categoryId}`);

      if (status === 200 && data.id === categoryId) {
        log.success(`Retrieved category: ${data.name}`);
      } else {
        log.error(`Failed to retrieve category (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 4: Update Category
  if (categoryId) {
    log.test('Update Category');
    try {
      const { status, data } = await apiCall('PUT', `/categories/${categoryId}`, {
        name: 'Updated Robotics Kits',
        description: 'Updated description',
      });

      if (status === 200 && data.name === 'Updated Robotics Kits') {
        log.success(`Category updated: ${data.name}`);
      } else {
        log.error(`Failed to update category (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 5: Create Subcategory
  if (categoryId) {
    log.test('Create Subcategory');
    try {
      const { status, data } = await apiCall('POST', `/categories/${categoryId}/subcategories`, {
        name: 'Beginner Kit',
        description: 'Perfect for beginners',
      });

      if (status === 201 && data.id) {
        subcategoryId = data.id;
        log.success(`Subcategory created with ID: ${subcategoryId}`);
      } else {
        log.error(`Failed to create subcategory (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 6: Get Subcategories
  if (categoryId) {
    log.test('Get Subcategories for Category');
    try {
      const { status, data } = await apiCall('GET', `/categories/${categoryId}/subcategories`);

      if (status === 200 && Array.isArray(data)) {
        log.success(`Retrieved ${data.length} subcategories`);
        log.info(`Subcategories: ${data.map((s) => s.name).join(', ')}`);
      } else {
        log.error(`Failed to retrieve subcategories (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 7: Update Subcategory
  if (subcategoryId) {
    log.test('Update Subcategory');
    try {
      const { status, data } = await apiCall('PUT', `/categories/subcategories/${subcategoryId}`, {
        name: 'Advanced Beginner Kit',
        description: 'For someone wanting to advance',
      });

      if (status === 200 && data.name === 'Advanced Beginner Kit') {
        log.success(`Subcategory updated: ${data.name}`);
      } else {
        log.error(`Failed to update subcategory (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 8: Delete Subcategory
  if (subcategoryId) {
    log.test('Delete Subcategory');
    try {
      const { status, data } = await apiCall('DELETE', `/categories/subcategories/${subcategoryId}`);

      if (status === 200 && data.message) {
        log.success(`Subcategory deleted: ${data.message}`);
      } else {
        log.error(`Failed to delete subcategory (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 9: Delete Category
  if (categoryId) {
    log.test('Delete Category');
    try {
      const { status, data } = await apiCall('DELETE', `/categories/${categoryId}`);

      if (status === 200 && data.message) {
        log.success(`Category deleted: ${data.message}`);
      } else {
        log.error(`Failed to delete category (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Test 10: Verify Category Deletion
  if (categoryId) {
    log.test('Verify Category Deletion');
    try {
      const { status } = await apiCall('GET', `/categories/${categoryId}`);

      if (status === 404) {
        log.success(`Category confirmed deleted (404 Not Found)`);
      } else {
        log.error(`Category still exists (Status: ${status})`);
      }
    } catch (error) {
      log.error(`Error: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.yellow}║  Test Summary                           ║${colors.reset}`);
  console.log(`${colors.yellow}╠════════════════════════════════════════╣${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Start tests
console.log(`${colors.gray}Waiting for API to be ready...${colors.reset}\n`);

// Give server time to start
setTimeout(runTests, 2000);
