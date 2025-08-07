@echo off
REM Development Environment Setup Script for Windows
REM This script sets up the complete development environment for testing

echo 🚀 Setting up Idea Scraper Development Environment...

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop.
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

echo [SUCCESS] All prerequisites met!

REM Copy environment file
echo [INFO] Setting up environment configuration...
if not exist .env (
    copy .env.development .env
    echo [SUCCESS] Environment file created from template
) else (
    echo [WARNING] Environment file already exists, skipping...
)

REM Install dependencies
echo [INFO] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed!

REM Start database services
echo [INFO] Starting database services...
docker-compose up -d postgres redis
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start database services
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo [SUCCESS] Database services are running!

REM Setup database
echo [INFO] Setting up database...
cd packages\database

REM Install bcryptjs for seeding
npm install bcryptjs

REM Run migrations
echo [INFO] Running database migrations...
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reddit_idea_finder
npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run database migrations
    exit /b 1
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

REM Seed database
echo [INFO] Seeding database with test data...
npm run db:seed
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed database
    exit /b 1
)

cd ..\..

echo [SUCCESS] Database setup complete!

REM Provide next steps
echo.
echo 🎉 Development environment setup complete!
echo.
echo 📋 Next Steps:
echo 1. Start the API server:
echo    cd apps/api ^&^& npm run dev
echo.
echo 2. In another terminal, start the web app:
echo    cd apps/web ^&^& npm run dev
echo.
echo 3. Open your browser to:
echo    - Frontend: http://localhost:3000
echo    - API: http://localhost:3001
echo    - Prisma Studio: npx prisma studio (from packages/database)
echo.
echo 🧪 Test User Accounts:
echo - john@example.com (Premium) - password: password123
echo - jane@example.com (Free) - password: password123
echo - alex@example.com (Enterprise) - password: password123
echo.
echo 📖 See REAL_USE_CASE_TESTING.md for complete testing guide
echo.
echo 🐳 To stop services when done:
echo    docker-compose down
echo.
pause