const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

async function addColumns() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔧 Adding missing columns to users table...');
  
  // First let's check current users table structure
  const { data: testUser, error: testError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (testError) {
    console.error('❌ Cannot access users table:', testError);
    return;
  }
  
  if (testUser.length > 0) {
    console.log('Current columns:', Object.keys(testUser[0]));
    
    const hasStripeCustomer = 'stripe_customer_id' in testUser[0];
    const hasStripeSubscription = 'stripe_subscription_id' in testUser[0];
    const hasSubscriptionStatus = 'subscription_status' in testUser[0];
    
    console.log('Missing columns check:');
    console.log('  stripe_customer_id:', hasStripeCustomer ? '✅ exists' : '❌ missing');
    console.log('  stripe_subscription_id:', hasStripeSubscription ? '✅ exists' : '❌ missing');  
    console.log('  subscription_status:', hasSubscriptionStatus ? '✅ exists' : '❌ missing');
    
    // Since we can't run DDL via API, let's create a workaround by updating existing user
    if (!hasStripeCustomer || !hasStripeSubscription || !hasSubscriptionStatus) {
      console.log('\n⚠️  STRIPE COLUMNS MISSING');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log(`
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;  
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
      `);
      
      // For testing purposes, let's temporarily modify the subscription route
      console.log('\n🔧 TEMPORARY WORKAROUND: Modifying subscription query to work without Stripe columns...');
    }
  }
}

addColumns();