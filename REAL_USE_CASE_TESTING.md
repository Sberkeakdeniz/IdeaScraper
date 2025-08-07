# Real Use Case Testing Guide

This guide provides comprehensive instructions for testing the Idea Scraper application in real-world scenarios, from local development to production deployment.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Docker Desktop installed and running
- Git installed
- A code editor (VS Code recommended)

## 🚀 Quick Start: Local Development Setup

### 1. Environment Setup

```bash
# Clone and navigate to project
git clone <your-repo-url>
cd idea-scraper

# Copy environment configuration
cp .env.development .env

# Install dependencies
npm install
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Wait for services to be ready (check with)
docker-compose logs postgres redis
```

### 3. Initialize Database

```bash
# Run Prisma migrations
cd packages/database
npx prisma migrate dev --name init

# Seed database with test data
npm run db:seed

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Start All Services

```bash
# From project root, start all services
cd ../..

# Start API (Terminal 1)
cd apps/api && npm run dev

# Start Web App (Terminal 2)
cd apps/web && npm run dev

# Optional: Start Scraper (Terminal 3)
cd apps/scraper && python src/main.py
```

## 🧪 Complete User Journey Testing

### Test Scenario 1: New User Registration & First Experience

**Objective**: Test the complete new user onboarding flow

**Steps**:
1. **Open Application**: Navigate to `http://localhost:3000`
2. **Register New Account**:
   - Click "Get Started" or "Register"
   - Use: `test@example.com` / `Password123!`
   - Verify email validation works
3. **First Login**:
   - Login with credentials
   - Should see onboarding flow or dashboard
4. **Browse Ideas**:
   - Should see paginated list of business ideas
   - Test filtering by industry
   - Test search functionality
5. **Free Tier Limitations**:
   - Try to view more than 20 ideas (should hit limit)
   - Check upgrade prompts appear

**Expected Results**:
- ✅ Registration succeeds with valid data
- ✅ Login works correctly
- ✅ Ideas load with proper pagination
- ✅ Free tier limits are enforced
- ✅ Security headers present in responses

### Test Scenario 2: Premium User Experience

**Objective**: Test premium user features and subscription flow

**Steps**:
1. **Login as Premium User**:
   - Use: `john@example.com` / `password123`
2. **Premium Features**:
   - Browse unlimited ideas
   - Bookmark multiple ideas (should work)
   - Access advanced filtering
   - View detailed analytics
3. **Subscription Management**:
   - Navigate to account settings
   - View subscription status
   - Check usage metrics
4. **Data Export** (if implemented):
   - Export bookmarked ideas
   - Verify data format and completeness

**Expected Results**:
- ✅ No usage limitations
- ✅ All premium features accessible
- ✅ Subscription status displayed correctly
- ✅ Usage analytics show real data

### Test Scenario 3: Enterprise User & Advanced Features

**Objective**: Test enterprise-level features and bulk operations

**Steps**:
1. **Login as Enterprise User**:
   - Use: `alex@example.com` / `password123`
2. **Bulk Operations**:
   - Bookmark 20+ ideas rapidly
   - Test bulk export functionality
   - Use advanced search with multiple filters
3. **API Usage**:
   - Check API rate limits are higher
   - Test webhook integrations (if implemented)
4. **Analytics Dashboard**:
   - View detailed usage statistics
   - Check multi-month data display
   - Verify trend analysis

**Expected Results**:
- ✅ Enterprise features fully functional
- ✅ Higher rate limits applied
- ✅ Advanced analytics available
- ✅ Bulk operations perform well

### Test Scenario 4: Payment & Subscription Flow (with Polar.sh)

**Objective**: Test the complete payment and subscription management

**Prerequisites**: 
- Set up test Polar.sh account
- Configure webhook URL: `http://localhost:3001/api/subscriptions/webhook`

**Steps**:
1. **Upgrade from Free to Premium**:
   - Login as `jane@example.com`
   - Click upgrade to premium
   - Use Polar.sh test payment method
   - Complete payment flow
2. **Webhook Testing**:
   - Verify webhook received in logs
   - Check user subscription updated
   - Confirm premium features unlocked
3. **Subscription Management**:
   - Test downgrade flow
   - Test subscription cancellation
   - Verify prorated billing (if applicable)
4. **Edge Cases**:
   - Test failed payment scenarios
   - Test webhook retry logic
   - Test subscription expiration

**Expected Results**:
- ✅ Payment flow completes successfully
- ✅ Webhooks process correctly
- ✅ User subscription status updates
- ✅ Features enabled/disabled appropriately

## 🔐 Security Testing

### Authentication & Authorization Testing

```bash
# Test API endpoints without authentication
curl http://localhost:3001/api/ideas/bookmarked
# Should return 401 Unauthorized

# Test with valid token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/ideas/bookmarked
# Should return bookmarked ideas

# Test rate limiting
for i in {1..200}; do 
  curl http://localhost:3001/api/ideas
done
# Should hit rate limit after 100 requests
```

### Input Validation Testing

```bash
# Test SQL injection attempts
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com'\''DROP TABLE users;--","password":"test"}'

# Test XSS attempts
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test","name":"<script>alert(1)</script>"}'

# Test malformed requests
curl -X POST http://localhost:3001/api/ideas \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

### Webhook Security Testing

```bash
# Test webhook without signature
curl -X POST http://localhost:3001/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"subscription.created","data":{"user_id":"test"}}'
# Should fail with 401

# Test webhook with invalid signature
curl -X POST http://localhost:3001/api/subscriptions/webhook \
  -H "Content-Type: application/json" \
  -H "polar-webhook-signature: invalid_signature" \
  -d '{"type":"subscription.created","data":{"user_id":"test"}}'
# Should fail with validation error
```

## ⚡ Performance Testing

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
cat > artillery-config.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse ideas"
    requests:
      - get:
          url: "/api/ideas"
      - get:
          url: "/api/ideas?page=2"
      - get:
          url: "/api/ideas?search=AI"
EOF

# Run load test
artillery run artillery-config.yml
```

### Database Performance Testing

```sql
-- Run these queries in Prisma Studio or psql
-- Test query performance on business ideas
EXPLAIN ANALYZE SELECT * FROM business_ideas 
WHERE industry_tags && ARRAY['Technology'] 
ORDER BY overall_score DESC 
LIMIT 20;

-- Test user interaction queries
EXPLAIN ANALYZE SELECT bi.* FROM business_ideas bi
JOIN user_idea_interactions uii ON bi.id = uii.idea_id
WHERE uii.user_id = 'user_id_here' AND uii.interaction_type = 'bookmark'
ORDER BY uii.created_at DESC;
```

## 📊 Monitoring & Logging

### Application Health Checks

```bash
# API Health Check
curl http://localhost:3001/health
# Expected: {"status":"OK","timestamp":"...","services":{"database":"healthy","redis":"healthy"}}

# Database Connection Test
curl http://localhost:3001/api/ideas?limit=1
# Should return one business idea

# Redis Connection Test (check logs)
# Look for Redis connection messages in API logs
```

### Log Analysis

```bash
# Monitor API logs in real-time
tail -f apps/api/logs/combined.log

# Monitor error logs
tail -f apps/api/logs/error.log

# Check for security events
grep -i "security\|auth\|webhook" apps/api/logs/combined.log
```

## 🔧 Debugging Common Issues

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test database connection
docker exec -it reddit_idea_finder_db psql -U postgres -d reddit_idea_finder -c "SELECT version();"

# Reset database if needed
cd packages/database
npx prisma migrate reset
npm run db:seed
```

### API Issues

```bash
# Check API logs
docker logs reddit_idea_finder_api

# Test API endpoints
curl -v http://localhost:3001/health

# Restart API service
docker-compose restart api
```

### Frontend Issues

```bash
# Check Next.js build
cd apps/web
npm run build

# Check for TypeScript errors
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run dev
```

## 🌐 Production-Like Testing

### Using Docker Compose Production Setup

```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Start production stack
docker-compose -f docker-compose.production.yml up -d

# Run production health checks
curl http://localhost/health
curl https://localhost/api/ideas
```

### Environment Variable Testing

```bash
# Test with production environment (without real secrets)
cp .env.production.template .env.production

# Update with test values
# Then test application startup
docker-compose -f docker-compose.production.yml up
```

## 📝 Test Checklists

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Seed data loads correctly
- [ ] API endpoints respond correctly
- [ ] Authentication flow works end-to-end
- [ ] Payment webhook processing works
- [ ] Rate limiting functions properly
- [ ] Security headers present
- [ ] Error handling works correctly
- [ ] Logging captures important events

### User Acceptance Testing Checklist

- [ ] User can register and login
- [ ] Ideas display with proper pagination
- [ ] Search and filtering work correctly
- [ ] Bookmarking functions properly
- [ ] Subscription upgrade flow works
- [ ] Payment processing completes
- [ ] Account management functions work
- [ ] Data export works (if implemented)
- [ ] Mobile responsiveness verified
- [ ] Performance meets requirements

### Security Testing Checklist

- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Authentication required for protected routes
- [ ] Authorization levels enforced
- [ ] Rate limiting prevents abuse
- [ ] Webhook signatures verified
- [ ] Sensitive data not logged
- [ ] HTTPS enforced in production
- [ ] Security headers present
- [ ] Input validation comprehensive

## 🚨 Emergency Procedures

### Quick Recovery Steps

```bash
# If database is corrupted
docker-compose down
docker volume rm reddit_idea_finder_postgres_data
docker-compose up -d postgres
cd packages/database && npm run db:seed

# If Redis cache issues
docker exec -it reddit_idea_finder_redis redis-cli FLUSHALL

# If complete reset needed
docker-compose down
docker system prune -f
docker-compose up -d
```

### Contact & Support

- **Database Issues**: Check logs first, then restart services
- **Payment Issues**: Verify Polar.sh webhook configuration
- **Security Concerns**: Review authentication tokens and rate limits
- **Performance Issues**: Check database indexes and Redis cache

---

## 🎯 Success Metrics

Your application is ready for production when:
- ✅ All test scenarios pass consistently
- ✅ Performance meets requirements (< 2s page load)
- ✅ Security tests show no vulnerabilities
- ✅ Payment flow works end-to-end
- ✅ Monitoring and logging capture all events
- ✅ Error handling is graceful and informative

This comprehensive testing approach ensures your application is robust, secure, and ready for real users!