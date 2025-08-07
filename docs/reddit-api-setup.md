# Reddit API Setup Guide

Complete step-by-step guide for setting up Reddit API access for idea scraping.

## Prerequisites

- Reddit account
- Basic understanding of API authentication
- Node.js development environment

## Step-by-Step Setup

### 1. Create Reddit Application

#### Navigate to Reddit Apps Page
1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Log in with your Reddit account
3. Scroll down to "Developed Applications"

#### Create New Application
1. Click **"Create App"** or **"Create Another App"**
2. Fill out the application form:

```
Name: Idea Scraper Bot
App type: ⚫ script (select this option)
Description: Automated tool for scraping innovative ideas from Reddit
About URL: (leave blank or add your GitHub repo)
Redirect URI: http://localhost:8080
```

3. Click **"Create app"**

### 2. Gather Credentials

After creating the app, you'll see:

```
Personal Use Script
Idea Scraper Bot
[14-character string] ← This is your CLIENT_ID
secret: [27-character string] ← This is your CLIENT_SECRET
```

### 3. Environment Variable Setup

Create a `.env` file in your project root:

```bash
# Reddit API Credentials
REDDIT_CLIENT_ID=your_14_character_client_id
REDDIT_CLIENT_SECRET=your_27_character_client_secret
REDDIT_USER_AGENT=IdeaScraper/1.0 by /u/your_reddit_username
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

### 4. Authentication Methods

#### Option A: Script Application (Recommended)
Best for personal/development use:

```javascript
const snoowrap = require('snoowrap');

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});
```

#### Option B: OAuth2 Application
For production/public applications:

```javascript
// Step 1: Get authorization URL
const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&duration=permanent&scope=read`;

// Step 2: Exchange code for token (after user authorization)
const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${clientId}:`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: redirectUri
  })
});
```

### 5. Test Your Setup

Create a test script to verify your credentials:

```javascript
// test-reddit-api.js
require('dotenv').config();
const snoowrap = require('snoowrap');

async function testRedditAPI() {
  try {
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT,
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD
    });

    // Test: Get user info
    const me = await reddit.getMe();
    console.log(`✅ Successfully authenticated as: ${me.name}`);

    // Test: Get a subreddit
    const subreddit = await reddit.getSubreddit('javascript');
    console.log(`✅ Successfully accessed subreddit: r/${subreddit.display_name}`);

    // Test: Get hot posts
    const hotPosts = await subreddit.getHot({ limit: 5 });
    console.log(`✅ Successfully fetched ${hotPosts.length} hot posts`);
    
    hotPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
    });

  } catch (error) {
    console.error('❌ Reddit API test failed:', error.message);
  }
}

testRedditAPI();
```

Run the test:
```bash
node test-reddit-api.js
```

### 6. Understanding Reddit API Scopes

Different scopes provide different permissions:

| Scope | Description | Required for Idea Scraping |
|-------|-------------|---------------------------|
| `read` | Read posts and comments | ✅ Yes |
| `identity` | Access account info | ❌ Optional |
| `submit` | Submit posts/comments | ❌ No |
| `edit` | Edit posts/comments | ❌ No |
| `vote` | Upvote/downvote | ❌ No |
| `save` | Save/unsave posts | ❌ Optional |

For idea scraping, you typically only need `read` scope.

### 7. Rate Limiting Best Practices

Reddit API has strict rate limits:

```javascript
// Implement rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class RedditScraper {
  constructor(reddit) {
    this.reddit = reddit;
    this.lastRequest = 0;
    this.minInterval = 1000; // 1 second between requests
  }

  async makeRequest(requestFn) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      await delay(this.minInterval - timeSinceLastRequest);
    }
    
    this.lastRequest = Date.now();
    return await requestFn();
  }
}
```

### 8. Common API Endpoints for Idea Scraping

```javascript
// Get hot posts from a subreddit
const hotPosts = await reddit.getSubreddit('startups').getHot({ limit: 25 });

// Get new posts
const newPosts = await reddit.getSubreddit('entrepreneur').getNew({ limit: 25 });

// Get top posts from a time period
const topPosts = await reddit.getSubreddit('business').getTop({ 
  time: 'week', 
  limit: 50 
});

// Search for specific topics
const searchResults = await reddit.search({
  query: 'innovative startup ideas',
  subreddit: 'startups',
  sort: 'relevance',
  time: 'month',
  limit: 100
});

// Get comments from a post
const comments = await reddit.getSubmission('post_id').comments;
```

### 9. Error Handling

Common errors and solutions:

```javascript
try {
  const posts = await reddit.getSubreddit('startups').getHot();
} catch (error) {
  switch (error.statusCode) {
    case 401:
      console.error('Authentication failed - check credentials');
      break;
    case 403:
      console.error('Forbidden - check permissions/rate limits');
      break;
    case 429:
      console.error('Rate limited - implement backoff strategy');
      break;
    case 404:
      console.error('Subreddit not found');
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
}
```

### 10. Best Practices

1. **Respect Rate Limits**
   - Max 60 requests per minute
   - Add delays between requests
   - Implement exponential backoff for errors

2. **Use Appropriate User Agent**
   - Format: `AppName/Version by /u/username`
   - Be descriptive and include contact info

3. **Handle Errors Gracefully**
   - Implement retry logic
   - Log errors for debugging
   - Don't crash on single request failures

4. **Be Respectful**
   - Don't scrape too aggressively
   - Follow subreddit rules
   - Consider contacting moderators for large scraping operations

5. **Data Storage**
   - Store API responses to avoid re-fetching
   - Implement caching mechanisms
   - Respect data retention policies

### 11. Subreddits for Idea Scraping

Recommended subreddits for innovative ideas:

```javascript
const ideaSubreddits = [
  'startups',
  'entrepreneur',
  'business',
  'SomebodyMakeThis',
  'CrazyIdeas',
  'Lightbulb',
  'AppIdeas',
  'Innovation',
  'futurology',
  'technology'
];
```

## Next Steps

1. Install required packages: `npm install snoowrap dotenv`
2. Set up your environment variables
3. Run the test script to verify your setup
4. Start building your idea scraping logic
5. Implement proper error handling and rate limiting

## Security Notes

- Never commit your `.env` file to version control
- Use different credentials for development and production
- Regularly rotate your API credentials
- Monitor your API usage in Reddit preferences