# Production Deployment Guide

This comprehensive guide covers deploying the Reddit Idea Finder application to production environments. The application consists of 4 main services that need to be deployed and configured properly.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Deployment Options](#deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Service Deployment](#service-deployment)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Performance Optimization](#performance-optimization)
12. [Security Hardening](#security-hardening)
13. [Maintenance & Updates](#maintenance--updates)
14. [Troubleshooting](#troubleshooting)

## 🔍 Pre-Deployment Checklist

### ✅ Code & Configuration
- [ ] All tests are passing (`npm run test`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build process works (`npm run build`)
- [ ] Polar.sh integration verified (`npm run verify-polar-setup`)
- [ ] Environment variables documented and secured
- [ ] Database migrations are ready
- [ ] Static assets optimized

### ✅ External Services
- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained
- [ ] PostgreSQL database provisioned
- [ ] Redis instance ready
- [ ] Polar.sh products and webhooks configured
- [ ] OpenAI API credits available
- [ ] Reddit API credentials active
- [ ] Email service configured (if using)

### ✅ Security
- [ ] Secrets stored securely (not in code)
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Database credentials secured
- [ ] API keys rotated from development

## 🏗️ Infrastructure Requirements

### Minimum Production Requirements

**Frontend (Web App)**
- CPU: 0.5-1 vCPU
- RAM: 512MB-1GB  
- Storage: 1GB
- Network: CDN recommended

**Backend API**
- CPU: 1-2 vCPU
- RAM: 1-2GB
- Storage: 2GB
- Network: Load balancer if scaling

**Python Scraper**
- CPU: 1 vCPU
- RAM: 1-2GB (AI processing intensive)
- Storage: 1GB
- Network: Stable connection for Reddit API

**Database (PostgreSQL)**
- CPU: 1-2 vCPU  
- RAM: 2-4GB
- Storage: 20GB+ SSD
- Backup: Automated daily backups

**Cache (Redis)**
- CPU: 0.5 vCPU
- RAM: 512MB-1GB
- Storage: 1GB
- Persistence: AOF enabled

### Recommended Production Setup

For **100-1000 concurrent users**:
- **Web**: 2 instances behind load balancer
- **API**: 2-3 instances with auto-scaling  
- **Scraper**: 1 instance with restart policy
- **Database**: 2vCPU, 4GB RAM, 50GB SSD
- **Redis**: 1GB RAM with persistence

## 🚀 Deployment Options

### Option 1: Cloud Platform (Recommended)

**Pros**: Managed services, auto-scaling, minimal ops overhead
**Cons**: Higher cost, vendor lock-in

**Recommended Providers**:
- **Vercel** (Frontend) + **Railway** (Backend + Database)
- **Netlify** (Frontend) + **Heroku** (Backend) + **Supabase** (Database)
- **AWS** (Full stack with ECS/Lambda)
- **Google Cloud Platform** (Cloud Run + Cloud SQL)
- **Microsoft Azure** (Container Apps + PostgreSQL)

### Option 2: VPS Deployment

**Pros**: Full control, lower cost, learning experience
**Cons**: More maintenance, security responsibility

**Recommended Providers**:
- **DigitalOcean** (Droplets + Managed Database)
- **Linode** (Compute + Database)
- **Vultr** (VPS + Managed Services)
- **Hetzner** (Cost-effective EU servers)

### Option 3: Containerized Deployment

**Pros**: Consistent environments, easy scaling
**Cons**: Container orchestration complexity

**Options**:
- **Docker Compose** (Single server)
- **Kubernetes** (Multi-server clusters)
- **Docker Swarm** (Simpler orchestration)

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file with all required variables:

```bash
# ========================================
# CORE APPLICATION SETTINGS
# ========================================
NODE_ENV=production
LOG_LEVEL=info
PORT=3001

# ========================================
# DOMAINS & URLS  
# ========================================
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:5432/dbname
# Enable SSL in production
DATABASE_SSL=true

# ========================================
# REDIS CONFIGURATION
# ========================================
REDIS_URL=redis://username:password@host:6379
# or for Redis Cloud/managed service:
# REDIS_URL=rediss://username:password@host:port

# ========================================
# AUTHENTICATION SECRETS
# ========================================
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_REFRESH_SECRET=your-refresh-token-secret-32-chars-min
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-min

# ========================================  
# EXTERNAL API KEYS
# ========================================
# OpenAI API for AI analysis
OPENAI_API_KEY=sk-your-openai-api-key

# Reddit API credentials
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=YourAppName/1.0

# ========================================
# POLAR.SH PAYMENT INTEGRATION
# ========================================
POLAR_ACCESS_TOKEN=polar_pat_your-access-token
POLAR_ORGANIZATION_ID=org_your-organization-id
POLAR_WEBHOOK_SECRET=whsec_your-webhook-secret
POLAR_PREMIUM_PRICE_ID=price_premium-plan-id
POLAR_ENTERPRISE_PRICE_ID=price_enterprise-plan-id

# ========================================
# EMAIL CONFIGURATION (Optional)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ========================================
# SCRAPER CONFIGURATION
# ========================================
MAX_POSTS_PER_SUBREDDIT=100
MIN_UPVOTES=50
MIN_COMMENTS=20
REQUESTS_PER_MINUTE=30

# ========================================
# MONITORING & ANALYTICS (Optional)
# ========================================
SENTRY_DSN=https://your-sentry-dsn
GA_TRACKING_ID=GA-XXXXXXXXX
```

### Environment-Specific Overrides

**Staging Environment** (`.env.staging`):
```bash
NODE_ENV=staging
LOG_LEVEL=debug
FRONTEND_URL=https://staging.yourdomain.com
# Use separate staging database
DATABASE_URL=postgresql://user:pass@staging-db:5432/staging_db
# Reduced scraper frequency for staging
MAX_POSTS_PER_SUBREDDIT=20
```

**Development Environment** (`.env.development`):
```bash
NODE_ENV=development  
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reddit_idea_finder
REDIS_URL=redis://localhost:6379
```

## 🗄️ Database Setup

### 1. PostgreSQL Production Setup

**Option A: Managed Database (Recommended)**

**Supabase**:
```bash
# 1. Create project at https://supabase.com
# 2. Get connection string from Settings > Database
# 3. Update DATABASE_URL in environment
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Railway**:
```bash
# 1. Create PostgreSQL service in Railway
# 2. Copy connection string from Variables tab
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/railway
```

**Option B: Self-Managed PostgreSQL**

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createuser --createdb --pwprompt ideafinder
sudo -u postgres createdb ideafinder_production --owner=ideafinder

# Configure PostgreSQL for production
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**Production PostgreSQL Configuration** (`postgresql.conf`):
```ini
# Performance settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings  
max_connections = 100
listen_addresses = '*'

# Security
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'

# Logging
log_statement = 'all'
log_min_duration_statement = 1000
```

### 2. Database Migrations & Setup

```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Generate Prisma client
npx prisma generate

# 3. Seed production data (optional)
npm run db:seed:production
```

### 3. Redis Production Setup

**Option A: Managed Redis**

**Redis Cloud**:
```bash
# 1. Sign up at https://redis.com/redis-enterprise-cloud/
# 2. Create database
# 3. Get connection string
REDIS_URL=redis://:[PASSWORD]@[HOST]:[PORT]
```

**Option B: Self-Managed Redis**

```bash
# Install Redis (Ubuntu/Debian)
sudo apt install redis-server

# Configure for production
sudo nano /etc/redis/redis.conf
```

**Production Redis Configuration**:
```ini
# Security
requirepass your-redis-password
bind 127.0.0.1 ::1

# Persistence
appendonly yes
appendfsync everysec

# Memory management
maxmemory 1gb
maxmemory-policy allkeys-lru

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

## 🚢 Service Deployment

### 1. Frontend (Next.js Web App)

#### Option A: Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from project root
   vercel
   ```

2. **Configure Build Settings**:
   ```bash
   # Vercel will auto-detect Next.js
   # Build Command: cd apps/web && npm run build
   # Output Directory: apps/web/.next
   # Install Command: npm install
   ```

3. **Environment Variables**:
   - Add all frontend environment variables in Vercel dashboard
   - Set `NODE_ENV=production`

#### Option B: Netlify

1. **Build Configuration** (`netlify.toml`):
   ```toml
   [build]
     base = "apps/web"
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_ENV = "production"
   ```

2. **Deploy**:
   ```bash
   # Install Netlify CLI
   npm install netlify-cli -g
   
   # Deploy
   netlify deploy --prod
   ```

#### Option C: Docker Deployment

```bash
# Build frontend image
docker build -f apps/web/Dockerfile -t ideafinder-web .

# Run container
docker run -d \
  --name ideafinder-web \
  -p 3000:3000 \
  --env-file .env.production \
  ideafinder-web
```

### 2. Backend API (Express.js)

#### Option A: Railway (Recommended)

1. **Connect Repository**:
   - Go to https://railway.app
   - Connect GitHub repository
   - Select "Deploy from GitHub repo"

2. **Configure Service**:
   ```bash
   # Railway will auto-detect Node.js
   # Build Command: npm run build --workspace=apps/api
   # Start Command: node apps/api/dist/index.js
   ```

3. **Environment Variables**:
   - Add all backend environment variables in Railway dashboard
   - Enable auto-deploy on main branch

#### Option B: Heroku

1. **Prepare for Heroku**:
   ```bash
   # Create Procfile in project root
   echo "web: node apps/api/dist/index.js" > Procfile
   
   # Create heroku-postbuild script in package.json
   "heroku-postbuild": "npm run build --workspace=apps/api && npx prisma generate"
   ```

2. **Deploy**:
   ```bash
   # Create Heroku app
   heroku create ideafinder-api
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:standard-0
   
   # Add Redis addon
   heroku addons:create heroku-redis:premium-0
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... add all other environment variables
   
   # Deploy
   git push heroku main
   ```

#### Option C: VPS Deployment

```bash
# Example deployment script for Ubuntu server
#!/bin/bash

# 1. Clone repository
git clone https://github.com/yourusername/reddit-idea-finder.git
cd reddit-idea-finder

# 2. Install dependencies
npm install

# 3. Build application
npm run build --workspace=apps/api

# 4. Install PM2 for process management
npm install -g pm2

# 5. Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ideafinder-api',
    script: './apps/api/dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_file: '.env.production',
    log_file: './logs/api.log',
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    max_memory_restart: '500M'
  }]
}
EOF

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Python Scraper Service

#### Option A: Railway/Heroku Worker

1. **Configure as Worker**:
   ```bash
   # Add to Procfile
   worker: python apps/scraper/src/scheduler.py
   ```

2. **Scale Worker**:
   ```bash
   # Heroku
   heroku ps:scale worker=1
   
   # Railway - Configure as worker service in dashboard
   ```

#### Option B: VPS with Systemd

1. **Create Service File**:
   ```bash
   sudo nano /etc/systemd/system/ideafinder-scraper.service
   ```

2. **Service Configuration**:
   ```ini
   [Unit]
   Description=Reddit Idea Finder Scraper
   After=network.target
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/reddit-idea-finder/apps/scraper
   Environment=PYTHONPATH=/home/ubuntu/reddit-idea-finder/apps/scraper
   EnvironmentFile=/home/ubuntu/reddit-idea-finder/.env.production
   ExecStart=/usr/bin/python3 src/scheduler.py
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable ideafinder-scraper
   sudo systemctl start ideafinder-scraper
   ```

### 4. Complete Docker Compose Production Setup

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
    restart: unless-stopped

  # Frontend
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - api
    restart: unless-stopped

  # Backend API  
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      POLAR_ACCESS_TOKEN: ${POLAR_ACCESS_TOKEN}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # Python Scraper
  scraper:
    build:
      context: .
      dockerfile: apps/scraper/Dockerfile  
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      REDDIT_CLIENT_ID: ${REDDIT_CLIENT_ID}
      REDDIT_CLIENT_SECRET: ${REDDIT_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Monitoring (Optional)
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

Deploy with:
```bash
# Deploy production stack
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale api=3
```

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo crontab -l
```

### Option 2: Cloudflare (Recommended)

1. **Add Domain to Cloudflare**:
   - Change nameservers to Cloudflare
   - Enable SSL/TLS encryption

2. **Configure Origin Certificates**:
   ```bash
   # Download Cloudflare origin certificate
   # Place in /etc/ssl/cloudflare/
   ```

3. **Nginx Configuration**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/ssl/cloudflare/cert.pem;
       ssl_certificate_key /etc/ssl/cloudflare/key.pem;
       
       # Cloudflare real IP
       set_real_ip_from 173.245.48.0/20;
       real_ip_header CF-Connecting-IP;
   }
   ```

### Nginx Configuration Example

Create `/etc/nginx/sites-available/ideafinder`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}

# Rate limiting configuration
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ideafinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring & Logging

### 1. Application Logging

**Structured Logging Setup**:

Create `apps/api/src/utils/logger.ts`:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ideafinder-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 2. Error Tracking with Sentry

Install Sentry:
```bash
npm install @sentry/node @sentry/tracing
```

Configure Sentry in `apps/api/src/index.ts`:
```typescript
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes...

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
```

### 3. Health Checks

Create health check endpoints:

```typescript
// apps/api/src/routes/health.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'redis';

const router = express.Router();
const prisma = new PrismaClient();
const redis = Redis.createClient({ url: process.env.REDIS_URL });

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'ERROR';
  }

  try {
    await redis.ping();
    health.services.redis = 'healthy';  
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

### 4. Monitoring Stack with Prometheus

Create `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ideafinder-api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres-exporter'  
    static_configs:
      - targets: ['localhost:9187']
```

### 5. Alerting Rules

Create `alerting.yml`:
```yaml
groups:
- name: ideafinder.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      
  - alert: DatabaseDown
    expr: up{job="postgres-exporter"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: PostgreSQL is down
```

## 💾 Backup Strategy

### 1. Database Backup

**Automated PostgreSQL Backup Script**:

```bash
#!/bin/bash
# backup-db.sh

# Configuration
DB_NAME="reddit_idea_finder"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    aws s3 cp $BACKUP_FILE s3://$AWS_S3_BUCKET/backups/
fi

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

**Crontab Schedule**:
```bash
# Run daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh

# Run weekly full backup on Sunday
0 1 * * 0 /path/to/full-backup.sh
```

### 2. File System Backup

```bash
#!/bin/bash
# backup-files.sh

# Backup application files
tar -czf "/backups/app_$(date +%Y%m%d).tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    /path/to/reddit-idea-finder

# Backup logs (last 30 days)
find ./logs -name "*.log" -mtime -30 | \
    tar -czf "/backups/logs_$(date +%Y%m%d).tar.gz" -T -
```

### 3. Restore Procedures

**Database Restore**:
```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

# Stop application
systemctl stop ideafinder-api

# Drop and recreate database
dropdb reddit_idea_finder
createdb reddit_idea_finder

# Restore from backup
gunzip -c $BACKUP_FILE | psql -d reddit_idea_finder

# Restart application
systemctl start ideafinder-api
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        npm ci
        cd apps/scraper && pip install -r requirements.txt

    - name: Run tests
      run: |
        npm run test
        npm run type-check
        npm run lint
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Build applications
      run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        service: [web, api, scraper]
        
    steps:
    - uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: apps/${{ matrix.service }}/Dockerfile
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/reddit-idea-finder
          git pull origin main
          docker-compose -f docker-compose.production.yml pull
          docker-compose -f docker-compose.production.yml up -d
          docker system prune -f

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify deployment status
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployment Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Configuration
APP_DIR="/opt/reddit-idea-finder"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup before deployment
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C $APP_DIR .

# Pull latest code
echo "📥 Pulling latest code..."
cd $APP_DIR
git pull origin main

# Build new images
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.production.yml build

# Database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml run --rm api npx prisma migrate deploy

# Deploy services with zero downtime
echo "🔄 Deploying services..."

# Start new instances
docker-compose -f docker-compose.production.yml up -d --scale api=2

# Health check
echo "🏥 Checking health..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
        break
    fi
    echo "⏳ Waiting for service to be healthy... ($i/30)"
    sleep 10
done

# Clean up old images
echo "🧹 Cleaning up..."
docker image prune -f

echo "🎉 Deployment completed successfully!"

# Send notification
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ Reddit Idea Finder deployed successfully at $(date)\"}" \
    $SLACK_WEBHOOK_URL
```

## ⚡ Performance Optimization

### 1. Database Optimization

**Indexing Strategy**:
```sql
-- Add indexes for common queries
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_upvotes ON ideas(upvotes DESC);
CREATE INDEX idx_ideas_subreddit ON ideas(subreddit);
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_usage_month ON user_usage(user_id, month_year);

-- Composite indexes for complex queries
CREATE INDEX idx_ideas_subreddit_upvotes ON ideas(subreddit, upvotes DESC);
CREATE INDEX idx_ideas_created_upvotes ON ideas(created_at DESC, upvotes DESC);
```

**Connection Pooling** (for self-managed databases):
```typescript
// apps/api/src/utils/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

// Connection pool configuration
export const dbConfig = {
  max: 20,              // Maximum connections
  min: 2,               // Minimum connections
  acquire: 60000,       // Maximum time to get connection
  idle: 10000,          // Maximum idle time
  evict: 1000,          // Check interval for idle connections
  handleDisconnects: true
};

export default prisma;
```

### 2. Redis Caching Strategy

```typescript
// apps/api/src/utils/cache.ts
import Redis from 'redis';

const redis = Redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

export class CacheService {
  // Cache ideas with 1 hour TTL
  async cacheIdeas(key: string, ideas: any[], ttl: number = 3600) {
    await redis.setex(key, ttl, JSON.stringify(ideas));
  }

  // Get cached ideas
  async getCachedIdeas(key: string) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache user session for 24 hours
  async cacheUserSession(userId: string, sessionData: any) {
    await redis.setex(`session:${userId}`, 86400, JSON.stringify(sessionData));
  }

  // Invalidate cache patterns
  async invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new CacheService();
```

### 3. API Response Optimization

```typescript
// apps/api/src/middleware/compression.ts
import compression from 'compression';

export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
});

// Pagination helper
export const paginate = (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return { skip: offset, take: Math.min(limit, 100) };
};

// Response optimization
export const optimizeResponse = (data: any, page?: number, total?: number) => {
  const response: any = { data };
  
  if (page && total) {
    response.pagination = {
      page,
      total,
      pages: Math.ceil(total / 20),
      hasNext: page * 20 < total,
      hasPrev: page > 1
    };
  }
  
  return response;
};
```

### 4. Frontend Optimization

**Next.js Configuration** (`apps/web/next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['i.redd.it', 'external-preview.redd.it'],
    formats: ['image/webp', 'image/avif'],
  },
  // Compression
  compress: true,
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
  // Performance optimizations
  swcMinify: true,
  // Headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔐 Security Hardening

### 1. Server Security

**Firewall Configuration** (UFW):
```bash
# Reset firewall
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port from default)
sudo ufw allow 2222/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow database (only from app servers)
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Enable firewall
sudo ufw enable
```

**SSH Hardening** (`/etc/ssh/sshd_config`):
```bash
# Change default port
Port 2222

# Disable root login
PermitRootLogin no

# Use key authentication only
PasswordAuthentication no
PubkeyAuthentication yes

# Limit login attempts
MaxAuthTries 3
MaxStartups 2

# Protocol 2 only
Protocol 2

# Restart SSH service
sudo systemctl restart sshd
```

### 2. Application Security

**Security Headers Middleware**:
```typescript
// apps/api/src/middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting
import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// API specific rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Higher limit for API
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});
```

**Input Validation**:
```typescript
// apps/api/src/middleware/validation.ts
import { body, query, param } from 'express-validator';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Common validation rules
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email required');

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character');

export const idValidation = param('id')
  .isInt({ min: 1 })
  .withMessage('Valid ID required');
```

### 3. Secrets Management

**Using AWS Secrets Manager**:
```typescript
// apps/api/src/utils/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(secretName: string): Promise<string> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return response.SecretString!;
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error);
    throw error;
  }
}

// Load secrets at startup
export async function loadSecrets() {
  if (process.env.NODE_ENV === 'production') {
    process.env.JWT_SECRET = await getSecret('reddit-idea-finder/jwt-secret');
    process.env.DATABASE_URL = await getSecret('reddit-idea-finder/database-url');
    process.env.OPENAI_API_KEY = await getSecret('reddit-idea-finder/openai-key');
  }
}
```

## 🔧 Maintenance & Updates

### 1. Update Strategy

**Zero-Downtime Deployment Process**:

```bash
#!/bin/bash
# zero-downtime-deploy.sh

set -e

echo "🔄 Starting zero-downtime deployment..."

# 1. Health check current deployment
if ! curl -f http://localhost:3001/health; then
    echo "❌ Current deployment unhealthy, aborting"
    exit 1
fi

# 2. Pull latest changes
git pull origin main

# 3. Build new images
docker-compose -f docker-compose.production.yml build

# 4. Start new API instances
docker-compose -f docker-compose.production.yml up -d --scale api=2 --no-recreate

# 5. Wait for new instances to be healthy
echo "⏳ Waiting for new instances to be healthy..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health; then
        echo "✅ New instances healthy"
        break
    fi
    sleep 10
done

# 6. Update frontend (instant)
docker-compose -f docker-compose.production.yml up -d web --no-deps

# 7. Update scraper
docker-compose -f docker-compose.production.yml up -d scraper --no-deps

# 8. Remove old containers
docker system prune -f

echo "✅ Deployment completed successfully!"
```

### 2. Database Maintenance

**Automated Maintenance Script**:
```bash
#!/bin/bash
# db-maintenance.sh

# Vacuum and analyze database
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Update statistics
psql $DATABASE_URL -c "ANALYZE;"

# Reindex if needed
psql $DATABASE_URL -c "REINDEX DATABASE reddit_idea_finder;"

# Check for unused indexes
psql $DATABASE_URL -f scripts/unused-indexes.sql

# Archive old data (keep 1 year of ideas)
psql $DATABASE_URL -c "
DELETE FROM ideas 
WHERE created_at < NOW() - INTERVAL '1 year' 
AND upvotes < 10;
"
```

### 3. Log Rotation

**Logrotate Configuration** (`/etc/logrotate.d/ideafinder`):
```
/opt/reddit-idea-finder/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 ubuntu ubuntu
    postrotate
        systemctl reload ideafinder-api
    endscript
}
```

### 4. Update Checklist

**Monthly Maintenance Tasks**:
- [ ] Update dependencies (`npm audit fix`)
- [ ] Review security patches
- [ ] Analyze performance metrics
- [ ] Clean up old logs and backups
- [ ] Review and rotate API keys
- [ ] Database performance analysis
- [ ] Check SSL certificate expiration
- [ ] Review and update monitoring alerts
- [ ] Test disaster recovery procedures

**Security Updates**:
```bash
#!/bin/bash
# security-updates.sh

# System updates
sudo apt update && sudo apt upgrade -y

# Node.js security updates
npm audit fix --force

# Docker image updates
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Check for vulnerabilities
npm audit
docker scan ideafinder-api:latest
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**1. Database Connection Issues**
```bash
# Check database status
systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check logs
tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

**2. High Memory Usage**
```bash
# Check memory usage
free -h
docker stats

# Check application memory
ps aux --sort=-%mem | head

# Restart services if needed
docker-compose -f docker-compose.production.yml restart api
```

**3. SSL Certificate Issues**
```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

**4. API Response Issues**
```bash
# Check API health
curl -v http://localhost:3001/health

# Check logs
docker logs ideafinder-api --tail 100

# Check database queries
tail -f logs/api.log | grep "slow query"
```

### Performance Issues

**High Database Load**:
```sql
-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Find blocking queries
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;
```

**High Redis Memory Usage**:
```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# Check largest keys
MEMORY USAGE key_name

# Clear cache if needed
FLUSHALL
```

### Emergency Procedures

**Complete System Recovery**:
```bash
#!/bin/bash
# emergency-recovery.sh

echo "🚨 Starting emergency recovery..."

# 1. Stop all services
docker-compose -f docker-compose.production.yml down

# 2. Check disk space
df -h

# 3. Clean up if needed
docker system prune -af
sudo apt autoremove -y

# 4. Restore from backup if needed
if [ "$1" == "restore" ]; then
    echo "📦 Restoring from backup..."
    ./scripts/restore-db.sh /backups/latest_backup.sql.gz
fi

# 5. Start services
docker-compose -f docker-compose.production.yml up -d

# 6. Health check
sleep 30
curl -f http://localhost:3001/health || echo "❌ Health check failed"

echo "✅ Recovery completed"
```

**Rollback Deployment**:
```bash
#!/bin/bash
# rollback.sh

ROLLBACK_TAG=${1:-"previous"}

echo "🔄 Rolling back to $ROLLBACK_TAG..."

# Pull previous images
docker pull ghcr.io/yourusername/reddit-idea-finder-web:$ROLLBACK_TAG
docker pull ghcr.io/yourusername/reddit-idea-finder-api:$ROLLBACK_TAG
docker pull ghcr.io/yourusername/reddit-idea-finder-scraper:$ROLLBACK_TAG

# Tag as latest
docker tag ghcr.io/yourusername/reddit-idea-finder-web:$ROLLBACK_TAG reddit-idea-finder-web:latest
docker tag ghcr.io/yourusername/reddit-idea-finder-api:$ROLLBACK_TAG reddit-idea-finder-api:latest
docker tag ghcr.io/yourusername/reddit-idea-finder-scraper:$ROLLBACK_TAG reddit-idea-finder-scraper:latest

# Restart services
docker-compose -f docker-compose.production.yml up -d

echo "✅ Rollback completed"
```

---

## 📞 Support & Resources

- **Documentation**: Keep this guide updated with your specific configuration
- **Monitoring**: Set up alerts for critical metrics
- **Backups**: Test restore procedures regularly
- **Security**: Keep dependencies and system packages updated
- **Performance**: Monitor and optimize based on usage patterns

Remember: Production deployment is an iterative process. Start simple, monitor everything, and scale based on actual usage patterns.

---

**Happy Deploying! 🚀**