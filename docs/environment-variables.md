# Environment Variables Guide

This document outlines all required environment variables for the idea scraper application.

## Reddit API Configuration

### Getting Reddit API Credentials

1. **Create a Reddit Account**
   - Go to [reddit.com](https://reddit.com) and create an account if you don't have one

2. **Create a Reddit App**
   - Navigate to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
   - Click "Create App" or "Create Another App"
   - Fill out the form:
     - **Name**: Your app name (e.g., "Idea Scraper")
     - **App type**: Select "script"
     - **Description**: Brief description of your app
     - **About URL**: Leave blank or add your project URL
     - **Redirect URI**: Use `http://localhost:8080` for development
   - Click "Create app"

3. **Get Your Credentials**
   - **Client ID**: Found under your app name (14-character string)
   - **Client Secret**: The "secret" field (27-character string)

### Required Reddit Environment Variables

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=YourApp/1.0 by /u/yourusername
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

### Reddit API Rate Limits
- **Unauthenticated**: 60 requests per minute
- **Authenticated**: 100 requests per minute
- **OAuth**: 60 requests per minute per OAuth client

## Database Configuration

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=idea_scraper
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```

## Application Configuration

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_SECRET=your_session_secret
```

## External APIs

### OpenAI API (for content analysis)
```bash
OPENAI_API_KEY=sk-your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

### Supabase (if using as backend)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### SendGrid (for email notifications)
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
```

## Monitoring and Analytics

### Sentry (Error Tracking)
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
```

### Google Analytics
```bash
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
```

## Development Tools

### Proxy Configuration (if needed)
```bash
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1
```

## Setting Up Environment Variables

### Local Development (.env file)
1. Create a `.env` file in your project root
2. Copy the variables you need from above
3. Replace placeholder values with your actual credentials
4. Add `.env` to your `.gitignore` file

### Production Deployment
- **Vercel**: Add variables in Project Settings > Environment Variables
- **Heroku**: Use `heroku config:set VARIABLE_NAME=value`
- **Docker**: Use `docker run -e VARIABLE_NAME=value`
- **Railway**: Add in Project Settings > Variables

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use different credentials for development/production**
3. **Rotate API keys regularly**
4. **Use environment-specific configurations**
5. **Limit API key permissions to minimum required**
6. **Monitor API usage and set up alerts**

## Validation

Add this to your application startup to validate required variables:

```javascript
const requiredVars = [
  'REDDIT_CLIENT_ID',
  'REDDIT_CLIENT_SECRET',
  'DATABASE_URL',
  'JWT_SECRET'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## Troubleshooting

### Reddit API Issues
- **401 Unauthorized**: Check client ID/secret and user credentials
- **403 Forbidden**: Verify user agent format and app permissions
- **429 Rate Limited**: Implement backoff strategy, check rate limits

### Database Connection Issues
- Verify connection string format
- Check network connectivity
- Ensure database server is running
- Validate credentials and database name

### Common Mistakes
- Wrong redirect URI in Reddit app settings
- Malformed user agent string
- Missing required scopes for API access
- Incorrect environment variable names