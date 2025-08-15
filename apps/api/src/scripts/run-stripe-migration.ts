import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { supabaseAdmin } from '../utils/supabase';

async function runStripeMigration() {
  console.log('🚀 Running Stripe migration...');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'stripe-migration.sql');
    const migrationSQL = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements (simple split on semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try alternative method for table creation
          console.log(`⚠️  RPC method failed, trying direct execution...`);
          console.log('Error:', error.message);
          
          // For some operations, we might need to use the REST API directly
          // This is a fallback - in production, run the SQL manually in dashboard
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.log(`⚠️  Error executing statement ${i + 1}:`, execError);
      }
    }

    // Test the migration by checking if new columns exist
    console.log('🔍 Verifying migration...');
    
    const { data: columnCheck, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_status')
      .limit(1);

    if (checkError) {
      console.log('❌ Migration verification failed:', checkError.message);
      console.log('\n📋 MANUAL MIGRATION REQUIRED:');
      console.log('Please run the SQL commands in stripe-migration.sql manually in your Supabase dashboard.');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the contents of stripe-migration.sql');
      console.log('5. Execute the query');
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('✅ New Stripe fields are available in the users table');
    }

  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.log('\n📋 MANUAL MIGRATION REQUIRED:');
    console.log('Please run the SQL commands in stripe-migration.sql manually in your Supabase dashboard.');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runStripeMigration();
}

export { runStripeMigration };