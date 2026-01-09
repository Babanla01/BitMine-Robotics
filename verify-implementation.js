#!/usr/bin/env node

/**
 * Code Structure Verification Test
 * Verifies that all files exist and have proper structure
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

let passed = 0;
let failed = 0;

const log = {
  test: (name) => console.log(`\n${colors.blue}▶ ${name}${colors.reset}`),
  success: (msg) => {
    console.log(`  ${colors.green}✓${colors.reset} ${msg}`);
    passed++;
  },
  error: (msg) => {
    console.log(`  ${colors.red}✗${colors.reset} ${msg}`);
    failed++;
  },
  info: (msg) => console.log(`  ${colors.gray}ℹ${colors.reset} ${msg}`),
};

const baseDir = '/Users/babanla/Downloads/BitMine-Robotics';

// File existence checks
log.test('File Structure Verification');

const filesToCheck = [
  { path: 'backend/src/routes/categories.js', name: 'Categories API Routes' },
  { path: 'frontend/src/pages/dashboard/CategoriesPage.tsx', name: 'CategoriesPage Component' },
  { path: 'frontend/src/components/dashboard/DashboardLayout.tsx', name: 'DashboardLayout' },
  { path: 'frontend/src/App.tsx', name: 'App Router' },
  { path: 'backend/src/database/migrate.js', name: 'Database Migrations' },
  { path: 'backend/.env', name: 'Environment Configuration' },
  { path: 'backend/src/index.js', name: 'Backend Entry Point' },
  { path: 'frontend/src/pages/dashboard/ProductsPage.tsx', name: 'ProductsPage' },
];

filesToCheck.forEach((file) => {
  const fullPath = path.join(baseDir, file.path);
  if (fs.existsSync(fullPath)) {
    log.success(`${file.name} exists`);
  } else {
    log.error(`${file.name} missing at ${file.path}`);
  }
});

// Content verification
log.test('Code Content Verification');

// Check categories.js has all required endpoints
const categoriesPath = path.join(baseDir, 'backend/src/routes/categories.js');
const categoriesContent = fs.readFileSync(categoriesPath, 'utf8');

const categoriesEndpoints = [
  { name: 'GET /categories', pattern: "router.get('/', async" },
  { name: 'GET /categories/:id', pattern: "router.get('/:id', async" },
  { name: 'POST /categories', pattern: "router.post('/', async" },
  { name: 'PUT /categories/:id', pattern: "router.put('/:id', async" },
  { name: 'DELETE /categories/:id', pattern: "router.delete('/:id', async" },
  { name: 'GET subcategories', pattern: "router.get('/:categoryId/subcategories'" },
  { name: 'POST subcategories', pattern: "router.post('/:categoryId/subcategories'" },
];

categoriesEndpoints.forEach((endpoint) => {
  if (categoriesContent.includes(endpoint.pattern)) {
    log.success(`${endpoint.name} endpoint implemented`);
  } else {
    log.error(`${endpoint.name} endpoint missing`);
  }
});

// Check CategoriesPage.tsx has required features
log.test('Frontend Component Features');

const categoriesPagePath = path.join(baseDir, 'frontend/src/pages/dashboard/CategoriesPage.tsx');
const categoriesPageContent = fs.readFileSync(categoriesPagePath, 'utf8');

const pageFeatures = [
  { name: 'Category Modal', pattern: 'isModalVisible' },
  { name: 'Add Category', pattern: 'handleAddCategory' },
  { name: 'Edit Category', pattern: 'handleEditCategory' },
  { name: 'Delete Category', pattern: 'handleDeleteCategory' },
  { name: 'Subcategory Modal', pattern: 'isSubcategoryModalVisible' },
  { name: 'Add Subcategory', pattern: 'handleAddSubcategory' },
  { name: 'Collapse View', pattern: 'Collapse' },
  { name: 'Form Validation', pattern: 'rules' },
];

pageFeatures.forEach((feature) => {
  if (categoriesPageContent.includes(feature.pattern)) {
    log.success(`${feature.name} feature implemented`);
  } else {
    log.error(`${feature.name} feature missing`);
  }
});

// Check ProductsPage integration
log.test('Products Page Integration');

const productsPagePath = path.join(baseDir, 'frontend/src/pages/dashboard/ProductsPage.tsx');
const productsPageContent = fs.readFileSync(productsPagePath, 'utf8');

const productFeatures = [
  { name: 'Category state', pattern: 'const [categories' },
  { name: 'Fetch categories', pattern: 'fetchCategories' },
  { name: 'Category dropdown', pattern: 'category_id' },
  { name: 'Subcategory dropdown', pattern: 'subcategory_id' },
  { name: 'Category display in table', pattern: 'categories.find' },
];

productFeatures.forEach((feature) => {
  if (productsPageContent.includes(feature.pattern)) {
    log.success(`${feature.name} implemented`);
  } else {
    log.error(`${feature.name} missing`);
  }
});

// Check Database Schema
log.test('Database Schema');

const schemaPath = path.join(baseDir, 'backend/src/database/schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const schemaTables = [
  { name: 'categories table', pattern: 'CREATE TABLE categories' },
  { name: 'subcategories table', pattern: 'CREATE TABLE subcategories' },
  { name: 'categories index', pattern: 'idx_categories_name' },
  { name: 'subcategories index', pattern: 'idx_subcategories_category_id' },
  { name: 'category_id column', pattern: 'category_id' },
  { name: 'subcategory_id column', pattern: 'subcategory_id' },
];

schemaTables.forEach((table) => {
  if (schemaContent.includes(table.pattern)) {
    log.success(`${table.name} defined`);
  } else {
    log.error(`${table.name} missing`);
  }
});

// Check Environment Configuration
log.test('Environment Configuration');

const envPath = path.join(baseDir, 'backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfigs = [
  { name: 'LOCAL Development Config', pattern: 'LOCAL DEVELOPMENT' },
  { name: 'LIVE Production Config', pattern: 'LIVE/PRODUCTION' },
  { name: 'DB_NAME for local', pattern: 'bitmine_local' },
  { name: 'DB_USER for local', pattern: 'postgres' },
];

envConfigs.forEach((config) => {
  if (envContent.includes(config.pattern)) {
    log.success(`${config.name} configured`);
  } else {
    log.error(`${config.name} missing`);
  }
});

// Check DashboardLayout navigation
log.test('Dashboard Navigation');

const layoutPath = path.join(baseDir, 'frontend/src/components/dashboard/DashboardLayout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

const navItems = [
  { name: 'Categories menu item', pattern: "label: 'Categories'" },
  { name: 'Categories path', pattern: '/dashboard/categories' },
  { name: 'Folder icon', pattern: 'FolderOutlined' },
];

navItems.forEach((item) => {
  if (layoutContent.includes(item.pattern)) {
    log.success(`${item.name} added`);
  } else {
    log.error(`${item.name} missing`);
  }
});

// Check App.tsx routing
log.test('Frontend Routing');

const appPath = path.join(baseDir, 'frontend/src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const routes = [
  { name: 'CategoriesPage import', pattern: 'CategoriesPage' },
  { name: 'Categories route', pattern: '/dashboard/categories' },
  { name: 'Route protection', pattern: 'RoleProtectedRoute' },
];

routes.forEach((route) => {
  if (appContent.includes(route.pattern)) {
    log.success(`${route.name} implemented`);
  } else {
    log.error(`${route.name} missing`);
  }
});

// Backend integration
log.test('Backend Integration');

const indexPath = path.join(baseDir, 'backend/src/index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const backendIntegration = [
  { name: 'Categories route import', pattern: 'categoriesRoutes' },
  { name: 'Categories route usage', pattern: "/api/categories" },
];

backendIntegration.forEach((item) => {
  if (indexContent.includes(item.pattern)) {
    log.success(`${item.name} configured`);
  } else {
    log.error(`${item.name} missing`);
  }
});

// Database migrations
log.test('Database Migrations');

const migratePathPath = path.join(baseDir, 'backend/src/database/migrate.js');
const migrateContent = fs.readFileSync(migratePathPath, 'utf8');

const migrations = [
  { name: 'Categories table creation', pattern: 'CREATE TABLE categories' },
  { name: 'Subcategories table creation', pattern: 'CREATE TABLE subcategories' },
  { name: 'category_id column migration', pattern: 'ADD COLUMN category_id' },
  { name: 'subcategory_id column migration', pattern: 'ADD COLUMN subcategory_id' },
];

migrations.forEach((migration) => {
  if (migrateContent.includes(migration.pattern)) {
    log.success(`${migration.name} implemented`);
  } else {
    log.error(`${migration.name} missing`);
  }
});

// Summary
console.log(`\n${colors.yellow}╔════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.yellow}║  Test Summary                           ║${colors.reset}`);
console.log(`${colors.yellow}╠════════════════════════════════════════╣${colors.reset}`);
console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
console.log(`${colors.yellow}╚════════════════════════════════════════╝${colors.reset}\n`);

if (failed === 0) {
  console.log(`${colors.green}✨ All checks passed! Implementation is complete and ready for testing.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}⚠ Some checks failed. Review the errors above.${colors.reset}\n`);
  process.exit(1);
}
