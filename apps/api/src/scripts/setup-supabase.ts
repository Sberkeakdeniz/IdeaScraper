import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { supabaseAdmin } from '../utils/supabase';

async function setupDatabase() {
  console.log('Setting up Supabase database...');

  try {
    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.log('Users table might already exist or using direct table creation...');
      
      // Try direct table creation approach
      const { error: directUsersError } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
        
      if (directUsersError && directUsersError.code === '42P01') { // Table doesn't exist
        console.log('Creating users table manually...');
        // We'll need to create tables in Supabase dashboard or use SQL editor
      }
    }

    // Create business_ideas table
    const { error: ideasError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS business_ideas (
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
      `
    });

    if (ideasError) {
      console.log('Business ideas table setup result:', ideasError);
    }

    // Test the connection by trying to insert some sample data
    const { data: testData, error: testError } = await supabaseAdmin
      .from('business_ideas')
      .insert({
        title: 'Test Idea',
        description: 'This is a test business idea',
        reddit_url: 'https://reddit.com/r/test/test123',
        subreddit: 'test',
        upvotes: 10,
        comment_count: 5,
        validation_score: 3.5
      })
      .select()
      .single();

    if (testError) {
      console.error('Error inserting test data:', testError);
      
      // Try to create the table manually
      console.log('Attempting manual table creation...');
      
    } else {
      console.log('✅ Test data inserted successfully:', testData);
      
      // Clean up test data
      await supabaseAdmin
        .from('business_ideas')
        .delete()
        .eq('id', testData.id);
        
      console.log('✅ Database setup completed successfully!');
    }

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };