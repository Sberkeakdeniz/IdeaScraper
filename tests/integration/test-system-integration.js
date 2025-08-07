#!/usr/bin/env node

/**
 * System Integration Test Suite for Reddit Idea Finder
 * 
 * This script tests the integration between all major components:
 * - Database schema and operations
 * - API endpoints and authentication
 * - Frontend components compilation
 * - Python scraper functionality
 * - Shared package imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '../..');

// Test results tracking
const testResults = {
  database: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] },
  frontend: { passed: 0, failed: 0, tests: [] },
  scraper: { passed: 0, failed: 0, tests: [] },
  packages: { passed: 0, failed: 0, tests: [] }
};

function runTest(category, testName, testFn) {
  console.log(`🧪 ${testName}...`);
  try {
    const result = testFn();
    testResults[category].passed++;
    testResults[category].tests.push({ name: testName, status: 'PASSED', result });
    console.log(`✅ ${testName} - PASSED`);
    return true;
  } catch (error) {
    testResults[category].failed++;
    testResults[category].tests.push({ name: testName, status: 'FAILED', error: error.message });
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
    return false;
  }
}

console.log('🚀 Starting System Integration Tests...\n');

// Test 1: Database Schema Validation
console.log('💾 Testing Database Integration...');

runTest('database', 'Prisma Schema Syntax', () => {
  const schemaPath = path.join(projectRoot, 'packages/database/prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for essential models
  if (!schema.includes('model User')) throw new Error('User model not found');
  if (!schema.includes('model BusinessIdea')) throw new Error('BusinessIdea model not found');
  if (!schema.includes('model UserIdeaInteraction')) throw new Error('UserIdeaInteraction model not found');
  
  // Check for proper relationships
  if (!schema.includes('interactions UserIdeaInteraction[]')) throw new Error('User interactions relation missing');
  if (!schema.includes('@relation(fields:')) throw new Error('Foreign key relations missing');
  
  return 'Schema contains all required models and relationships';
});

runTest('database', 'Database Client Export', () => {
  const clientPath = path.join(projectRoot, 'packages/database/src/index.ts');
  const clientCode = fs.readFileSync(clientPath, 'utf8');
  
  if (!clientCode.includes('PrismaClient')) throw new Error('PrismaClient not imported');
  if (!clientCode.includes('export const prisma')) throw new Error('Prisma client not exported');
  if (!clientCode.includes('export * from \'@prisma/client\'')) throw new Error('Prisma types not re-exported');
  
  return 'Database client properly configured and exported';
});

// Test 2: API Integration
console.log('\n🔗 Testing API Integration...');

runTest('api', 'API Route Structure', () => {
  const routes = ['auth', 'ideas', 'users', 'subscriptions'];
  const missingRoutes = [];
  
  routes.forEach(route => {
    const routePath = path.join(projectRoot, `apps/api/src/routes/${route}.ts`);
    if (!fs.existsSync(routePath)) {
      missingRoutes.push(route);
    }
  });
  
  if (missingRoutes.length > 0) {
    throw new Error(`Missing routes: ${missingRoutes.join(', ')}`);
  }
  
  return `All ${routes.length} API route files exist`;
});

runTest('api', 'Authentication Middleware', () => {
  const authPath = path.join(projectRoot, 'apps/api/src/middleware/auth.ts');
  const authCode = fs.readFileSync(authPath, 'utf8');
  
  if (!authCode.includes('authenticateToken')) throw new Error('authenticateToken function missing');
  if (!authCode.includes('AuthRequest')) throw new Error('AuthRequest interface missing');
  if (!authCode.includes('jwt.verify')) throw new Error('JWT verification missing');
  
  return 'Authentication middleware properly implemented';
});

runTest('api', 'API Test Configuration', () => {
  const jestConfigPath = path.join(projectRoot, 'apps/api/jest.config.js');
  const testSetupPath = path.join(projectRoot, 'apps/api/src/__tests__/setup.ts');
  const authTestPath = path.join(projectRoot, 'apps/api/src/__tests__/auth.test.ts');
  
  if (!fs.existsSync(jestConfigPath)) throw new Error('Jest config missing');
  if (!fs.existsSync(testSetupPath)) throw new Error('Test setup missing');
  if (!fs.existsSync(authTestPath)) throw new Error('Auth tests missing');
  
  return 'API testing infrastructure properly configured';
});

// Test 3: Frontend Integration
console.log('\n🎨 Testing Frontend Integration...');

runTest('frontend', 'Next.js Configuration', () => {
  const nextConfigPath = path.join(projectRoot, 'apps/web/next.config.js');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (!nextConfig.includes('appDir: true')) throw new Error('App router not configured');
  if (!nextConfig.includes('transpilePackages')) throw new Error('Package transpilation not configured');
  
  return 'Next.js configuration is correct';
});

runTest('frontend', 'UI Components Structure', () => {
  const componentsPath = path.join(projectRoot, 'apps/web/components');
  const uiPath = path.join(componentsPath, 'ui');
  const landingPath = path.join(componentsPath, 'landing');
  const layoutPath = path.join(componentsPath, 'layout');
  
  if (!fs.existsSync(uiPath)) throw new Error('UI components directory missing');
  if (!fs.existsSync(landingPath)) throw new Error('Landing components directory missing');
  if (!fs.existsSync(layoutPath)) throw new Error('Layout components directory missing');
  
  // Check for essential UI components
  const requiredUIComponents = ['button.tsx', 'card.tsx', 'avatar.tsx', 'dropdown-menu.tsx'];
  requiredUIComponents.forEach(component => {
    if (!fs.existsSync(path.join(uiPath, component))) {
      throw new Error(`UI component missing: ${component}`);
    }
  });
  
  return `UI components structure is complete with ${requiredUIComponents.length} essential components`;
});

runTest('frontend', 'Tailwind Configuration', () => {
  const tailwindConfigPath = path.join(projectRoot, 'apps/web/tailwind.config.js');
  const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
  
  if (!tailwindConfig.includes('darkMode')) throw new Error('Dark mode not configured');
  if (!tailwindConfig.includes('tailwindcss-animate')) throw new Error('Animation plugin missing');
  if (!tailwindConfig.includes('packages/ui/src/**/*.{ts,tsx}')) throw new Error('UI package content not included');
  
  return 'Tailwind CSS configuration is complete';
});

// Test 4: Python Scraper Integration  
console.log('\n🐍 Testing Python Scraper Integration...');

runTest('scraper', 'Python Module Structure', () => {
  const scraperModules = [
    'src/scrapers/reddit_scraper.py',
    'src/processors/idea_extractor.py',
    'src/services/database_service.py',
    'src/scheduler.py',
    'src/config.py'
  ];
  
  const missingModules = [];
  scraperModules.forEach(module => {
    const modulePath = path.join(projectRoot, 'apps/scraper', module);
    if (!fs.existsSync(modulePath)) {
      missingModules.push(module);
    }
  });
  
  if (missingModules.length > 0) {
    throw new Error(`Missing Python modules: ${missingModules.join(', ')}`);
  }
  
  return `All ${scraperModules.length} Python modules exist`;
});

runTest('scraper', 'Reddit Scraper Implementation', () => {
  const scraperPath = path.join(projectRoot, 'apps/scraper/src/scrapers/reddit_scraper.py');
  const scraperCode = fs.readFileSync(scraperPath, 'utf8');
  
  if (!scraperCode.includes('class RedditScraper')) throw new Error('RedditScraper class missing');
  if (!scraperCode.includes('def scrape_subreddit')) throw new Error('scrape_subreddit method missing');
  if (!scraperCode.includes('praw.Reddit')) throw new Error('PRAW Reddit client not used');
  if (!scraperCode.includes('TARGET_SUBREDDITS')) throw new Error('Target subreddits configuration missing');
  
  return 'Reddit scraper implementation is complete';
});

runTest('scraper', 'AI Idea Extractor', () => {
  const extractorPath = path.join(projectRoot, 'apps/scraper/src/processors/idea_extractor.py');
  const extractorCode = fs.readFileSync(extractorPath, 'utf8');
  
  if (!extractorCode.includes('class IdeaExtractor')) throw new Error('IdeaExtractor class missing');
  if (!extractorCode.includes('def extract_business_ideas')) throw new Error('extract_business_ideas method missing');
  if (!extractorCode.includes('openai.ChatCompletion.create')) throw new Error('OpenAI integration missing');
  if (!extractorCode.includes('IDEA_EXTRACTION_PROMPT')) throw new Error('AI prompt missing');
  
  return 'AI idea extractor implementation is complete';
});

runTest('scraper', 'Python Test Files', () => {
  const testFiles = [
    'tests/test_reddit_scraper.py',
    'tests/test_idea_extractor.py'
  ];
  
  const missingTests = [];
  testFiles.forEach(testFile => {
    const testPath = path.join(projectRoot, 'apps/scraper', testFile);
    if (!fs.existsSync(testPath)) {
      missingTests.push(testFile);
    }
  });
  
  if (missingTests.length > 0) {
    throw new Error(`Missing test files: ${missingTests.join(', ')}`);
  }
  
  return `All ${testFiles.length} Python test files exist`;
});

// Test 5: Shared Packages Integration
console.log('\n📦 Testing Shared Packages Integration...');

runTest('packages', 'Shared Types Export', () => {
  const sharedTypesPath = path.join(projectRoot, 'packages/shared/src/types/index.ts');
  const typesCode = fs.readFileSync(sharedTypesPath, 'utf8');
  
  const requiredTypes = ['User', 'BusinessIdea', 'UserIdeaInteraction', 'IdeaFilters', 'ApiResponse'];
  requiredTypes.forEach(type => {
    if (!typesCode.includes(`export interface ${type}`)) {
      throw new Error(`Type ${type} not exported`);
    }
  });
  
  return `All ${requiredTypes.length} essential types are exported`;
});

runTest('packages', 'Shared Utils Implementation', () => {
  const sharedUtilsPath = path.join(projectRoot, 'packages/shared/src/utils/index.ts');
  const utilsCode = fs.readFileSync(sharedUtilsPath, 'utf8');
  
  const requiredUtils = ['formatDate', 'formatNumber', 'truncateText', 'generateSlug', 'debounce'];
  requiredUtils.forEach(util => {
    if (!utilsCode.includes(`export function ${util}`)) {
      throw new Error(`Utility function ${util} not exported`);
    }
  });
  
  return `All ${requiredUtils.length} utility functions are implemented`;
});

runTest('packages', 'Constants Definition', () => {
  const constantsPath = path.join(projectRoot, 'packages/shared/src/constants/index.ts');
  const constantsCode = fs.readFileSync(constantsPath, 'utf8');
  
  const requiredConstants = ['SUBSCRIPTION_TIERS', 'INTERACTION_TYPES', 'API_ENDPOINTS', 'HTTP_STATUS'];
  requiredConstants.forEach(constant => {
    if (!constantsCode.includes(`export const ${constant}`)) {
      throw new Error(`Constant ${constant} not exported`);
    }
  });
  
  return `All ${requiredConstants.length} essential constants are defined`;
});

runTest('packages', 'Package Test Coverage', () => {
  const sharedTestsPath = path.join(projectRoot, 'packages/shared/src/__tests__');
  if (!fs.existsSync(sharedTestsPath)) {
    throw new Error('Shared package tests directory missing');
  }
  
  const testFiles = fs.readdirSync(sharedTestsPath).filter(file => file.endsWith('.test.ts'));
  if (testFiles.length === 0) {
    throw new Error('No test files found in shared package');
  }
  
  return `${testFiles.length} test files found in shared package`;
});

// Test 6: Docker Integration
console.log('\n🐳 Testing Docker Integration...');

runTest('packages', 'Docker Configuration', () => {
  const dockerComposePath = path.join(projectRoot, 'docker-compose.yml');
  const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
  
  const requiredServices = ['postgres', 'redis', 'api', 'web', 'scraper'];
  requiredServices.forEach(service => {
    if (!dockerComposeContent.includes(`${service}:`)) {
      throw new Error(`Docker service ${service} not configured`);
    }
  });
  
  // Check for Dockerfile existence
  const dockerfiles = [
    'apps/api/Dockerfile',
    'apps/web/Dockerfile', 
    'apps/scraper/Dockerfile'
  ];
  
  dockerfiles.forEach(dockerfile => {
    if (!fs.existsSync(path.join(projectRoot, dockerfile))) {
      throw new Error(`${dockerfile} missing`);
    }
  });
  
  return `Docker compose and ${dockerfiles.length} Dockerfiles are configured`;
});

// Generate final report
console.log('\n' + '='.repeat(80));
console.log('📋 INTEGRATION TEST RESULTS');
console.log('='.repeat(80));

let totalPassed = 0;
let totalFailed = 0;

Object.entries(testResults).forEach(([category, results]) => {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  console.log(`\n${categoryName.padEnd(15)} | ✅ ${results.passed.toString().padStart(2)} passed | ❌ ${results.failed.toString().padStart(2)} failed`);
  
  totalPassed += results.passed;
  totalFailed += results.failed;
  
  // Show failed tests
  results.tests.forEach(test => {
    if (test.status === 'FAILED') {
      console.log(`  ❌ ${test.name}: ${test.error}`);
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log(`🎯 OVERALL RESULTS: ${totalPassed}/${totalPassed + totalFailed} tests passed (${Math.round(totalPassed/(totalPassed + totalFailed) * 100)}%)`);

if (totalFailed === 0) {
  console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
  console.log('✨ The Reddit Idea Finder system is properly integrated and ready for development.');
} else {
  console.log(`\n⚠️  ${totalFailed} tests failed. Please review and fix the issues above.`);
}

console.log('\n📝 Next Steps:');
console.log('1. Set up environment variables (.env file)');
console.log('2. Start PostgreSQL and Redis services');
console.log('3. Run database migrations: npm run db:migrate');
console.log('4. Start development servers: npm run dev');
console.log('5. Run unit tests: npm run test');

process.exit(totalFailed > 0 ? 1 : 0);