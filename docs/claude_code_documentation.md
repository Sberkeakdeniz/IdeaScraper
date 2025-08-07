# Claude Code CLI Implementation Guide - Reddit Business Idea Finder

## Project Overview
This document provides comprehensive guidance for Claude Code CLI to autonomously implement a Reddit-based business idea finder targeting soloentrepreneurs. The system will scrape Reddit discussions, analyze them using AI, and present curated business opportunities through a modern web application.

## Architecture Overview

```
reddit-idea-finder/
├── apps/
│   ├── web/                    # Next.js frontend application
│   ├── api/                    # Express.js backend API
│   └── scraper/                # Python scraping service
├── packages/
│   ├── ui/                     # Shared React components
│   ├── database/               # Prisma schema and utilities
│   ├── shared/                 # Shared TypeScript types
│   └── config/                 # Shared configuration
├── docs/
└── deployment/
```

## Technology Stack Specifications

### Frontend (apps/web)
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for client state, React Query for server state
- **Authentication**: NextAuth.js with JWT
- **Type Safety**: TypeScript throughout
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for micro-interactions

### Backend (apps/api)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Caching**: Redis for session and data caching
- **Job Queue**: Bull MQ for background tasks
- **API Documentation**: OpenAPI/Swagger
- **Rate Limiting**: express-rate-limit with Redis store

### Scraper Service (apps/scraper)
- **Language**: Python 3.11+
- **Reddit API**: PRAW (Python Reddit API Wrapper)
- **AI Analysis**: OpenAI GPT-4 API
- **Text Processing**: spaCy, NLTK
- **Sentiment Analysis**: TextBlob or VADER
- **Job Scheduling**: APScheduler
- **Data Pipeline**: Pandas for data processing

### Infrastructure
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Message Queue**: Redis (Bull MQ)
- **File Storage**: AWS S3 or similar
- **Monitoring**: Sentry for error tracking
- **Logging**: Winston (Node.js), Python logging

## Database Schema Design

### Core Tables
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Business Ideas table
CREATE TABLE business_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    source_url VARCHAR(1000),
    source_subreddit VARCHAR(100),
    reddit_post_id VARCHAR(50),
    industry_tags TEXT[],
    difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 5),
    market_potential_score INTEGER CHECK (market_potential_score BETWEEN 1 AND 5),
    competition_score INTEGER CHECK (competition_score BETWEEN 1 AND 5),
    overall_score DECIMAL(3,2),
    sentiment_score DECIMAL(3,2),
    upvotes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User interactions
CREATE TABLE user_idea_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES business_ideas(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50), -- 'bookmark', 'like', 'view', 'dismiss'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, idea_id, interaction_type)
);

-- Subscriptions and usage tracking
CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month_year VARCHAR(7), -- Format: 'YYYY-MM'
    ideas_viewed INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);
```

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
1. **Project Setup**
   - Initialize monorepo with proper workspace configuration
   - Set up TypeScript, ESLint, Prettier across all apps
   - Configure database with Prisma migrations
   - Set up basic CI/CD pipeline

2. **Authentication System**
   - Implement JWT-based auth with refresh tokens
   - Create protected routes middleware
   - Build login, register, password reset flows
   - Add email verification system

3. **Basic API Structure**
   - Create RESTful API endpoints for users and ideas
   - Implement proper error handling and validation
   - Add API rate limiting and security headers
   - Set up database connection pooling

### Phase 2: Core Functionality (Weeks 3-4)
1. **Reddit Scraping Service**
   - Set up Python environment with PRAW
   - Create subreddit monitoring system
   - Implement post filtering and relevance scoring
   - Add comment analysis for deeper insights

2. **AI Analysis Pipeline**
   - Integrate OpenAI GPT-4 for idea extraction
   - Build prompt engineering for business opportunity detection
   - Implement sentiment analysis and scoring
   - Create data validation and quality checks

3. **Frontend Dashboard**
   - Build responsive dashboard layout
   - Create idea cards with rich metadata
   - Implement filtering and search functionality
   - Add infinite scroll for performance

### Phase 3: Advanced Features (Weeks 5-6)
1. **Subscription System**
   - Integrate payment processing (Stripe)
   - Implement usage tracking and limits
   - Create subscription management interface
   - Add billing and invoice generation

2. **Enhanced User Experience**
   - Build idea bookmarking system
   - Create email notification system
   - Add export functionality (PDF/CSV)
   - Implement user preferences and settings

## Detailed Implementation Instructions

### Frontend Implementation (apps/web)

#### Project Structure
```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── pricing/
│   ├── api/
│   │   └── auth/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard/
│   │   ├── IdeaCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── SearchBar.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── Pricing.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── auth.ts
│   ├── api.ts
│   ├── utils.ts
│   └── validations.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useIdeas.ts
│   └── useFilters.ts
└── types/
    ├── auth.ts
    ├── ideas.ts
    └── api.ts
```

#### Key Components Implementation

**IdeaCard Component:**
```typescript
interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  sourceSubreddit: string;
  industryTags: string[];
  difficultyScore: number;
  marketPotentialScore: number;
  overallScore: number;
  upvotes: number;
  commentsCount: number;
  createdAt: string;
  isBookmarked?: boolean;
}

// Implement with Tailwind styling, bookmark functionality, and action buttons
```

**Dashboard Data Flow:**
```typescript
// Use React Query for server state management
const { data: ideas, isLoading, error } = useQuery({
  queryKey: ['ideas', filters],
  queryFn: () => api.getIdeas(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Implement optimistic updates for bookmarking
const bookmarkMutation = useMutation({
  mutationFn: api.bookmarkIdea,
  onMutate: async (ideaId) => {
    // Optimistic update logic
  },
});
```

### Backend Implementation (apps/api)

#### API Structure
```
apps/api/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── ideas.ts         # Business ideas CRUD
│   │   ├── users.ts         # User management
│   │   └── subscriptions.ts # Billing and subscriptions
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── IdeasController.ts
│   │   └── UserController.ts
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification
│   │   ├── rateLimiting.ts  # Rate limiting logic
│   │   ├── validation.ts    # Request validation
│   │   └── subscription.ts  # Usage limit checks
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── IdeasService.ts
│   │   ├── EmailService.ts
│   │   └── PaymentService.ts
│   ├── utils/
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   ├── cache.ts
│   │   └── validators.ts
│   └── types/
│       ├── express.d.ts
│       ├── auth.ts
│       └── api.ts
```

#### Key API Endpoints

**Ideas API:**
```typescript
// GET /api/ideas - Get paginated business ideas with filters
interface IdeasQuery {
  page?: number;
  limit?: number;
  industry?: string[];
  difficulty?: number[];
  minScore?: number;
  search?: string;
  sortBy?: 'score' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// POST /api/ideas/:id/bookmark - Bookmark an idea
// DELETE /api/ideas/:id/bookmark - Remove bookmark
// GET /api/ideas/bookmarked - Get user's bookmarked ideas
```

**Authentication Flow:**
```typescript
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/refresh
// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
```

### Scraper Implementation (apps/scraper)

#### Python Project Structure
```
apps/scraper/
├── src/
│   ├── scrapers/
│   │   ├── reddit_scraper.py
│   │   └── subreddit_config.py
│   ├── processors/
│   │   ├── text_analyzer.py
│   │   ├── idea_extractor.py
│   │   └── scoring_engine.py
│   ├── services/
│   │   ├── openai_service.py
│   │   ├── database_service.py
│   │   └── notification_service.py
│   ├── utils/
│   │   ├── logger.py
│   │   ├── config.py
│   │   └── helpers.py
│   └── scheduler.py
├── requirements.txt
├── config.yaml
└── README.md
```

#### Scraping Logic
```python
# Target subreddits with specific criteria
TARGET_SUBREDDITS = {
    'Entrepreneur': {
        'keywords': ['problem', 'pain point', 'frustrating', 'wish there was'],
        'min_upvotes': 10,
        'min_comments': 5
    },
    'solopreneur': {
        'keywords': ['struggling with', 'need help', 'automation'],
        'min_upvotes': 5,
        'min_comments': 3
    }
    # Add more subreddits with specific targeting
}

# AI prompt for business idea extraction
IDEA_EXTRACTION_PROMPT = """
Analyze this Reddit post and comments for potential business opportunities.
Look for:
1. Pain points people are experiencing
2. Problems that could be solved with software/services
3. Inefficiencies in current solutions
4. Market gaps or unmet needs

Rate each opportunity on:
- Market potential (1-5)
- Technical difficulty (1-5)
- Competition level (1-5)
- Solopreneur suitability (1-5)

Return structured JSON with extracted opportunities.
"""
```

## Development Workflow

### Getting Started
1. **Environment Setup**
   ```bash
   # Clone and setup
   git clone <repo>
   cd reddit-idea-finder
   npm install
   
   # Setup environment variables
   cp .env.example .env
   # Fill in required variables
   
   # Database setup
   npx prisma generate
   npx prisma db push
   
   # Start development
   npm run dev
   ```

2. **Development Commands**
   ```bash
   # Start all services
   npm run dev
   
   # Start individual apps
   npm run dev:web      # Frontend
   npm run dev:api      # Backend API
   npm run dev:scraper  # Python scraper
   
   # Database operations
   npm run db:migrate   # Run migrations
   npm run db:seed      # Seed with sample data
   npm run db:studio    # Open Prisma Studio
   ```

### Testing Strategy
1. **Unit Tests**: Jest for TypeScript, pytest for Python
2. **Integration Tests**: API endpoint testing with supertest
3. **E2E Tests**: Playwright for critical user flows
4. **Load Testing**: Artillery for API performance
5. **Security Testing**: OWASP ZAP for vulnerability scanning

### Deployment Strategy
1. **Staging Environment**: Deploy on every PR merge
2. **Production Deployment**: Manual approval after staging validation
3. **Database Migrations**: Automated with rollback capability
4. **Feature Flags**: Use for gradual feature rollouts
5. **Monitoring**: Health checks, performance metrics, error tracking

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest and in transit
- Implement proper input validation and sanitization
- Use parameterized queries to prevent SQL injection
- Rate limiting to prevent abuse
- CORS configuration for API security

### Privacy Compliance
- Clear privacy policy and terms of service
- Data retention policies
- User data export/deletion capabilities
- Audit logging for compliance

### Reddit API Compliance
- Respect rate limits (60 requests per minute)
- Follow Reddit's API terms of service
- Implement exponential backoff for failed requests
- Cache data appropriately to reduce API calls

## Performance Optimization

### Backend Optimization
- Database query optimization with proper indexing
- Redis caching for frequently accessed data
- Background job processing for heavy operations
- Connection pooling for database connections
- CDN for static assets

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization with Next.js
- Prefetching for critical resources
- Service worker for offline functionality
- Bundle analysis and optimization

## Monitoring and Analytics

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring with custom metrics
- Database query performance tracking
- API response time monitoring
- User activity analytics

### Business Metrics
- User engagement tracking
- Idea interaction rates
- Conversion funnel analysis
- Subscription metrics
- Revenue tracking

## Success Criteria

### Technical Metrics
- API response time < 200ms for 95th percentile
- Database query time < 50ms average
- Frontend load time < 3 seconds
- 99.9% uptime SLA
- Zero critical security vulnerabilities

### Product Metrics
- User retention rate > 60% after 30 days
- Idea engagement rate > 40%
- Free to paid conversion rate > 5%
- Net Promoter Score > 50
- Customer acquisition cost < $50

This comprehensive documentation should enable Claude Code CLI to autonomously implement the Reddit business idea finder with proper architecture, security, and scalability considerations. The modular approach allows for incremental development and testing at each phase.