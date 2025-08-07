#!/bin/bash

# Reddit Idea Finder - Backup Script
# This script creates comprehensive backups of database and application files

set -e

# Configuration
APP_NAME="reddit-idea-finder"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup retention (days)
DB_RETENTION_DAYS=30
FILES_RETENTION_DAYS=7
LOG_RETENTION_DAYS=90

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
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

# Send notification
send_notification() {
    local message=$1
    local status=$2
    
    # Send to Slack if configured
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        [ "$status" = "error" ] && color="danger"
        [ "$status" = "warning" ] && color="warning"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"📦 $APP_NAME Backup: $message\", \"color\":\"$color\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Create backup directory structure
create_backup_structure() {
    log "Creating backup directory structure..."
    
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/logs"
    mkdir -p "$BACKUP_DIR/configs"
    
    success "Backup directory structure created"
}

# Database backup
backup_database() {
    log "Creating database backup..."
    
    local db_backup_file="$BACKUP_DIR/database/db_backup_$DATE.sql.gz"
    
    # Create database dump
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U postgres reddit_idea_finder | gzip > "$db_backup_file"; then
        local backup_size=$(du -h "$db_backup_file" | cut -f1)
        success "Database backup created: $db_backup_file (${backup_size})"
        
        # Verify backup integrity
        if gunzip -t "$db_backup_file"; then
            success "Database backup integrity verified"
        else
            error "Database backup integrity check failed"
            return 1
        fi
    else
        error "Database backup failed"
        return 1
    fi
    
    # Create a readable backup info file
    cat > "$BACKUP_DIR/database/db_backup_$DATE.info" << EOF
Backup Information
==================
Timestamp: $(date)
Database: reddit_idea_finder
Size: $(du -h "$db_backup_file" | cut -f1)
Tables: $(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs || echo "N/A")
Records: $(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT SUM(n_tup_ins + n_tup_upd) FROM pg_stat_user_tables;" 2>/dev/null | xargs || echo "N/A")
EOF
}

# Application files backup
backup_application_files() {
    log "Creating application files backup..."
    
    local files_backup_file="$BACKUP_DIR/files/app_backup_$DATE.tar.gz"
    
    # Create application backup (exclude unnecessary files)
    if tar -czf "$files_backup_file" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='*.log' \
        --exclude='.env*' \
        --exclude='tmp' \
        --exclude='cache' \
        -C "$APP_DIR" .; then
        
        local backup_size=$(du -h "$files_backup_file" | cut -f1)
        success "Application files backup created: $files_backup_file (${backup_size})"
    else
        error "Application files backup failed"
        return 1
    fi
}

# Configuration files backup
backup_configurations() {
    log "Creating configuration backup..."
    
    local config_backup_file="$BACKUP_DIR/configs/config_backup_$DATE.tar.gz"
    
    # Backup configuration files (without sensitive data)
    tar -czf "$config_backup_file" \
        -C "$APP_DIR" \
        docker-compose.production.yml \
        nginx.conf \
        scripts/ \
        docs/ \
        package.json \
        turbo.json \
        .gitignore \
        README.md 2>/dev/null || true
    
    # Backup system configuration files
    if [ -d "/etc/nginx/sites-available" ]; then
        tar -rf "$config_backup_file" -C / etc/nginx/sites-available/$APP_NAME 2>/dev/null || true
    fi
    
    if [ -f "/etc/systemd/system/$APP_NAME*.service" ]; then
        tar -rf "$config_backup_file" -C / etc/systemd/system/$APP_NAME*.service 2>/dev/null || true
    fi
    
    gzip "$config_backup_file" 2>/dev/null || true
    
    success "Configuration backup created"
}

# Logs backup
backup_logs() {
    log "Creating logs backup..."
    
    local logs_backup_file="$BACKUP_DIR/logs/logs_backup_$DATE.tar.gz"
    
    # Backup application logs (last 30 days)
    find "$APP_DIR/logs" -name "*.log" -mtime -30 -type f | \
        tar -czf "$logs_backup_file" -T - 2>/dev/null || true
    
    # Include Docker logs
    docker-compose -f $DOCKER_COMPOSE_FILE logs --no-color > /tmp/docker_logs_$DATE.log 2>/dev/null || true
    if [ -f "/tmp/docker_logs_$DATE.log" ]; then
        tar -czf "$logs_backup_file.tmp" "$logs_backup_file" "/tmp/docker_logs_$DATE.log" 2>/dev/null || true
        mv "$logs_backup_file.tmp" "$logs_backup_file" 2>/dev/null || true
        rm -f "/tmp/docker_logs_$DATE.log"
    fi
    
    success "Logs backup created"
}

# Upload to cloud storage
upload_to_cloud() {
    local backup_type=$1
    local backup_file=$2
    
    # AWS S3 upload
    if [ ! -z "$AWS_S3_BUCKET" ] && command -v aws >/dev/null; then
        log "Uploading $backup_type to AWS S3..."
        
        if aws s3 cp "$backup_file" "s3://$AWS_S3_BUCKET/backups/$backup_type/$(basename $backup_file)"; then
            success "$backup_type uploaded to S3"
        else
            warning "Failed to upload $backup_type to S3"
        fi
    fi
    
    # Google Cloud Storage upload
    if [ ! -z "$GCS_BUCKET" ] && command -v gsutil >/dev/null; then
        log "Uploading $backup_type to Google Cloud Storage..."
        
        if gsutil cp "$backup_file" "gs://$GCS_BUCKET/backups/$backup_type/$(basename $backup_file)"; then
            success "$backup_type uploaded to GCS"
        else
            warning "Failed to upload $backup_type to GCS"
        fi
    fi
    
    # Azure Blob Storage upload
    if [ ! -z "$AZURE_STORAGE_ACCOUNT" ] && [ ! -z "$AZURE_STORAGE_KEY" ] && command -v az >/dev/null; then
        log "Uploading $backup_type to Azure Blob Storage..."
        
        if az storage blob upload \
            --account-name "$AZURE_STORAGE_ACCOUNT" \
            --account-key "$AZURE_STORAGE_KEY" \
            --container-name backups \
            --name "$backup_type/$(basename $backup_file)" \
            --file "$backup_file"; then
            success "$backup_type uploaded to Azure"
        else
            warning "Failed to upload $backup_type to Azure"
        fi
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Database backups
    find "$BACKUP_DIR/database" -name "db_backup_*.sql.gz" -mtime +$DB_RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR/database" -name "db_backup_*.info" -mtime +$DB_RETENTION_DAYS -delete 2>/dev/null || true
    
    # Application files backups
    find "$BACKUP_DIR/files" -name "app_backup_*.tar.gz" -mtime +$FILES_RETENTION_DAYS -delete 2>/dev/null || true
    
    # Configuration backups
    find "$BACKUP_DIR/configs" -name "config_backup_*.tar.gz" -mtime +$FILES_RETENTION_DAYS -delete 2>/dev/null || true
    
    # Logs backups
    find "$BACKUP_DIR/logs" -name "logs_backup_*.tar.gz" -mtime +$LOG_RETENTION_DAYS -delete 2>/dev/null || true
    
    success "Old backups cleaned up"
}

# Verify backups
verify_backups() {
    log "Verifying backup integrity..."
    
    local issues=0
    
    # Check database backup
    local latest_db_backup=$(ls -t "$BACKUP_DIR/database"/db_backup_*.sql.gz 2>/dev/null | head -1)
    if [ ! -z "$latest_db_backup" ]; then
        if gunzip -t "$latest_db_backup"; then
            success "Database backup integrity verified"
        else
            error "Database backup integrity check failed"
            ((issues++))
        fi
    fi
    
    # Check application files backup
    local latest_files_backup=$(ls -t "$BACKUP_DIR/files"/app_backup_*.tar.gz 2>/dev/null | head -1)
    if [ ! -z "$latest_files_backup" ]; then
        if tar -tzf "$latest_files_backup" >/dev/null; then
            success "Application files backup integrity verified"
        else
            error "Application files backup integrity check failed"
            ((issues++))
        fi
    fi
    
    return $issues
}

# Create backup manifest
create_backup_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/backup_manifest_$DATE.txt"
    
    cat > "$manifest_file" << EOF
Reddit Idea Finder - Backup Manifest
====================================
Backup Date: $(date)
Backup ID: $DATE

=== Database Backup ===
$(ls -la "$BACKUP_DIR/database"/db_backup_$DATE.* 2>/dev/null || echo "No database backup found")

=== Application Files Backup ===
$(ls -la "$BACKUP_DIR/files"/app_backup_$DATE.* 2>/dev/null || echo "No application files backup found")

=== Configuration Backup ===
$(ls -la "$BACKUP_DIR/configs"/config_backup_$DATE.* 2>/dev/null || echo "No configuration backup found")

=== Logs Backup ===
$(ls -la "$BACKUP_DIR/logs"/logs_backup_$DATE.* 2>/dev/null || echo "No logs backup found")

=== System Information ===
Hostname: $(hostname)
Uptime: $(uptime)
Docker Version: $(docker --version)
Disk Usage: $(df -h / | awk 'NR==2 {print $5 " used"}')
Memory Usage: $(free -h | grep Mem | awk '{print $3 " used of " $2}')

=== Application Status ===
$(docker-compose -f $DOCKER_COMPOSE_FILE ps 2>/dev/null || echo "Docker Compose not available")

EOF
    
    success "Backup manifest created: $manifest_file"
}

# Emergency restore function
emergency_restore() {
    local restore_date=$1
    
    if [ -z "$restore_date" ]; then
        error "Restore date required (format: YYYYMMDD_HHMMSS)"
        return 1
    fi
    
    warning "Starting emergency restore for $restore_date..."
    
    # Stop services
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    # Restore database
    local db_backup="$BACKUP_DIR/database/db_backup_$restore_date.sql.gz"
    if [ -f "$db_backup" ]; then
        log "Restoring database from $db_backup..."
        
        # Drop and recreate database
        docker-compose -f $DOCKER_COMPOSE_FILE up -d postgres
        sleep 10
        
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres dropdb -U postgres reddit_idea_finder || true
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres createdb -U postgres reddit_idea_finder
        
        # Restore data
        gunzip -c "$db_backup" | docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres reddit_idea_finder
        
        success "Database restored"
    else
        error "Database backup not found for $restore_date"
        return 1
    fi
    
    # Restore application files
    local files_backup="$BACKUP_DIR/files/app_backup_$restore_date.tar.gz"
    if [ -f "$files_backup" ]; then
        log "Restoring application files from $files_backup..."
        
        # Create backup of current state
        tar -czf "$BACKUP_DIR/pre_restore_backup_$(date +%Y%m%d_%H%M%S).tar.gz" -C "$APP_DIR" .
        
        # Restore files
        tar -xzf "$files_backup" -C "$APP_DIR"
        
        success "Application files restored"
    else
        warning "Application files backup not found for $restore_date"
    fi
    
    # Start services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    success "Emergency restore completed"
    send_notification "Emergency restore completed for $restore_date" "info"
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "🗄️ Starting backup process for $APP_NAME..."
    
    # Change to application directory
    cd "$APP_DIR"
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
    fi
    
    local backup_failed=0
    
    # Create backup structure
    create_backup_structure
    
    # Run backups
    backup_database || ((backup_failed++))
    backup_application_files || ((backup_failed++))
    backup_configurations
    backup_logs
    
    # Upload to cloud if configured
    if [ "$backup_failed" -eq 0 ]; then
        upload_to_cloud "database" "$BACKUP_DIR/database/db_backup_$DATE.sql.gz"
        upload_to_cloud "files" "$BACKUP_DIR/files/app_backup_$DATE.tar.gz"
    fi
    
    # Verify backups
    verify_backups || ((backup_failed++))
    
    # Create manifest
    create_backup_manifest
    
    # Cleanup old backups
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $backup_failed -eq 0 ]; then
        success "✅ Backup process completed successfully in ${duration}s"
        send_notification "Backup completed successfully in ${duration}s" "success"
    else
        error "❌ Backup process completed with $backup_failed errors in ${duration}s"
        send_notification "Backup completed with $backup_failed errors in ${duration}s" "error"
    fi
    
    # Show backup summary
    log "Backup Summary:"
    log "Database backups: $(ls -1 $BACKUP_DIR/database/db_backup_*.sql.gz 2>/dev/null | wc -l)"
    log "Files backups: $(ls -1 $BACKUP_DIR/files/app_backup_*.tar.gz 2>/dev/null | wc -l)"
    log "Total backup size: $(du -sh $BACKUP_DIR | cut -f1)"
}

# Help function
show_help() {
    cat << EOF
Reddit Idea Finder Backup Script

Usage: $0 [OPTIONS]

Options:
    -h, --help              Show this help message
    --database-only         Backup only database
    --files-only           Backup only application files
    --no-upload            Skip cloud upload
    --restore DATE         Emergency restore from backup (format: YYYYMMDD_HHMMSS)
    --list-backups         List available backups
    --verify               Verify backup integrity

Environment Variables:
    AWS_S3_BUCKET          S3 bucket for backup storage
    GCS_BUCKET             Google Cloud Storage bucket
    AZURE_STORAGE_ACCOUNT  Azure storage account
    AZURE_STORAGE_KEY      Azure storage key
    SLACK_WEBHOOK_URL      Slack webhook for notifications

Examples:
    $0                      # Full backup
    $0 --database-only      # Database backup only
    $0 --restore 20231201_120000  # Restore from backup
    $0 --list-backups       # List available backups

Cron Schedule Examples:
    # Full backup daily at 2 AM
    0 2 * * * /opt/reddit-idea-finder/scripts/backup.sh
    
    # Database backup every 6 hours
    0 */6 * * * /opt/reddit-idea-finder/scripts/backup.sh --database-only

EOF
}

# List available backups
list_backups() {
    log "Available backups:"
    
    echo "=== Database Backups ==="
    ls -la "$BACKUP_DIR/database"/db_backup_*.sql.gz 2>/dev/null | \
        awk '{print $9, $5, $6, $7, $8}' | \
        sort -r || echo "No database backups found"
    
    echo ""
    echo "=== Application Files Backups ==="
    ls -la "$BACKUP_DIR/files"/app_backup_*.tar.gz 2>/dev/null | \
        awk '{print $9, $5, $6, $7, $8}' | \
        sort -r || echo "No application files backups found"
    
    echo ""
    echo "=== Total Backup Storage ==="
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "Backup directory not found"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --database-only)
        create_backup_structure
        backup_database
        cleanup_old_backups
        exit 0
        ;;
    --files-only)
        create_backup_structure
        backup_application_files
        backup_configurations
        cleanup_old_backups
        exit 0
        ;;
    --no-upload)
        SKIP_UPLOAD=true
        main
        ;;
    --restore)
        if [ -z "$2" ]; then
            error "Restore date required"
            exit 1
        fi
        emergency_restore "$2"
        exit 0
        ;;
    --list-backups)
        list_backups
        exit 0
        ;;
    --verify)
        verify_backups
        exit $?
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