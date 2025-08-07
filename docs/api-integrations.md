# API Integrations Guide

This document covers all external API integrations for the idea scraper application.

## Social Media APIs

### X (Twitter) API v2

#### Setup Process
1. Apply for Twitter Developer Account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new App in the Developer Portal
3. Generate API keys and bearer token

#### Environment Variables
```bash
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
```

#### Rate Limits
- **Essential Access**: 500k tweets/month
- **Elevated Access**: 2M tweets/month
- **Academic Research**: 10M tweets/month

#### Usage Example
```javascript
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Search for startup ideas
const tweets = await twitterClient.v2.search('#startupidea', {
  max_results: 100,
  'tweet.fields': 'created_at,author_id,public_metrics'
});
```

### LinkedIn API

#### Setup Process
1. Create LinkedIn App at [developer.linkedin.com](https://developer.linkedin.com)
2. Request access to LinkedIn API
3. Get client credentials

#### Environment Variables
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

### Hacker News API

#### No Authentication Required
```bash
# Optional: For caching and rate limiting
HACKERNEWS_API_BASE=https://hacker-news.firebaseio.com/v0
```

#### Usage Example
```javascript
const axios = require('axios');

// Get top stories
const topStories = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
const storyIds = topStories.data.slice(0, 30);

// Get story details
const stories = await Promise.all(
  storyIds.map(id => 
    axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
  )
);
```

## AI/ML APIs

### OpenAI API

#### Setup Process
1. Create account at [platform.openai.com](https://platform.openai.com)
2. Generate API key in API Keys section
3. Add billing information

#### Environment Variables
```bash
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_ORG_ID=org-your_organization_id
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

#### Usage for Idea Analysis
```javascript
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeIdea(ideaText) {
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [{
      role: "system",
      content: "Analyze this business idea and provide insights on feasibility, market potential, and innovation level."
    }, {
      role: "user",
      content: ideaText
    }],
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE),
  });

  return completion.choices[0].message.content;
}
```

### Anthropic Claude API

#### Setup Process
1. Get access at [console.anthropic.com](https://console.anthropic.com)
2. Generate API key
3. Review rate limits and pricing

#### Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-your_api_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=1000
```

### Cohere API

#### Setup Process
1. Sign up at [cohere.ai](https://cohere.ai)
2. Get API key from dashboard

#### Environment Variables
```bash
COHERE_API_KEY=your_cohere_api_key
COHERE_MODEL=command-nightly
```

## Database Services

### Supabase

#### Setup Process
1. Create project at [supabase.com](https://supabase.com)
2. Get project URL and API keys
3. Set up database schema

#### Environment Variables
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Firebase

#### Setup Process
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate service account key

#### Environment Variables
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### MongoDB Atlas

#### Setup Process
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Get connection string

#### Environment Variables
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB_NAME=idea_scraper
```

## Notification Services

### SendGrid (Email)

#### Setup Process
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify sender identity
3. Generate API key

#### Environment Variables
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Idea Scraper
```

### Twilio (SMS)

#### Setup Process
1. Create account at [twilio.com](https://twilio.com)
2. Get phone number
3. Get Account SID and Auth Token

#### Environment Variables
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Discord Webhooks

#### Setup Process
1. Create Discord server
2. Create webhook in channel settings
3. Copy webhook URL

#### Environment Variables
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
DISCORD_BOT_NAME=Idea Scraper Bot
```

## Analytics & Monitoring

### Google Analytics 4

#### Setup Process
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID
3. Optionally set up Google Analytics Reporting API

#### Environment Variables
```bash
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_CREDENTIALS=path/to/service-account.json
```

### Sentry (Error Tracking)

#### Setup Process
1. Create project at [sentry.io](https://sentry.io)
2. Get DSN from project settings

#### Environment Variables
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
```

### LogRocket

#### Setup Process
1. Create account at [logrocket.com](https://logrocket.com)
2. Get App ID from dashboard

#### Environment Variables
```bash
LOGROCKET_APP_ID=your_app_id
```

## Search & Analysis APIs

### Algolia Search

#### Setup Process
1. Create account at [algolia.com](https://algolia.com)
2. Create search index
3. Get Application ID and API keys

#### Environment Variables
```bash
ALGOLIA_APPLICATION_ID=your_app_id
ALGOLIA_API_KEY=your_api_key
ALGOLIA_SEARCH_KEY=your_search_only_key
ALGOLIA_INDEX_NAME=ideas
```

### Elasticsearch

#### Setup Process
1. Set up Elasticsearch cluster (Elastic Cloud or self-hosted)
2. Create index for ideas
3. Get connection credentials

#### Environment Variables
```bash
ELASTICSEARCH_URL=https://your-cluster.es.region.cloud.es.io
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password
ELASTICSEARCH_INDEX=ideas
```

## Web Scraping Services

### ScrapingBee

#### Setup Process
1. Create account at [scrapingbee.com](https://scrapingbee.com)
2. Get API key from dashboard

#### Environment Variables
```bash
SCRAPINGBEE_API_KEY=your_api_key
```

### Bright Data (formerly Luminati)

#### Environment Variables
```bash
BRIGHTDATA_USERNAME=your_username
BRIGHTDATA_PASSWORD=your_password
BRIGHTDATA_ENDPOINT=zproxy.lum-superproxy.io
BRIGHTDATA_PORT=22225
```

## Authentication Services

### Auth0

#### Setup Process
1. Create account at [auth0.com](https://auth0.com)
2. Create application
3. Configure callback URLs

#### Environment Variables
```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_CALLBACK_URL=http://localhost:3000/callback
```

### Clerk

#### Setup Process
1. Create account at [clerk.dev](https://clerk.dev)
2. Create application
3. Get API keys

#### Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
```

## Payment Processing

### Stripe

#### Setup Process
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from dashboard
3. Set up webhooks

#### Environment Variables
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## File Storage

### AWS S3

#### Setup Process
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions

#### Environment Variables
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Cloudinary

#### Setup Process
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get cloud name and API credentials

#### Environment Variables
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Rate Limiting & Caching

### Redis

#### Setup Process
1. Set up Redis instance (local, Redis Cloud, or AWS ElastiCache)
2. Get connection URL

#### Environment Variables
```bash
REDIS_URL=redis://username:password@host:port
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

## API Key Management Best Practices

### 1. Environment-Specific Keys
```bash
# Development
OPENAI_API_KEY=sk-dev-your_dev_key

# Production  
OPENAI_API_KEY=sk-prod-your_prod_key
```

### 2. Key Rotation Schedule
- Monthly: High-risk keys (production database, payment processing)
- Quarterly: Medium-risk keys (AI APIs, analytics)
- Annually: Low-risk keys (development tools, monitoring)

### 3. Usage Monitoring
```javascript
// Track API usage
const apiUsage = {
  openai: { daily: 0, monthly: 0, limit: 10000 },
  reddit: { daily: 0, monthly: 0, limit: 100000 },
  twitter: { daily: 0, monthly: 0, limit: 500000 }
};

function trackAPICall(service) {
  apiUsage[service].daily += 1;
  apiUsage[service].monthly += 1;
  
  if (apiUsage[service].monthly > apiUsage[service].limit * 0.8) {
    console.warn(`Warning: ${service} API usage at 80% of monthly limit`);
  }
}
```

### 4. Error Handling Template
```javascript
class APIError extends Error {
  constructor(service, statusCode, message) {
    super(`${service} API Error: ${message}`);
    this.service = service;
    this.statusCode = statusCode;
  }
}

async function handleAPICall(service, apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limited - implement backoff
      await delay(60000); // Wait 1 minute
      return handleAPICall(service, apiCall);
    }
    throw new APIError(service, error.response?.status, error.message);
  }
}
```

## Testing API Integrations

Create test scripts for each service:

```javascript
// tests/api-integrations.test.js
const testRedditAPI = require('./test-reddit');
const testOpenAI = require('./test-openai');
const testDatabase = require('./test-database');

async function runAPITests() {
  const results = {};
  
  try {
    results.reddit = await testRedditAPI();
    results.openai = await testOpenAI();
    results.database = await testDatabase();
    
    console.log('API Integration Test Results:', results);
  } catch (error) {
    console.error('API tests failed:', error);
  }
}

runAPITests();
```

This comprehensive guide should help you set up and manage all the necessary API integrations for your idea scraper application.