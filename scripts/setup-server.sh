#!/bin/bash

# Reddit Idea Finder - Server Setup Script
# This script sets up a fresh Ubuntu server for production deployment

set -e

# Configuration
APP_NAME="reddit-idea-finder"
APP_USER="ubuntu"
APP_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "Please run this script as root or with sudo"
        exit 1
    fi
}

# System updates and basic packages
install_system_packages() {
    log "Updating system packages..."
    apt update && apt upgrade -y
    
    log "Installing essential packages..."
    apt install -y \
        curl \
        wget \
        git \
        htop \
        nano \
        vim \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        jq \
        fail2ban \
        ufw \
        logrotate \
        cron
    
    success "System packages installed"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js..."
    
    # Install Node.js 18 LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Install global packages
    npm install -g pm2
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    pm2_version=$(pm2 --version)
    
    success "Node.js installed: $node_version, npm: $npm_version, PM2: $pm2_version"
}

# Install Docker and Docker Compose
install_docker() {
    log "Installing Docker..."
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Install Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Add user to docker group
    usermod -aG docker $APP_USER
    
    # Enable Docker service
    systemctl enable docker
    systemctl start docker
    
    # Verify installation
    docker_version=$(docker --version)
    compose_version=$(docker-compose --version)
    
    success "Docker installed: $docker_version"
    success "Docker Compose installed: $compose_version"
}

# Install PostgreSQL client tools
install_postgresql_client() {
    log "Installing PostgreSQL client tools..."
    
    apt install -y postgresql-client-15
    
    success "PostgreSQL client tools installed"
}

# Install Python for scraper development
install_python() {
    log "Installing Python..."
    
    apt install -y python3 python3-pip python3-venv
    
    # Verify installation
    python_version=$(python3 --version)
    pip_version=$(pip3 --version)
    
    success "Python installed: $python_version, pip: $pip_version"
}

# Configure firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Reset firewall
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (change port if needed)
    ufw allow 22/tcp
    ufw allow 2222/tcp  # Alternative SSH port
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports (restrict to localhost)
    ufw allow from 127.0.0.1 to any port 3000  # Frontend
    ufw allow from 127.0.0.1 to any port 3001  # API
    ufw allow from 127.0.0.1 to any port 5432  # PostgreSQL
    ufw allow from 127.0.0.1 to any port 6379  # Redis
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall configured"
}

# Configure fail2ban for SSH protection
setup_fail2ban() {
    log "Configuring fail2ban..."
    
    # Create local jail configuration
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh,2222
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF
    
    # Start and enable fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    success "fail2ban configured"
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    apt install -y nginx
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create basic configuration
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    # Enable and start Nginx
    systemctl enable nginx
    systemctl start nginx
    
    success "Nginx installed and configured"
}

# Create application directories
create_app_directories() {
    log "Creating application directories..."
    
    # Create main application directory
    mkdir -p $APP_DIR
    chown $APP_USER:$APP_USER $APP_DIR
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    chown $APP_USER:$APP_USER $BACKUP_DIR
    
    # Create logs directory
    mkdir -p /var/log/$APP_NAME
    chown $APP_USER:$APP_USER /var/log/$APP_NAME
    
    success "Application directories created"
}

# Setup logrotate for application logs
setup_logrotate() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 0644 $APP_USER $APP_USER
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
        docker-compose -f $APP_DIR/docker-compose.production.yml restart api > /dev/null 2>&1 || true
    endscript
}
EOF
    
    success "Log rotation configured"
}

# Install SSL certificate with Let's Encrypt
install_ssl() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        warning "No domain provided, skipping SSL setup"
        return
    fi
    
    log "Installing SSL certificate for $domain..."
    
    # Install certbot
    apt install -y certbot python3-certbot-nginx
    
    # Get certificate
    certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    success "SSL certificate installed for $domain"
}

# Setup monitoring tools
install_monitoring() {
    log "Setting up monitoring tools..."
    
    # Install htop, iotop, netstat
    apt install -y htop iotop net-tools
    
    # Create monitoring script
    cat > /usr/local/bin/system-monitor.sh << EOF
#!/bin/bash
# System monitoring script

echo "=== System Status ==="
echo "Date: \$(date)"
echo "Uptime: \$(uptime)"
echo ""

echo "=== Memory Usage ==="
free -h
echo ""

echo "=== Disk Usage ==="
df -h
echo ""

echo "=== Docker Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Service Status ==="
systemctl status nginx --no-pager -l
systemctl status docker --no-pager -l
echo ""

echo "=== Recent Logs ==="
tail -n 10 /var/log/$APP_NAME/*.log 2>/dev/null || echo "No application logs found"
EOF
    
    chmod +x /usr/local/bin/system-monitor.sh
    
    success "Monitoring tools installed"
}

# Create deployment user and SSH keys
setup_deployment_user() {
    log "Setting up deployment user..."
    
    # Create deploy user if it doesn't exist
    if ! id "deploy" &>/dev/null; then
        useradd -m -s /bin/bash deploy
        usermod -aG docker deploy
        usermod -aG sudo deploy
    fi
    
    # Create SSH directory
    mkdir -p /home/deploy/.ssh
    chown deploy:deploy /home/deploy/.ssh
    chmod 700 /home/deploy/.ssh
    
    # Create authorized_keys file (user will need to add their public key)
    touch /home/deploy/.ssh/authorized_keys
    chown deploy:deploy /home/deploy/.ssh/authorized_keys
    chmod 600 /home/deploy/.ssh/authorized_keys
    
    warning "Remember to add your SSH public key to /home/deploy/.ssh/authorized_keys"
    
    success "Deployment user created"
}

# Setup scheduled tasks
setup_cron_jobs() {
    log "Setting up scheduled tasks..."
    
    # Create backup script
    cat > /usr/local/bin/backup-database.sh << EOF
#!/bin/bash
# Database backup script

DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_\$DATE.sql.gz"

# Create backup
docker-compose -f $APP_DIR/docker-compose.production.yml exec -T postgres pg_dump -U postgres reddit_idea_finder | gzip > \$BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_FILE"
EOF
    
    chmod +x /usr/local/bin/backup-database.sh
    
    # Add to crontab for app user
    sudo -u $APP_USER crontab -l 2>/dev/null | { cat; echo "0 2 * * * /usr/local/bin/backup-database.sh"; } | sudo -u $APP_USER crontab -
    
    success "Scheduled tasks configured"
}

# Main setup function
main() {
    log "🚀 Starting server setup for $APP_NAME..."
    
    check_root
    install_system_packages
    install_nodejs
    install_docker
    install_postgresql_client
    install_python
    setup_firewall
    setup_fail2ban
    install_nginx
    create_app_directories
    setup_logrotate
    install_monitoring
    setup_deployment_user
    setup_cron_jobs
    
    success "🎉 Server setup completed successfully!"
    
    cat << EOF

📋 Next Steps:
1. Add your SSH public key to /home/deploy/.ssh/authorized_keys
2. Clone your repository to $APP_DIR
3. Configure your environment variables (.env.production)
4. Run SSL setup if you have a domain: sudo $0 --ssl yourdomain.com
5. Deploy your application: ./scripts/deploy.sh

📊 Useful Commands:
- Check system status: /usr/local/bin/system-monitor.sh
- View application logs: docker-compose -f $APP_DIR/docker-compose.production.yml logs
- Restart services: docker-compose -f $APP_DIR/docker-compose.production.yml restart
- Check firewall status: sudo ufw status
- View fail2ban status: sudo fail2ban-client status

🔒 Security Notes:
- SSH is protected by fail2ban
- Firewall is configured to allow only necessary ports
- Consider changing the default SSH port (22) for additional security
- Regularly update the system: sudo apt update && sudo apt upgrade

EOF
}

# Help function
show_help() {
    cat << EOF
Reddit Idea Finder Server Setup Script

Usage: $0 [OPTIONS]

Options:
    -h, --help         Show this help message
    --ssl DOMAIN       Install SSL certificate for domain
    --monitoring-only  Install only monitoring tools

Examples:
    $0                          # Full server setup
    $0 --ssl yourdomain.com    # Setup SSL for domain
    $0 --monitoring-only       # Install only monitoring

This script will:
- Update system packages
- Install Node.js, Docker, PostgreSQL client, Python
- Configure firewall and fail2ban
- Install and configure Nginx
- Set up monitoring tools
- Create application directories
- Configure log rotation
- Set up scheduled backups

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --ssl)
        if [ -z "$2" ]; then
            error "Domain name required for SSL setup"
            exit 1
        fi
        install_ssl "$2"
        exit 0
        ;;
    --monitoring-only)
        install_monitoring
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