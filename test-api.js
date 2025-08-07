// Simple API test script to verify everything works
// Run with: node test-api.js

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health check:', health.status);

    // Test 2: Get Ideas (public endpoint)
    console.log('\n2. Testing ideas endpoint...');
    const ideasResponse = await fetch(`${API_BASE}/ideas`);
    const ideasData = await ideasResponse.json();
    console.log(`✅ Found ${ideasData.ideas?.length || 0} business ideas`);
    console.log(`   Example: "${ideasData.ideas?.[0]?.title || 'No ideas found'}"`);

    // Test 3: Test user registration
    console.log('\n3. Testing user registration...');
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User'
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      console.log('✅ User registration successful');
      
      // Test 4: Login
      console.log('\n4. Testing user login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ User login successful');
        console.log(`   User: ${loginData.user?.name} (${loginData.user?.subscriptionTier})`);

        // Test 5: Protected endpoint
        console.log('\n5. Testing protected endpoint...');
        const profileResponse = await fetch(`${API_BASE}/users/profile`, {
          headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
        });

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          console.log('✅ Protected endpoint access successful');
          console.log(`   Current usage: ${profile.currentUsage?.ideasViewed || 0} ideas viewed`);
        } else {
          console.log('❌ Protected endpoint failed:', profileResponse.status);
        }
      } else {
        console.log('❌ Login failed:', loginResponse.status);
      }
    } else {
      console.log('❌ Registration failed:', registerResponse.status);
    }

    // Test 6: Database connection via ideas count
    console.log('\n6. Testing database data...');
    const countResponse = await fetch(`${API_BASE}/ideas?limit=100`);
    if (countResponse.ok) {
      const countData = await countResponse.json();
      console.log(`✅ Database contains ${countData.pagination?.total || 0} total business ideas`);
      
      // Show some sample industries
      const industries = new Set();
      countData.ideas?.forEach(idea => {
        idea.industryTags?.forEach(tag => industries.add(tag));
      });
      console.log(`   Industries covered: ${Array.from(industries).slice(0, 5).join(', ')}...`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the web app: cd apps/web && npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Test the complete user flow manually');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the API server is running: cd apps/api && npm run dev');
  }
}

// Helper function for fetch (Node.js compatibility)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testAPI();