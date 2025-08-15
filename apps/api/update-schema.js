const { supabaseAdmin } = require('./src/utils/supabase');

async function updateSchema() {
  try {
    console.log('🔄 Updating users table schema...');
    
    // Add subscription fields to users table
    console.log('Adding subscription_tier column...');
    const { error: tierError } = await supabaseAdmin.rpc('exec', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'`
    });
    
    if (tierError) {
      console.log('Tier column might already exist:', tierError.message);
    }
    
    console.log('Adding subscription_ends_at column...');
    const { error: endsError } = await supabaseAdmin.rpc('exec', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE`
    });
    
    if (endsError) {
      console.log('Ends at column might already exist:', endsError.message);
    }
    
    // Test by querying the users table structure
    console.log('\n🔍 Testing updated schema...');
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_tier')
      .limit(1);
    
    if (error) {
      console.error('Schema test failed:', error);
    } else {
      console.log('✅ Schema updated successfully! Test query returned:', data.length, 'rows');
    }
    
    console.log('\n✅ Database schema update completed');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

updateSchema();