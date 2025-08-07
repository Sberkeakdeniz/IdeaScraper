#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Test results
const results = {
  files: { passed: 0, failed: 0, issues: [] },
  structure: { passed: 0, failed: 0, issues: [] },
  configs: { passed: 0, failed: 0, issues: [] },
  packages: { passed: 0, failed: 0, issues: [] }
};

console.log('🔍 Validating Reddit Idea Finder Project...\n');

// Required files and directories
const requiredStructure = [
  'package.json',
  'turbo.json',
  '.gitignore',
  'README.md',
  'docker-compose.yml',
  'Makefile',
  '.env.example',
  'apps/web',
  'apps/api',
  'apps/scraper',
  'packages/database',
  'packages/shared',
  'packages/ui',
  'packages/config'
];

// Validate project structure
console.log('📁 Validating project structure...');
requiredStructure.forEach(item => {
  const fullPath = path.join(projectRoot, item);
  if (fs.existsSync(fullPath)) {
    results.structure.passed++;
    console.log(`✅ ${item}`);
  } else {
    results.structure.failed++;
    results.structure.issues.push(`Missing: ${item}`);
    console.log(`❌ ${item} - MISSING`);
  }
});

// Validate package.json files
console.log('\n📦 Validating package.json files...');
const packagePaths = [
  'package.json',
  'apps/web/package.json',
  'apps/api/package.json',
  'packages/database/package.json',
  'packages/shared/package.json',
  'packages/ui/package.json',
  'packages/config/package.json'
];

packagePaths.forEach(packagePath => {
  const fullPath = path.join(projectRoot, packagePath);
  if (fs.existsSync(fullPath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (packageData.name && packageData.version) {
        results.packages.passed++;
        console.log(`✅ ${packagePath} - Valid`);
      } else {
        results.packages.failed++;
        results.packages.issues.push(`${packagePath} - Missing name or version`);
        console.log(`❌ ${packagePath} - Invalid structure`);
      }
    } catch (error) {
      results.packages.failed++;
      results.packages.issues.push(`${packagePath} - JSON parse error`);
      console.log(`❌ ${packagePath} - JSON parse error`);
    }
  } else {
    results.packages.failed++;
    results.packages.issues.push(`${packagePath} - File not found`);
    console.log(`❌ ${packagePath} - Not found`);
  }
});

// Validate configuration files
console.log('\n⚙️  Validating configuration files...');
const configFiles = [
  { path: 'apps/web/next.config.js', description: 'Next.js config' },
  { path: 'apps/web/tailwind.config.js', description: 'Tailwind config' },
  { path: 'apps/api/jest.config.js', description: 'Jest config' },
  { path: 'packages/database/prisma/schema.prisma', description: 'Prisma schema' },
  { path: 'apps/scraper/requirements.txt', description: 'Python requirements' }
];

configFiles.forEach(({ path: configPath, description }) => {
  const fullPath = path.join(projectRoot, configPath);
  if (fs.existsSync(fullPath)) {
    results.configs.passed++;
    console.log(`✅ ${description} - ${configPath}`);
  } else {
    results.configs.failed++;
    results.configs.issues.push(`${description} - ${configPath}`);
    console.log(`❌ ${description} - ${configPath} - MISSING`);
  }
});

// Validate critical source files
console.log('\n📄 Validating critical source files...');
const criticalFiles = [
  { path: 'apps/api/src/index.ts', description: 'API entry point' },
  { path: 'apps/api/src/routes/auth.ts', description: 'Auth routes' },
  { path: 'apps/api/src/routes/ideas.ts', description: 'Ideas routes' },
  { path: 'apps/web/app/layout.tsx', description: 'Web app layout' },
  { path: 'apps/web/app/page.tsx', description: 'Web app home page' },
  { path: 'apps/scraper/src/scheduler.py', description: 'Scraper scheduler' },
  { path: 'apps/scraper/src/scrapers/reddit_scraper.py', description: 'Reddit scraper' },
  { path: 'packages/database/src/index.ts', description: 'Database client' },
  { path: 'packages/shared/src/index.ts', description: 'Shared utilities' }
];

criticalFiles.forEach(({ path: filePath, description }) => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.trim().length > 0) {
      results.files.passed++;
      console.log(`✅ ${description} - ${filePath}`);
    } else {
      results.files.failed++;
      results.files.issues.push(`${description} - ${filePath} is empty`);
      console.log(`❌ ${description} - ${filePath} - EMPTY`);
    }
  } else {
    results.files.failed++;
    results.files.issues.push(`${description} - ${filePath}`);
    console.log(`❌ ${description} - ${filePath} - MISSING`);
  }
});

// Generate summary
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));

console.log(`📁 Project Structure: ${results.structure.passed} passed, ${results.structure.failed} failed`);
console.log(`📦 Package Files: ${results.packages.passed} passed, ${results.packages.failed} failed`);
console.log(`⚙️  Configuration Files: ${results.configs.passed} passed, ${results.configs.failed} failed`);
console.log(`📄 Source Files: ${results.files.passed} passed, ${results.files.failed} failed`);

const totalPassed = results.structure.passed + results.packages.passed + results.configs.passed + results.files.passed;
const totalFailed = results.structure.failed + results.packages.failed + results.configs.failed + results.files.failed;
const totalTests = totalPassed + totalFailed;

console.log(`\n🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests * 100)}%)`);

// Show issues if any
const allIssues = [
  ...results.structure.issues,
  ...results.packages.issues,
  ...results.configs.issues,
  ...results.files.issues
];

if (allIssues.length > 0) {
  console.log('\n⚠️  ISSUES FOUND:');
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
} else {
  console.log('\n✨ No issues found! Project structure is valid.');
}

// Exit with appropriate code
process.exit(totalFailed > 0 ? 1 : 0);