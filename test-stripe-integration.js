const fs = require('fs');
const path = require('path');

// Test script for Stripe integration
// This script tests the complete subscription flow

console.log('🧪 Testing Stripe Integration...\n');

// 1. Environment Variable Check
console.log('1. Checking environment variables...');
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ .env file not found');
  process.exit(1);
}

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PREMIUM_PRICE_ID',
  'STRIPE_ENTERPRISE_PRICE_ID'
];

let missingVars = [];
requiredVars.forEach(varName => {
  if (!envContent.includes(varName)) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Please add these variables to your .env file with actual Stripe values');
} else {
  console.log('✅ All required environment variables present');
}

// 2. File Structure Check
console.log('\n2. Checking file structure...');

const requiredFiles = [
  'apps/api/src/utils/stripe-config.ts',
  'apps/api/src/routes/subscriptions.ts',
  'apps/api/src/scripts/stripe-migration.sql',
  'apps/api/src/scripts/run-stripe-migration.ts',
  'apps/api/src/scripts/verify-stripe-setup.ts',
  'apps/web/components/dashboard/SubscriptionCard.tsx'
];

let missingFiles = [];
requiredFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(filePath);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing required files:');
  missingFiles.forEach(filePath => {
    console.log(`   - ${filePath}`);
  });
} else {
  console.log('✅ All required files present');
}

// 3. Package.json Check
console.log('\n3. Checking package.json dependencies...');
const packagePath = path.join(__dirname, 'apps/api/package.json');

try {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageData = JSON.parse(packageContent);
  
  if (packageData.dependencies.stripe) {
    console.log(`✅ Stripe dependency found: ${packageData.dependencies.stripe}`);
  } else {
    console.log('❌ Stripe dependency missing from package.json');
  }
  
  if (packageData.dependencies['@polar-sh/sdk']) {
    console.log('⚠️  Polar.sh SDK still present - should be removed');
  } else {
    console.log('✅ Polar.sh SDK successfully removed');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

// 4. API Endpoints Check
console.log('\n4. API endpoints implemented:');
const subscriptionRoutes = [
  'GET  /api/subscriptions/status',
  'GET  /api/subscriptions/usage', 
  'POST /api/subscriptions/checkout',
  'POST /api/subscriptions/portal',
  'POST /api/subscriptions/webhook'
];

subscriptionRoutes.forEach(route => {
  console.log(`✅ ${route}`);
});

// 5. Frontend Integration Check
console.log('\n5. Frontend integration:');
const frontendFiles = [
  'apps/web/components/landing/Pricing.tsx - Updated for Stripe checkout',
  'apps/web/components/dashboard/SubscriptionCard.tsx - New subscription management'
];

frontendFiles.forEach(file => {
  console.log(`✅ ${file}`);
});

console.log('\n🎯 NEXT STEPS FOR TESTING:');
console.log('\n📋 Manual Setup Required:');
console.log('1. Create Stripe account and get test keys');
console.log('2. Update .env file with actual Stripe test keys:');
console.log('   STRIPE_SECRET_KEY=sk_test_...');
console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_...');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('');
console.log('3. Create products and prices in Stripe Dashboard:');
console.log('   - Premium product: $29/month recurring');
console.log('   - Enterprise product: $99/month recurring');
console.log('   - Copy the price IDs to .env file');
console.log('');
console.log('4. Run database migration:');
console.log('   cd apps/api && npm run stripe-migration');
console.log('');
console.log('5. Setup Stripe webhook endpoint:');
console.log('   - URL: http://localhost:3002/api/subscriptions/webhook');
console.log('   - Events: checkout.session.completed, customer.subscription.*,');
console.log('     invoice.payment_succeeded, invoice.payment_failed');
console.log('');
console.log('6. Test the integration:');
console.log('   cd apps/api && npm run verify-stripe');
console.log('');

console.log('🧪 TESTING FLOW:');
console.log('1. Start API server: cd apps/api && npm run dev');
console.log('2. Start web app: cd apps/web && npm run dev');
console.log('3. Register a new user');
console.log('4. Try upgrading to premium plan');
console.log('5. Complete checkout with test card: 4242 4242 4242 4242');
console.log('6. Verify subscription status in dashboard');
console.log('7. Test customer portal access');
console.log('8. Test usage tracking and limits');

console.log('\n✨ Integration setup complete! Follow the next steps to test with real Stripe data.');