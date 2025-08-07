#!/bin/bash

# Development Environment Setup Script
# This script sets up the complete development environment for testing

set -e

echo "🚀 Setting up Idea Scraper Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "All prerequisites met!"

# Copy environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.development .env
    print_success "Environment file created from template"
else
    print_warning "Environment file already exists, skipping..."
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed!"

# Start database services
print_status "Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "postgres.*Up" && docker-compose ps | grep -q "redis.*Up"; then
    print_success "Database services are running!"
else
    print_error "Failed to start database services"
    exit 1
fi

# Setup database
print_status "Setting up database..."
cd packages/database

# Install bcryptjs for seeding
npm install bcryptjs

# Run migrations
print_status "Running database migrations..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reddit_idea_finder" npx prisma migrate deploy

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Seed database
print_status "Seeding database with test data..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reddit_idea_finder" npm run db:seed

cd ../..

print_success "Database setup complete!"

# Provide next steps
echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the API server:"
echo "   cd apps/api && npm run dev"
echo ""
echo "2. In another terminal, start the web app:"
echo "   cd apps/web && npm run dev"
echo ""
echo "3. Open your browser to:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3001"
echo "   - Prisma Studio: npx prisma studio (from packages/database)"
echo ""
echo "🧪 Test User Accounts:"
echo "- john@example.com (Premium) - password: password123"
echo "- jane@example.com (Free) - password: password123"
echo "- alex@example.com (Enterprise) - password: password123"
echo ""
echo "📖 See REAL_USE_CASE_TESTING.md for complete testing guide"
echo ""
echo "🐳 To stop services when done:"
echo "   docker-compose down"