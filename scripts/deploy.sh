#!/bin/bash

# Reddit Idea Finder - Production Deployment Script
# This script handles zero-downtime deployment to production

set -e

# Configuration
APP_NAME="reddit-idea-finder"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
HEALTH_CHECK_URL="http://localhost:3001/health"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Send notification to Slack
send_notification() {
    local message=$1
    local color=$2
    
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\", \"color\":\"$color\"}" \
            $SLACK_WEBHOOK_URL >/dev/null 2>&1 || true
    fi
}

# Check if running as root
check_user() {
    if [ "$EUID" -eq 0 ]; then
        error "Please don't run this script as root"
        exit 1
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running"
        exit 1
    fi
    
    # Check if required environment files exist
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found"
        exit 1
    fi
    
    # Check disk space (require at least 2GB free)
    available_space=$(df /opt --output=avail | tail -1)
    if [ "$available_space" -lt 2097152 ]; then
        error "Insufficient disk space. At least 2GB required."
        exit 1
    fi
    
    # Health check current deployment
    if curl -f $HEALTH_CHECK_URL >/dev/null 2>&1; then
        success "Current deployment is healthy"
    else
        warning "Current deployment health check failed"
    fi
    
    success "Pre-deployment checks passed"
}

# Create backup before deployment
create_backup() {
    log "Creating backup..."
    
    local date=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR
    
    # Backup database
    if [ ! -z "$DATABASE_URL" ]; then
        log "Backing up database..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U postgres reddit_idea_finder | gzip > "$BACKUP_DIR/db_backup_$date.sql.gz"
        
        # Upload to S3 if configured
        if [ ! -z "$AWS_S3_BUCKET" ]; then
            aws s3 cp "$BACKUP_DIR/db_backup_$date.sql.gz" "s3://$AWS_S3_BUCKET/backups/" || warning "Failed to upload backup to S3"
        fi
    fi
    
    # Backup application files
    log "Backing up application files..."
    tar -czf "$BACKUP_DIR/app_backup_$date.tar.gz" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='*.log' \
        . || warning "Failed to backup application files"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
    
    success "Backup created successfully"
}

# Pull latest code and build images
build_application() {
    log "Pulling latest code..."
    git pull origin main
    
    log "Building Docker images..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --parallel
    
    success "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Run migrations in a temporary container
    docker-compose -f $DOCKER_COMPOSE_FILE run --rm api npx prisma migrate deploy
    
    success "Database migrations completed"
}

# Deploy services with zero downtime
deploy_services() {
    log "Deploying services..."
    
    # Scale API to have 2 instances for zero downtime
    log "Scaling API service..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --scale api=2 --no-recreate
    
    # Wait for new API instances to be healthy
    log "Waiting for API service to be healthy..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -f $HEALTH_CHECK_URL >/dev/null 2>&1; then
            success "API service is healthy"
            break
        fi
        
        attempts=$((attempts + 1))
        log "Health check attempt $attempts/$max_attempts..."
        sleep 10
    done
    
    if [ $attempts -eq $max_attempts ]; then
        error "API service health check failed after $max_attempts attempts"
        rollback_deployment
        exit 1
    fi
    
    # Deploy frontend
    log "Deploying frontend..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d web --no-deps
    
    # Deploy scraper
    log "Deploying scraper..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d scraper --no-deps
    
    # Scale API back to 1 instance
    log "Scaling API back to normal..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --scale api=1 --no-recreate
    
    success "Services deployed successfully"
}

# Rollback deployment if something goes wrong
rollback_deployment() {
    error "Deployment failed. Rolling back..."
    
    # Get latest backup
    local latest_backup=$(ls -t $BACKUP_DIR/app_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ ! -z "$latest_backup" ]; then
        log "Restoring from backup: $latest_backup"
        tar -xzf $latest_backup
        docker-compose -f $DOCKER_COMPOSE_FILE up -d
    else
        warning "No backup found. Manual intervention required."
    fi
    
    send_notification "🚨 Deployment failed and rollback attempted for $APP_NAME" "danger"
}

# Post-deployment verification
post_deployment_checks() {
    log "Running post-deployment checks..."
    
    # Health check all services
    local services=("web" "api" "scraper")
    
    for service in "${services[@]}"; do
        if docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -q "Up"; then
            success "$service is running"
        else
            error "$service is not running"
            return 1
        fi
    done
    
    # API health check
    if curl -f $HEALTH_CHECK_URL >/dev/null 2>&1; then
        success "API health check passed"
    else
        error "API health check failed"
        return 1
    fi
    
    # Frontend accessibility check
    local frontend_url="${FRONTEND_URL:-http://localhost:3000}"
    if curl -f "$frontend_url" >/dev/null 2>&1; then
        success "Frontend is accessible"
    else
        warning "Frontend accessibility check failed"
    fi
    
    success "Post-deployment checks passed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker resources..."
    
    # Remove unused images
    docker image prune -f >/dev/null 2>&1 || true
    
    # Remove unused containers
    docker container prune -f >/dev/null 2>&1 || true
    
    # Remove unused networks
    docker network prune -f >/dev/null 2>&1 || true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log "🚀 Starting deployment of $APP_NAME..."
    send_notification "🚀 Starting deployment of $APP_NAME" "good"
    
    # Change to app directory
    cd $APP_DIR
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
    fi
    
    # Run deployment steps
    check_user
    pre_deployment_checks
    create_backup
    build_application
    run_migrations
    deploy_services
    post_deployment_checks
    cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "🎉 Deployment completed successfully in ${duration}s!"
    send_notification "✅ Deployment of $APP_NAME completed successfully in ${duration}s!" "good"
}

# Handle script interruption
trap 'error "Deployment interrupted"; send_notification "🚨 Deployment of $APP_NAME was interrupted" "warning"; exit 1' INT TERM

# Help function
show_help() {
    cat << EOF
Reddit Idea Finder Deployment Script

Usage: $0 [OPTIONS]

Options:
    -h, --help     Show this help message
    --dry-run      Run deployment simulation (no actual changes)
    --rollback     Rollback to previous version
    --status       Show current deployment status

Examples:
    $0                 # Run full deployment
    $0 --dry-run      # Simulate deployment
    $0 --rollback     # Rollback deployment
    $0 --status       # Check current status

Environment Variables:
    SLACK_WEBHOOK_URL  # Optional: Slack webhook for notifications
    AWS_S3_BUCKET      # Optional: S3 bucket for backup storage

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --dry-run)
        log "DRY RUN MODE - No changes will be made"
        # Run checks but don't actually deploy
        check_user
        pre_deployment_checks
        log "Dry run completed successfully"
        exit 0
        ;;
    --rollback)
        log "Rolling back to previous version..."
        rollback_deployment
        exit 0
        ;;
    --status)
        log "Checking deployment status..."
        docker-compose -f $DOCKER_COMPOSE_FILE ps
        curl -s $HEALTH_CHECK_URL | jq . 2>/dev/null || curl -s $HEALTH_CHECK_URL
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac