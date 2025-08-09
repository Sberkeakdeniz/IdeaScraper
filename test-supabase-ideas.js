const { createClient } = require('@supabase/supabase-js');

async function testSupabaseIdeas() {
  console.log('Testing Supabase Ideas table...');
  
  const supabaseUrl = process.env.SUPABASE_URL || 'https://ubrpyhohhhsmjicorsfa.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicnB5aG9oaGhzbWppY29yc2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY3MjEwMCwiZXhwIjoyMDcwMjQ4MTAwfQ.N7jVJzE3BxTwAWauKmxoeos7SXsXoXZtH3qYJi3TA3o';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test counting ideas
    const { data: countData, error: countError } = await supabase
      .from('business_ideas')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Error counting ideas:', countError);
    } else {
      console.log('✅ Ideas count successful:', countData.length);
    }
    
    // Test fetching a few ideas
    const { data: ideasData, error: ideasError } = await supabase
      .from('business_ideas')
      .select('*')
      .limit(2);
    
    if (ideasError) {
      console.error('❌ Error fetching ideas:', ideasError);
    } else {
      console.log('✅ Ideas fetch successful:', ideasData.length, 'ideas retrieved');
      if (ideasData.length > 0) {
        console.log('Sample idea:', ideasData[0].title);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testSupabaseIdeas();