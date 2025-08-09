# Supabase Database Schema Update Required

## Step 1: Run these SQL commands in your Supabase SQL editor

Go to your Supabase dashboard → SQL Editor → New query, and run:

```sql
-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;

-- Create user_usage table for tracking usage limits  
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  ideas_viewed INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Create index for user_usage
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month_year);

-- Enable RLS for user_usage  
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for user_usage
CREATE POLICY "Users can manage their own usage" ON user_usage
  FOR ALL USING (auth.uid()::text = user_id::text);
```

## Step 2: Verify the update

After running the SQL, verify by running this query:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_tier', 'subscription_ends_at');
```

You should see:
- subscription_tier | text | YES
- subscription_ends_at | timestamp with time zone | YES

## Alternative: Quick Test Script

You can also run this Node.js script after updating the schema:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
    .from('users') 
    .select('id, email, subscription_tier, subscription_ends_at')
    .limit(1);
    
  if (error) {
    console.log('❌ Schema not updated:', error.message);
  } else {
    console.log('✅ Schema updated successfully');
  }
}

test();
```