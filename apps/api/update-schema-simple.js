const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateSchema() {
  try {
    console.log('🔄 Checking and updating users table schema...');
    
    // Try to select a user with subscription fields to see if they exist
    console.log('Testing current schema...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_tier, subscription_ends_at')
      .limit(1);
    
    if (testError && testError.message.includes('column "subscription_tier" does not exist')) {
      console.log('❌ Subscription fields missing, manual database update needed');
      console.log('\nPlease run these SQL commands in your Supabase SQL editor:');
      console.log('----------------------------------------');
      console.log('ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT \'free\';');
      console.log('ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE;');
      console.log('----------------------------------------');
    } else if (testError) {
      console.error('❌ Other database error:', testError);
    } else {
      console.log('✅ Subscription fields already exist in the database');
      console.log('Schema is ready for payment testing');
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

updateSchema();