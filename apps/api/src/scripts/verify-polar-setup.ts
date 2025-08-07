#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { validatePolarConfig, testPolarConnection, createPolarClient } from '../utils/polar-config';

// Load environment variables
dotenv.config();

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

async function runVerification(): Promise<void> {
  console.log('🔍 Verifying Polar.sh Configuration...\n');
  
  const checks: CheckResult[] = [];
  let polarConfig;
  let polar;

  // Check 1: Environment Variables
  try {
    polarConfig = validatePolarConfig();
    checks.push({
      name: 'Environment Variables',
      passed: true,
      message: 'All required environment variables are set and properly formatted'
    });
  } catch (error: any) {
    checks.push({
      name: 'Environment Variables',
      passed: false,
      message: error.message
    });
  }

  // Check 2: API Connection  
  if (polarConfig) {
    try {
      await testPolarConnection(polarConfig);
      checks.push({
        name: 'API Connection',
        passed: true,
        message: 'Successfully connected to Polar.sh API'
      });
      
      polar = createPolarClient(polarConfig);
    } catch (error: any) {
      checks.push({
        name: 'API Connection',
        passed: false,
        message: error.message
      });
    }
  } else {
    checks.push({
      name: 'API Connection',
      passed: false,
      message: 'Skipped due to configuration errors'
    });
  }

  // Check 3: Product Access
  if (polar && polarConfig) {
    try {
      // Try to fetch products to verify price IDs exist
      const products = await polar.products.list({
        organizationId: polarConfig.organizationId,
      });

      const productIds = products.items?.map(p => p.prices?.[0]?.id).filter(Boolean) || [];
      
      const premiumExists = productIds.includes(polarConfig.premiumPriceId);
      const enterpriseExists = productIds.includes(polarConfig.enterprisePriceId);

      if (premiumExists && enterpriseExists) {
        checks.push({
          name: 'Product Access',
          passed: true,
          message: 'Both premium and enterprise products found and accessible'
        });
      } else {
        const missing = [];
        if (!premiumExists) missing.push('premium');
        if (!enterpriseExists) missing.push('enterprise');
        
        checks.push({
          name: 'Product Access',
          passed: false,
          message: `Product price IDs not found: ${missing.join(', ')}. Please verify your product configuration.`
        });
      }
    } catch (error: any) {
      checks.push({
        name: 'Product Access',
        passed: false,
        message: `Failed to verify products: ${error.message}`
      });
    }
  } else {
    checks.push({
      name: 'Product Access',
      passed: false,
      message: 'Skipped due to previous errors'
    });
  }

  // Check 4: Frontend URL
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl && frontendUrl !== 'http://localhost:3000') {
    checks.push({
      name: 'Frontend URL',
      passed: true,
      message: `Frontend URL configured: ${frontendUrl}`
    });
  } else if (frontendUrl === 'http://localhost:3000') {
    checks.push({
      name: 'Frontend URL',
      passed: true,
      message: 'Using development frontend URL (localhost:3000)'
    });
  } else {
    checks.push({
      name: 'Frontend URL',
      passed: false,
      message: 'FRONTEND_URL not configured - checkout success redirects may not work'
    });
  }

  // Print Results
  console.log('📋 Verification Results:\n');
  
  let allPassed = true;
  checks.forEach((check, index) => {
    const icon = check.passed ? '✅' : '❌';
    const status = check.passed ? 'PASS' : 'FAIL';
    
    console.log(`${index + 1}. ${icon} ${check.name}: ${status}`);
    console.log(`   ${check.message}\n`);
    
    if (!check.passed) allPassed = false;
  });

  // Summary
  console.log('═'.repeat(60));
  if (allPassed) {
    console.log('🎉 SUCCESS: Polar.sh is properly configured and ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Test the checkout flow in your application');
    console.log('3. Check webhook logs for successful payment processing');
  } else {
    console.log('💥 ISSUES FOUND: Please fix the errors above before using Polar.sh');
    console.log('\nTroubleshooting:');
    console.log('1. Check docs/POLAR_SETUP.md for detailed setup instructions');
    console.log('2. Verify your .env file has all required variables');  
    console.log('3. Make sure your Polar.sh products are published and active');
  }
  
  console.log('═'.repeat(60));
}

// Run the verification
runVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Verification failed with error:', error);
    process.exit(1);
  });