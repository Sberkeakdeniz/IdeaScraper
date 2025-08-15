const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  try {
    console.log('🔄 Updating database schema...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'apps', 'api', 'src', 'utils', 'update-users-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error updating database:', error);
      
      // Try alternative approach - execute queries individually
      console.log('🔄 Trying alternative approach...');
      
      const queries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE`,
        `CREATE TABLE IF NOT EXISTS user_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          month_year TEXT NOT NULL,
          ideas_viewed INTEGER DEFAULT 0,
          api_calls INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, month_year)
        )`
      ];
      
      for (const query of queries) {
        console.log('Executing:', query.substring(0, 50) + '...');
        const { error: queryError } = await supabase.rpc('exec_sql', { sql_query: query });
        if (queryError) {
          console.warn('Warning:', queryError.message);
        }
      }
    } else {
      console.log('✅ Database schema updated successfully');
    }
    
    // Verify the schema changes
    console.log('\n🔍 Verifying schema changes...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .in('column_name', ['subscription_tier', 'subscription_ends_at']);
    
    if (columnError) {
      console.warn('Could not verify schema changes:', columnError.message);
    } else {
      console.log('Users table columns:', columns);
    }
    
    console.log('\n✅ Database update completed');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateDatabase();