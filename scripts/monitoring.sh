#!/bin/bash

# Reddit Idea Finder - Monitoring and Health Check Script
# This script monitors the application health and system resources

set -e

# Configuration
APP_NAME="reddit-idea-finder"
HEALTH_CHECK_URL="http://localhost:3001/health"
FRONTEND_URL="http://localhost:3000"
LOG_DIR="/var/log/$APP_NAME"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=90
RESPONSE_TIME_THRESHOLD=5000  # milliseconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "$(date +'%Y-%m-%d %H:%M:%S') INFO: $1" >> "$LOG_DIR/monitoring.log"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date +'%Y-%m-%d %H:%M:%S') ERROR: $1" >> "$LOG_DIR/monitoring.log"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date +'%Y-%m-%d %H:%M:%S') SUCCESS: $1" >> "$LOG_DIR/monitoring.log"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date +'%Y-%m-%d %H:%M:%S') WARNING: $1" >> "$LOG_DIR/monitoring.log"
}

# Send alert notification
send_alert() {
    local message=$1
    local severity=$2
    
    # Send to Slack if configured
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        local color="danger"
        [ "$severity" = "warning" ] && color="warning"
        [ "$severity" = "info" ] && color="good"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 $APP_NAME Alert: $message\", \"color\":\"$color\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
    
    # Send email if configured
    if [ ! -z "$ALERT_EMAIL" ] && command -v mail >/dev/null; then
        echo "$message" | mail -s "$APP_NAME Alert - $severity" "$ALERT_EMAIL" || true
    fi
    
    # Log to system log
    logger -t "$APP_NAME" "$severity: $message"
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    cpu_usage=${cpu_usage%.*}  # Remove decimal places
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        warning "High CPU usage: ${cpu_usage}%"
        send_alert "High CPU usage: ${cpu_usage}%" "warning"
    else
        success "CPU usage normal: ${cpu_usage}%"
    fi
    
    # Memory usage
    local memory_info=$(free | grep Mem)
    local total_memory=$(echo $memory_info | awk '{print $2}')
    local used_memory=$(echo $memory_info | awk '{print $3}')
    local memory_usage=$((used_memory * 100 / total_memory))
    
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
        warning "High memory usage: ${memory_usage}%"
        send_alert "High memory usage: ${memory_usage}%" "warning"
    else
        success "Memory usage normal: ${memory_usage}%"
    fi
    
    # Disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        error "High disk usage: ${disk_usage}%"
        send_alert "High disk usage: ${disk_usage}%" "error"
    else
        success "Disk usage normal: ${disk_usage}%"
    fi
    
    # Load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | xargs)
    log "System load average: $load_avg"
}

# Check Docker containers
check_docker_services() {
    log "Checking Docker services..."
    
    local services=("web" "api" "scraper" "postgres" "redis")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -q "Up"; then
            success "$service container is running"
        else
            error "$service container is not running"
            failed_services+=($service)
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        send_alert "Services down: ${failed_services[*]}" "error"
        return 1
    fi
    
    return 0
}

# Check API health
check_api_health() {
    log "Checking API health..."
    
    # Measure response time
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response $HEALTH_CHECK_URL 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ "$response" = "200" ]; then
        success "API health check passed (${response_time}ms)"
        
        # Check response time
        if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
            warning "Slow API response time: ${response_time}ms"
            send_alert "Slow API response time: ${response_time}ms" "warning"
        fi
        
        # Parse health response
        if command -v jq >/dev/null && [ -f /tmp/health_response ]; then
            local db_status=$(jq -r '.services.database // "unknown"' /tmp/health_response)
            local redis_status=$(jq -r '.services.redis // "unknown"' /tmp/health_response)
            
            log "Database status: $db_status"
            log "Redis status: $redis_status"
            
            if [ "$db_status" != "healthy" ]; then
                error "Database is unhealthy: $db_status"
                send_alert "Database is unhealthy: $db_status" "error"
            fi
            
            if [ "$redis_status" != "healthy" ]; then
                error "Redis is unhealthy: $redis_status"
                send_alert "Redis is unhealthy: $redis_status" "error"
            fi
        fi
    else
        error "API health check failed with status: $response"
        send_alert "API health check failed with status: $response" "error"
        return 1
    fi
    
    rm -f /tmp/health_response
    return 0
}

# Check frontend accessibility
check_frontend() {
    log "Checking frontend accessibility..."
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null $FRONTEND_URL 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        success "Frontend is accessible"
        return 0
    else
        error "Frontend is not accessible (status: $response)"
        send_alert "Frontend is not accessible (status: $response)" "error"
        return 1
    fi
}

# Check database performance
check_database_performance() {
    log "Checking database performance..."
    
    # Check active connections
    local active_connections=$(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | xargs || echo "0")
    
    log "Active database connections: $active_connections"
    
    if [ "$active_connections" -gt 50 ]; then
        warning "High number of active database connections: $active_connections"
        send_alert "High number of active database connections: $active_connections" "warning"
    fi
    
    # Check for long-running queries
    local long_queries=$(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';" 2>/dev/null | xargs || echo "0")
    
    if [ "$long_queries" -gt 0 ]; then
        warning "Found $long_queries long-running queries"
        send_alert "Found $long_queries long-running queries" "warning"
    fi
}

# Check log files for errors
check_error_logs() {
    log "Checking recent error logs..."
    
    local error_count=0
    local log_files=("$LOG_DIR/api.log" "$LOG_DIR/scraper.log")
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            # Check for errors in last 10 minutes
            local recent_errors=$(tail -n 1000 "$log_file" | grep -E "ERROR|FATAL|Exception" | wc -l || echo "0")
            error_count=$((error_count + recent_errors))
            
            if [ "$recent_errors" -gt 0 ]; then
                warning "Found $recent_errors recent errors in $log_file"
            fi
        fi
    done
    
    if [ "$error_count" -gt 10 ]; then
        error "High number of recent errors: $error_count"
        send_alert "High number of recent errors: $error_count" "error"
    elif [ "$error_count" -gt 0 ]; then
        warning "Found $error_count recent errors in logs"
    else
        success "No recent errors found in logs"
    fi
}

# Check SSL certificate expiration
check_ssl_certificate() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        return 0
    fi
    
    log "Checking SSL certificate for $domain..."
    
    local expiry_date=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ "$days_until_expiry" -lt 30 ]; then
        if [ "$days_until_expiry" -lt 7 ]; then
            error "SSL certificate expires in $days_until_expiry days!"
            send_alert "SSL certificate for $domain expires in $days_until_expiry days!" "error"
        else
            warning "SSL certificate expires in $days_until_expiry days"
            send_alert "SSL certificate for $domain expires in $days_until_expiry days" "warning"
        fi
    else
        success "SSL certificate is valid for $days_until_expiry more days"
    fi
}

# Performance monitoring
performance_monitoring() {
    log "Running performance monitoring..."
    
    # Create performance log entry
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | xargs)
    
    # API response time
    local start_time=$(date +%s%3N)
    curl -s $HEALTH_CHECK_URL >/dev/null 2>&1
    local end_time=$(date +%s%3N)
    local api_response_time=$((end_time - start_time))
    
    # Log performance metrics
    echo "$timestamp,$cpu_usage,$memory_usage,$disk_usage,$load_avg,$api_response_time" >> "$LOG_DIR/performance.csv"
    
    log "Performance metrics logged"
}

# Generate monitoring report
generate_report() {
    local report_file="$LOG_DIR/monitoring_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > $report_file << EOF
Reddit Idea Finder - System Monitoring Report
Generated: $(date)

=== System Information ===
Hostname: $(hostname)
Uptime: $(uptime)
Kernel: $(uname -r)
Load Average: $(uptime | awk -F'load average:' '{print $2}')

=== Resource Usage ===
CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
Memory Usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')
Disk Usage: $(df -h / | awk 'NR==2 {print $5 " used of " $2}')

=== Docker Services ===
$(docker-compose -f $DOCKER_COMPOSE_FILE ps)

=== API Health ===
$(curl -s $HEALTH_CHECK_URL | jq . 2>/dev/null || echo "Health check failed")

=== Recent Errors (last 24 hours) ===
$(find $LOG_DIR -name "*.log" -mtime -1 -exec grep -l "ERROR\|FATAL" {} \; | head -5)

=== Database Status ===
Active Connections: $(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs || echo "N/A")
Database Size: $(docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U postgres -d reddit_idea_finder -t -c "SELECT pg_size_pretty(pg_database_size('reddit_idea_finder'));" 2>/dev/null | xargs || echo "N/A")

=== Scraper Status ===
Last Scrape: $(docker-compose -f $DOCKER_COMPOSE_FILE logs --tail 10 scraper | grep "completed" | tail -1 || echo "N/A")

EOF

    log "Monitoring report generated: $report_file"
    
    # Send report if email is configured
    if [ ! -z "$REPORT_EMAIL" ] && command -v mail >/dev/null; then
        mail -s "$APP_NAME Monitoring Report" "$REPORT_EMAIL" < $report_file
    fi
}

# Auto-remediation for common issues
auto_remediation() {
    log "Running auto-remediation checks..."
    
    # Restart failed services
    local services=("web" "api" "scraper")
    for service in "${services[@]}"; do
        if ! docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -q "Up"; then
            warning "Attempting to restart $service service..."
            docker-compose -f $DOCKER_COMPOSE_FILE restart $service
            sleep 10
            
            if docker-compose -f $DOCKER_COMPOSE_FILE ps $service | grep -q "Up"; then
                success "$service service restarted successfully"
                send_alert "$service service was automatically restarted" "info"
            else
                error "Failed to restart $service service"
                send_alert "Failed to automatically restart $service service" "error"
            fi
        fi
    done
    
    # Clear old logs if disk usage is high
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        log "High disk usage detected, cleaning old logs..."
        find $LOG_DIR -name "*.log" -mtime +7 -delete
        find /var/log -name "*.log.*.gz" -mtime +30 -delete 2>/dev/null || true
        docker system prune -f
        success "Old logs and Docker resources cleaned"
    fi
}

# Main monitoring function
main() {
    local start_time=$(date +%s)
    
    log "🔍 Starting monitoring check for $APP_NAME..."
    
    # Ensure log directory exists
    mkdir -p $LOG_DIR
    
    # Load environment variables if available
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
    fi
    
    local checks_failed=0
    
    # Run monitoring checks
    check_system_resources || ((checks_failed++))
    check_docker_services || ((checks_failed++))
    check_api_health || ((checks_failed++))
    check_frontend || ((checks_failed++))
    check_database_performance || ((checks_failed++))
    check_error_logs || ((checks_failed++))
    
    # Optional checks
    [ ! -z "$PRODUCTION_DOMAIN" ] && check_ssl_certificate "$PRODUCTION_DOMAIN"
    
    # Performance monitoring
    performance_monitoring
    
    # Auto-remediation if enabled
    [ "${AUTO_REMEDIATION:-true}" = "true" ] && auto_remediation
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $checks_failed -eq 0 ]; then
        success "✅ All monitoring checks passed in ${duration}s"
    else
        error "❌ $checks_failed monitoring checks failed in ${duration}s"
        send_alert "$checks_failed monitoring checks failed" "error"
    fi
    
    # Generate report if requested
    [ "${GENERATE_REPORT:-false}" = "true" ] && generate_report
}

# Help function
show_help() {
    cat << EOF
Reddit Idea Finder Monitoring Script

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    --check-only        Run checks without auto-remediation
    --report            Generate monitoring report
    --performance       Run only performance monitoring
    --quiet             Suppress output (logs only)

Environment Variables:
    SLACK_WEBHOOK_URL   Slack webhook for alerts
    ALERT_EMAIL         Email address for alerts
    REPORT_EMAIL        Email address for reports
    AUTO_REMEDIATION    Enable auto-remediation (default: true)
    PRODUCTION_DOMAIN   Domain for SSL check

Examples:
    $0                  # Full monitoring check
    $0 --check-only     # Check without auto-remediation
    $0 --report         # Generate detailed report
    $0 --performance    # Performance monitoring only

This script should be run regularly via cron:
    */5 * * * * /opt/reddit-idea-finder/scripts/monitoring.sh --quiet

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --check-only)
        AUTO_REMEDIATION=false
        main
        ;;
    --report)
        GENERATE_REPORT=true
        main
        ;;
    --performance)
        performance_monitoring
        exit 0
        ;;
    --quiet)
        exec 1>/dev/null
        main
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