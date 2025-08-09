require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('_test_table_that_does_not_exist')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('✅ Connection successful! (Expected error: table does not exist)');
    } else if (error) {
      console.log('🔄 Connection successful but got error:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }

    // Try to create a simple table for testing
    console.log('\n🔄 Testing table creation...');
    
    // First, try to create the business_ideas table
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS business_ideas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          reddit_url TEXT UNIQUE,
          subreddit TEXT NOT NULL,
          upvotes INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.log('Table creation via RPC failed:', createError.message);
      console.log('This is normal - you need to create tables in Supabase dashboard');
    } else {
      console.log('✅ Table created successfully!');
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();