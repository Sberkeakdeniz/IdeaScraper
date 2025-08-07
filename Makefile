# Reddit Idea Finder Makefile

.PHONY: help install dev build test clean docker-up docker-down db-migrate db-seed db-reset logs

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development servers"
	@echo "  build       - Build all applications"
	@echo "  test        - Run all tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-up   - Start Docker services"
	@echo "  docker-down - Stop Docker services"
	@echo "  db-migrate  - Run database migrations"
	@echo "  db-seed     - Seed database with sample data"
	@echo "  db-reset    - Reset database"
	@echo "  logs        - View application logs"

# Development commands
install:
	npm install
	cd apps/scraper && pip install -r requirements.txt

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

clean:
	npm run clean
	rm -rf apps/*/dist
	rm -rf packages/*/dist
	rm -rf apps/*/.next

# Docker commands
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Database commands
db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

db-studio:
	npm run db:studio

# Utility commands
logs:
	tail -f logs/*.log

format:
	npm run format

lint:
	npm run lint

# Production deployment
deploy-staging:
	@echo "Deploying to staging..."
	# Add your staging deployment commands here

deploy-production:
	@echo "Deploying to production..."
	# Add your production deployment commands here