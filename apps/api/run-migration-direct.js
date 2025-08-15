const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🚀 Running Stripe migration directly...');
  
  try {
    // First, let's check if the columns already exist
    console.log('🔍 Checking existing schema...');
    const { data: columns, error: columnError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name IN ('stripe_customer_id', 'stripe_subscription_id', 'subscription_tier', 'subscription_ends_at')
        `
      });
    
    if (columnError) {
      console.log('⚠️ Cannot use RPC exec, will use manual SQL approach');
      
      // Manual approach - check if we can query users table
      const { data: usersTest, error: usersError } = await supabase
        .from('users')
        .select('id, email, subscription_tier')
        .limit(1);
        
      if (usersError) {
        console.error('❌ Cannot access users table:', usersError.message);
        console.log('Please ensure the users table exists and has proper RLS policies');
        return;
      }
      
      console.log('✅ Users table accessible');
      
      if (usersTest.length > 0 && usersTest[0].subscription_tier !== undefined) {
        console.log('✅ subscription_tier column already exists');
      } else {
        console.log('⚠️ subscription_tier column missing - manual migration required');
      }
      
    } else {
      console.log('Found columns:', columns);
    }
    
    // Test if we can add a simple column (this will fail if already exists)
    console.log('🔧 Testing column addition...');
    try {
      const { data, error } = await supabase.rpc('exec', {
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT \'free\';'
      });
      
      if (error) {
        console.log('⚠️ Column addition test failed:', error.message);
      } else {
        console.log('✅ Column addition test passed');
      }
    } catch (e) {
      console.log('⚠️ Cannot execute DDL via RPC');
    }
    
    console.log('\n📋 Manual migration steps required:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');  
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the contents of stripe-migration.sql');
    console.log('6. Execute the query');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

runMigration();