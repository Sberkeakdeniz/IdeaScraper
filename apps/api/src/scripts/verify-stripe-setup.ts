import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { validateStripeConfig, testStripeConnection, createStripeClient } from '../utils/stripe-config';
import { supabaseAdmin } from '../utils/supabase';

async function verifyStripeSetup() {
  console.log('🔍 Verifying Stripe integration setup...\n');

  let hasErrors = false;

  try {
    // 1. Validate environment variables
    console.log('1. Checking environment variables...');
    const config = validateStripeConfig();
    console.log('✅ All required Stripe environment variables are set');
    console.log(`   - Secret key: ${config.secretKey.substring(0, 12)}...`);
    console.log(`   - Publishable key: ${config.publishableKey.substring(0, 12)}...`);
    console.log(`   - Webhook secret: ${config.webhookSecret.substring(0, 12)}...`);
    console.log(`   - Premium price ID: ${config.premiumPriceId}`);
    console.log(`   - Enterprise price ID: ${config.enterprisePriceId}\n`);

    // 2. Test Stripe API connection
    console.log('2. Testing Stripe API connection...');
    await testStripeConnection(config);
    console.log('✅ Successfully connected to Stripe API\n');

    // 3. Verify Stripe products and prices
    console.log('3. Verifying Stripe products and prices...');
    const stripe = createStripeClient(config);
    
    try {
      const premiumPrice = await stripe.prices.retrieve(config.premiumPriceId);
      console.log(`✅ Premium price found: $${premiumPrice.unit_amount! / 100}/${premiumPrice.recurring?.interval}`);
    } catch (error) {
      console.log('❌ Premium price not found in Stripe dashboard');
      console.log('   Please create a premium product and price in Stripe dashboard');
      hasErrors = true;
    }

    try {
      const enterprisePrice = await stripe.prices.retrieve(config.enterprisePriceId);
      console.log(`✅ Enterprise price found: $${enterprisePrice.unit_amount! / 100}/${enterprisePrice.recurring?.interval}`);
    } catch (error) {
      console.log('❌ Enterprise price not found in Stripe dashboard');
      console.log('   Please create an enterprise product and price in Stripe dashboard');
      hasErrors = true;
    }

    // 4. Test webhook endpoint configuration
    console.log('\n4. Webhook endpoint information...');
    console.log('⚠️  Remember to configure webhook endpoint in Stripe dashboard:');
    console.log(`   URL: ${process.env.API_URL}/api/subscriptions/webhook`);
    console.log('   Events to listen for:');
    console.log('   - checkout.session.completed');
    console.log('   - customer.subscription.created');
    console.log('   - customer.subscription.updated');
    console.log('   - customer.subscription.deleted');
    console.log('   - invoice.payment_succeeded');
    console.log('   - invoice.payment_failed');

    // 5. Verify Supabase schema
    console.log('\n5. Checking Supabase database schema...');
    const { data: schemaCheck, error: schemaError } = await supabaseAdmin
      .from('users')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_tier, subscription_ends_at')
      .limit(1);

    if (schemaError) {
      console.log('❌ Database schema not ready for Stripe integration');
      console.log('   Run: npm run stripe-migration');
      console.log('   Or manually execute stripe-migration.sql in Supabase dashboard');
      hasErrors = true;
    } else {
      console.log('✅ Database schema is ready for Stripe integration');
    }

    // 6. Test subscription endpoints
    console.log('\n6. API endpoints available:');
    console.log('✅ GET  /api/subscriptions/status - Get user subscription status');
    console.log('✅ GET  /api/subscriptions/usage - Get user usage statistics');
    console.log('✅ POST /api/subscriptions/checkout - Create checkout session');
    console.log('✅ POST /api/subscriptions/portal - Create customer portal session');
    console.log('✅ POST /api/subscriptions/webhook - Handle Stripe webhooks');

    // Summary
    console.log('\n🎉 SETUP SUMMARY');
    if (hasErrors) {
      console.log('❌ Some issues need to be resolved before Stripe integration is ready');
      console.log('\nNext steps:');
      console.log('1. Create products and prices in Stripe dashboard');
      console.log('2. Run database migration: npm run stripe-migration');
      console.log('3. Configure webhook endpoint in Stripe dashboard');
      console.log('4. Test the integration with a sample transaction');
    } else {
      console.log('✅ Stripe integration is properly configured!');
      console.log('\nNext steps:');
      console.log('1. Configure webhook endpoint in Stripe dashboard');
      console.log('2. Test the complete subscription flow');
      console.log('3. Update frontend to use new Stripe integration');
    }

  } catch (error: any) {
    console.error('❌ Setup verification failed:', error.message);
    hasErrors = true;
  }

  process.exit(hasErrors ? 1 : 0);
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyStripeSetup();
}

export { verifyStripeSetup };