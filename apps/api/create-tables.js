require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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

async function createTables() {
  console.log('🔄 Creating tables in Supabase...');

  // Since we can't use execute_sql, let's try to test if tables exist by querying them
  
  // Test business_ideas table
  console.log('\n🔄 Testing business_ideas table...');
  const { data: ideas, error: ideasError } = await supabase
    .from('business_ideas')
    .select('*')
    .limit(1);
    
  if (ideasError) {
    console.log('❌ business_ideas table does not exist:', ideasError.message);
    console.log('📝 You need to create this table in Supabase dashboard with this SQL:');
    console.log(`
CREATE TABLE business_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reddit_url TEXT UNIQUE NOT NULL,
  subreddit TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  market_size TEXT,
  target_audience TEXT,
  monetization_strategy TEXT,
  competitor_analysis TEXT,
  validation_score DECIMAL,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);
  } else {
    console.log('✅ business_ideas table exists!');
  }

  // Test users table
  console.log('\n🔄 Testing users table...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (usersError) {
    console.log('❌ users table does not exist:', usersError.message);
    console.log('📝 You need to create this table in Supabase dashboard with this SQL:');
    console.log(`
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);
  } else {
    console.log('✅ users table exists!');
  }
  
  console.log('\n📋 Summary: Please create the missing tables in your Supabase dashboard');
  console.log('1. Go to https://ubrpyhohhhsmjicorsfa.supabase.co');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run the SQL commands shown above');
}

createTables();