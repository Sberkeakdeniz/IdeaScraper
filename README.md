# Reddit Idea Finder

A comprehensive platform that discovers and analyzes business opportunities from Reddit discussions using AI-powered analysis. Built for soloentrepreneurs and small teams looking for validated market opportunities.

## 🚀 Features

- **AI-Powered Discovery**: Automatically scrapes and analyzes Reddit posts to identify business opportunities
- **Smart Filtering**: Filter ideas by industry, difficulty, market potential, and competition level
- **Real-time Updates**: Continuous monitoring of multiple subreddits for fresh opportunities
- **User Management**: Secure authentication and subscription-based access
- **Interactive Dashboard**: Modern, responsive interface for exploring and managing ideas
- **Bookmarking System**: Save and organize promising ideas for future reference
- **Export Capabilities**: Export ideas to PDF/CSV formats (Premium feature)

## 🏗️ Architecture

This is a monorepo containing:

- **apps/web**: Next.js 14 frontend application with modern UI
- **apps/api**: Express.js backend API with JWT authentication
- **apps/scraper**: Python service for Reddit scraping and AI analysis
- **packages/database**: Prisma schema and database utilities
- **packages/shared**: Shared TypeScript types and utilities
- **packages/ui**: Reusable React components
- **packages/config**: Environment configuration management

## 🛠️ Tech Stack

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations
- React Query for server state
- Zustand for client state

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- JWT authentication
- Redis for caching
- Bull MQ for job queues
- OpenAPI/Swagger documentation

### Scraper
- Python 3.11+
- PRAW (Reddit API)
- OpenAI GPT-4 for analysis
- APScheduler for job scheduling
- asyncpg for database operations

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Reddit API credentials
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reddit-idea-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Install Python dependencies**
   ```bash
   cd apps/scraper
   pip install -r requirements.txt
   ```

### Development

Start all services in development mode:

```bash
npm run dev
```

Or start individual services:

```bash
# Frontend (Next.js)
npm run dev:web

# Backend API (Express.js)
npm run dev:api

# Scraper service (Python)
npm run dev:scraper
```

The applications will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Prisma Studio: http://localhost:5555

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset
```

## 📁 Project Structure

```
reddit-idea-finder/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utilities
│   ├── api/                   # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── services/     # Business logic
│   │   │   └── utils/        # Utilities
│   └── scraper/              # Python scraper
│       ├── src/
│       │   ├── scrapers/     # Reddit scraping logic
│       │   ├── processors/   # AI analysis
│       │   ├── services/     # Database operations
│       │   └── utils/        # Utilities
├── packages/
│   ├── database/             # Prisma schema
│   ├── shared/               # Shared types
│   ├── ui/                   # UI components
│   └── config/               # Configuration
└── docs/                     # Documentation
```

## 🔧 Configuration

### Reddit API Setup

1. Go to https://www.reddit.com/prefs/apps
2. Create a new application (script type)
3. Note your client ID and secret
4. Add them to your `.env` file

### OpenAI API Setup

1. Get an API key from https://platform.openai.com/
2. Add it to your `.env` file as `OPENAI_API_KEY`

### Database Setup

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in your `.env` file
3. Run migrations: `npm run db:migrate`

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable validation
- SQL injection prevention
- XSS protection headers

## 📊 Subscription Tiers

### Free Tier
- View up to 50 ideas per month
- Basic filtering options
- Email notifications

### Premium ($29/month)
- Unlimited idea views
- Advanced filtering and search
- Export to PDF/CSV
- Priority support
- Bookmark ideas

### Enterprise ($99/month)
- All premium features
- API access
- Custom industry targeting
- Dedicated account manager
- White-label options

## 🚀 Deployment

### Using Docker

```bash
# Build and run all services
docker-compose up -d
```

### Manual Deployment

1. Build the applications:
   ```bash
   npm run build
   ```

2. Set up production environment variables

3. Deploy to your hosting platform:
   - Frontend: Vercel, Netlify, or similar
   - Backend: Railway, Heroku, or VPS
   - Database: Supabase, PlanetScale, or managed PostgreSQL
   - Scraper: Run as a background service

## 📈 Monitoring & Analytics

- Error tracking with Sentry
- Performance monitoring
- User analytics
- Business metrics dashboard
- API response time monitoring

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:web
npm run test:api
npm run test:scraper

# Run with coverage
npm run test:coverage
```

## 📝 API Documentation

API documentation is available at `/api/docs` when running the backend in development mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/reddit-idea-finder/issues)
- Email: support@ideafinder.com

## 🙏 Acknowledgments

- Reddit API for data access
- OpenAI for AI-powered analysis
- All the open-source libraries that make this possible

---

Built with ❤️ for the solopreneur community