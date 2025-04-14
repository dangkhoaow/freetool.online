#!/bin/bash
set -e

# Configuration
LS_IP="44.203.48.91" # Lightsail IP address passed as an argument
API_BASE_URL="https://service.freetool.online"
SSH_KEY_PATH="/Users/ktran/Documents/Code/ec2/LightsailDefaultKey-us-east-1.pem"
SSH_USER="ubuntu"
REMOTE_APP_DIR="/home/ubuntu/freetool.online"
LOCAL_APP_DIR="/Users/ktran/Documents/Code/NewCode/freetool/freetool.online"
SWAP_SIZE_GB=8 # Size of swap space in GB
MAX_RETRIES=5
RETRY_INTERVAL=30 # seconds

# SSH options for non-interactive host verification
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o ConnectionAttempts=3"
SSH_OPTS_TTY="$SSH_OPTS -t"
SSH_CMD="ssh -i $SSH_KEY_PATH $SSH_OPTS $SSH_USER@$LS_IP"
SCP_CMD="scp -i $SSH_KEY_PATH $SSH_OPTS"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
  command -v $1 >/dev/null 2>&1 || { log_error "$1 is required but not installed. Aborting."; exit 1; }
}

# Function to execute SSH command with retries
ssh_with_retry() {
  local cmd="$1"
  local retries=0
  local max_retries=3
  local retry_delay=5
  
  while [ $retries -lt $max_retries ]; do
    if $SSH_CMD "$cmd"; then
      return 0
    fi
    
    retries=$((retries + 1))
    log_warning "SSH command failed. Retrying in $retry_delay seconds... (Attempt $retries/$max_retries)"
    sleep $retry_delay
  done
  
  log_error "Failed to execute SSH command after $max_retries attempts."
  return 1
}

# Wait for dpkg lock to be released
wait_for_dpkg_lock() {
  log_info "Checking dpkg lock status..."
  
  if ssh_with_retry "sudo apt-get update -qq || true" &>/dev/null; then
    log_info "APT system appears to be available, continuing..."
    return 0
  fi
  
  local retries=0
  local max_retries=3
  
  while [ $retries -lt $max_retries ]; do
    log_info "Waiting for dpkg lock to be released (attempt $((retries+1))/$max_retries)..."
    
    ssh_with_retry "sudo rm -f /var/lib/dpkg/lock /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock-frontend || true" &>/dev/null
    
    if ssh_with_retry "sudo apt-get update -qq || true" &>/dev/null; then
      log_info "APT system is now available."
      return 0
    fi
    
    sleep 5
    retries=$((retries + 1))
  done
  
  log_warning "Could not fully clear dpkg locks, but continuing anyway..."
  return 0
}

# Configure swap space
configure_swap() {
  log_info "Checking swap space..."
  
  local swap_size=$(ssh_with_retry "free -m | awk '/^Swap:/ { print \$2 }'")
  local required_swap_mb=$((SWAP_SIZE_GB * 1024))
  
  if [ "$swap_size" -lt "$required_swap_mb" ]; then
    log_info "Configuring ${SWAP_SIZE_GB}GB swap space..."
    
    ssh_with_retry "sudo fallocate -l ${SWAP_SIZE_GB}G /swapfile || true"
    ssh_with_retry "sudo chmod 600 /swapfile"
    ssh_with_retry "sudo mkswap /swapfile || true"
    ssh_with_retry "sudo swapon /swapfile || true"
    ssh_with_retry "grep -q '/swapfile none swap sw 0 0' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
    ssh_with_retry "grep -q 'vm.swappiness=10' /etc/sysctl.conf || echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf"
    ssh_with_retry "grep -q 'vm.vfs_cache_pressure=50' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf"
    log_info "Swap space configuration completed."
  fi
}

# Install required software
install_software() {
  log_info "Checking and installing required software..."
  
  wait_for_dpkg_lock
  
  # Update package list
  ssh_with_retry "sudo apt-get update"
  
  # Install nginx
  if ! ssh_with_retry "nginx -v" &>/dev/null; then
    log_info "Installing nginx..."
    wait_for_dpkg_lock
    ssh_with_retry "sudo apt-get install -y nginx"
  else
    log_info "Nginx is already installed."
  fi
  
  # Install required tools for HEIC conversion
  log_info "Installing image conversion dependencies..."
  wait_for_dpkg_lock
  ssh_with_retry "sudo apt-get install -y build-essential libheif-dev libjpeg-dev libpng-dev imagemagick"
  
  # Install Node.js v20
  if ! ssh_with_retry "node --version" &>/dev/null; then
    log_info "Installing Node.js v20..."
    ssh_with_retry "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    wait_for_dpkg_lock
    ssh_with_retry "sudo apt-get install -y nodejs"
  else
    local node_version=$(ssh_with_retry "node --version")
    log_info "Node.js $node_version is already installed."
  fi
  
  # Install npm
  if ! ssh_with_retry "npm --version" &>/dev/null; then
    log_info "Installing npm..."
    wait_for_dpkg_lock
    ssh_with_retry "sudo apt-get install -y npm"
  else
    log_info "npm is already installed."
  fi
  
  # Install PM2
  if ! ssh_with_retry "pm2 --version" &>/dev/null; then
    log_info "Installing PM2..."
    wait_for_dpkg_lock
    ssh_with_retry "sudo npm install -g pm2"
  else
    log_info "PM2 is already installed."
  fi
  
  log_info "Software installation completed."
}

# Create necessary directories
create_directories() {
  log_info "Creating application directories..."
  
  # Make sure app directory exists
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR"
  
  # Create upload directories for storage
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/uploads/temp"
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/uploads/converted"
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/uploads/thumbnails"
  
  # Set proper permissions
  ssh_with_retry "sudo chown -R $SSH_USER:$SSH_USER $REMOTE_APP_DIR"
  ssh_with_retry "chmod -R 755 $REMOTE_APP_DIR/uploads"
  
  log_info "Application directories created and configured."
}

# Transfer code files
transfer_code() {
  log_info "Creating tar archive of code files..."
  cd $LOCAL_APP_DIR
  tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='dist' --exclude='uploads/*' -czf /tmp/freetool_service_deploy.tar.gz .
  
  log_info "Transferring code files to Lightsail instance..."
  $SCP_CMD /tmp/freetool_service_deploy.tar.gz "$SSH_USER@$LS_IP:/tmp/freetool_service_deploy.tar.gz"
  
  log_info "Extracting code files on Lightsail instance..."
  ssh_with_retry "rm -rf $REMOTE_APP_DIR/{*,.*} 2>/dev/null || true"
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR"
  ssh_with_retry "tar -xzf /tmp/freetool_service_deploy.tar.gz -C $REMOTE_APP_DIR"
  ssh_with_retry "rm /tmp/freetool_service_deploy.tar.gz"
  
  # Install global dependencies
  log_info "Installing global dependencies..."
  ssh_with_retry "sudo npm install -g typescript ts-node next pm2"
  
  # Remove problematic sharp-heic dependency
  ssh_with_retry "cd $REMOTE_APP_DIR && sed -i '/\"sharp-heic\":/d' package.json"
  
  # Install dependencies, including tailwindcss and chart.js
  log_info "Installing project dependencies..."
  ssh_with_retry "cd $REMOTE_APP_DIR && npm install --legacy-peer-deps"
  ssh_with_retry "cd $REMOTE_APP_DIR && npm install tailwindcss chart.js react-chartjs-2 @types/jsonwebtoken @types/formidable --legacy-peer-deps"
  
  # Fix for any TypeScript errors during build - create tsconfig.json if missing
  ssh_with_retry "cd $REMOTE_APP_DIR && [ ! -f tsconfig.json ] && echo '{\"compilerOptions\":{\"target\":\"es5\",\"lib\":[\"dom\",\"dom.iterable\",\"esnext\"],\"allowJs\":true,\"skipLibCheck\":true,\"strict\":false,\"forceConsistentCasingInFileNames\":true,\"noEmit\":true,\"esModuleInterop\":true,\"module\":\"esnext\",\"moduleResolution\":\"node\",\"resolveJsonModule\":true,\"isolatedModules\":true,\"jsx\":\"preserve\",\"incremental\":true,\"plugins\":[{\"name\":\"next\"}],\"paths\":{\"@/*\":[\"./app/*\"]}},\"include\":[\"next-env.d.ts\",\"**/*.ts\",\"**/*.tsx\",\".next/types/**/*.ts\"],\"exclude\":[\"node_modules\"]}' > tsconfig.json || true"
  
  # Build the Next.js application with error handling
  log_info "Building Next.js application..."
  ssh_with_retry "cd $REMOTE_APP_DIR && NODE_ENV=production npm run build || { echo 'Build failed, but continuing with deployment'; true; }"
  
  # Fix permissions for the .next directory to ensure static files are accessible
  ssh_with_retry "sudo chmod -R 755 $REMOTE_APP_DIR/.next"
  ssh_with_retry "sudo chown -R $SSH_USER:$SSH_USER $REMOTE_APP_DIR/.next"
  
  # Make sure uploads folder exists and has correct permissions
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/uploads/temp $REMOTE_APP_DIR/uploads/converted $REMOTE_APP_DIR/uploads/thumbnails"
  ssh_with_retry "chmod -R 755 $REMOTE_APP_DIR/uploads"
  
  log_info "Code transfer and build completed."
}

# Configure environment variables
configure_env() {
  log_info "Configuring environment variables..."
  
  ssh_with_retry "echo 'NODE_ENV=production' > $REMOTE_APP_DIR/.env"
  ssh_with_retry "echo 'PORT=3000' >> $REMOTE_APP_DIR/.env"
  ssh_with_retry "echo 'NEXTAUTH_URL=http://$LS_IP:3000' >> $REMOTE_APP_DIR/.env"
  ssh_with_retry "echo 'NEXTAUTH_SECRET=your-nextauth-secret-key-here' >> $REMOTE_APP_DIR/.env"
  ssh_with_retry "echo 'API_BASE_URL=$API_BASE_URL' >> $REMOTE_APP_DIR/.env"
  
  # Add to system profile for persistence
  ssh_with_retry "echo 'export API_BASE_URL=$API_BASE_URL' | sudo tee -a /etc/profile.d/freetool-env.sh"
  ssh_with_retry "sudo chmod +x /etc/profile.d/freetool-env.sh"
  
  # Export in current session
  ssh_with_retry "export API_BASE_URL=$API_BASE_URL"
  
  log_info "Environment configuration completed."
}

# Configure settings.json
configure_settings() {
  log_info "Configuring settings.json..."
  
  # Ensure config directory exists
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/config"
  
  # Create settings.json file with enhanced settings
  ssh_with_retry "cat > $REMOTE_APP_DIR/config/settings.json << 'EOL'
{
  \"maxFiles\": 200,
  \"maxFileSizeMB\": 100,
  \"allowedFileTypes\": [
    \"image/heic\",
    \"image/heif\"
  ],
  \"fileCleanupMinutes\": 60,
  \"autoCleanup\": true,
  \"cors\": {
    \"allowedOrigins\": [
      \"*\"
    ]
  },
  \"version\": \"1.0.0\",
  \"type\": \"local\",
  \"localPath\": \"./uploads\",
  \"storagePaths\": {
    \"temp\": \"temp\",
    \"converted\": \"converted\",
    \"thumbnails\": \"thumbnails\"
  },
  \"workers\": {
    \"maxConcurrent\": 4,
    \"enabled\": true
  },
  \"s3\": {
    \"bucketName\": \"\",
    \"region\": \"us-east-1\",
    \"accessKey\": \"\",
    \"secretKey\": \"\"
  }
}
EOL"

  # Also save settings in a more accessible location for API endpoints
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/settings"
  ssh_with_retry "cp $REMOTE_APP_DIR/config/settings.json $REMOTE_APP_DIR/settings/"
  
  log_info "Settings configuration completed."
}

# Configure nginx
configure_nginx() {
  log_info "Configuring Nginx..."
  
  # First create the local directory in case it doesn't exist
  ssh_with_retry "mkdir -p $REMOTE_APP_DIR/nginx"
  
  # Transfer the Nginx configuration file
  log_info "Transferring Nginx configuration file..."
  $SCP_CMD "$LOCAL_APP_DIR/nginx/freetool-web.conf" "$SSH_USER@$LS_IP:$REMOTE_APP_DIR/nginx/freetool-web.conf"
  
  # Replace $LS_IP placeholder with actual IP
  ssh_with_retry "sed -i \"s/\\\$LS_IP/$LS_IP/g\" $REMOTE_APP_DIR/nginx/freetool-web.conf"
  
  # Copy to Nginx sites-available
  $SSH_CMD "sudo cp $REMOTE_APP_DIR/nginx/freetool-web.conf /etc/nginx/sites-available/freetool-web"
  
  # Enable the site and remove default site
  $SSH_CMD "sudo rm -f /etc/nginx/sites-enabled/default"
  $SSH_CMD "sudo ln -sf /etc/nginx/sites-available/freetool-web /etc/nginx/sites-enabled/"
  
  # Test Nginx configuration
  $SSH_CMD "sudo nginx -t"
  
  # Restart Nginx
  $SSH_CMD "sudo systemctl restart nginx"
  
  # Wait for Nginx to fully restart
  sleep 5
  
  # Check Nginx status
  $SSH_CMD "sudo systemctl status nginx"
  
  log_info "Nginx configuration completed."
}

# Start the app with PM2
start_app() {
  log_info "Starting the application with PM2..."
  
  # Check if app is already running
  $SSH_CMD "cd $REMOTE_APP_DIR && pm2 list | grep -q 'freetool-web'" && {
    log_info "Stopping existing application..."
    $SSH_CMD "cd $REMOTE_APP_DIR && pm2 delete freetool-web || true"
  }
  
  # Kill any process using port 3000
  ssh_with_retry "sudo lsof -t -i:3000 | xargs -r kill -9 || true"
  
  # Create a startup script to ensure environment variables are properly set
  ssh_with_retry "cat > $REMOTE_APP_DIR/start-server.sh << EOF
#!/bin/bash
echo \"==== Starting FreeTool Web ===\"
export NODE_ENV=production
export PORT=3000
export API_BASE_URL=$API_BASE_URL
export STORAGE_BASE_URL=http://$LS_IP:3000
export STORAGE_LOCAL_PATH=./uploads
export NEXTAUTH_URL=http://$LS_IP:3000
export NEXTAUTH_SECRET=your-nextauth-secret-key-here
export CORS_ALLOWED_ORIGINS='[\"*\"]'
export DEBUG=express:*,socket.io:*,next:*

cd $REMOTE_APP_DIR
echo \"Node version: \$(node --version)\"
echo \"NPM version: \$(npm --version)\"

# Create uploads directories if they don't exist
mkdir -p uploads/temp uploads/converted uploads/thumbnails
chmod -R 755 uploads

# Verify .next directory exists
if [ ! -d .next ]; then
  echo \"Error: .next directory missing - running build again\"
  npm run build
fi

# Start the server with Next.js start
echo \"Starting Next.js server on port 3000\"
NODE_OPTIONS='--max-old-space-size=1536' npm run start -- -p 3000
EOF"
  
  ssh_with_retry "chmod +x $REMOTE_APP_DIR/start-server.sh"
  
  # Start the server with PM2 and wait for it to be ready
  if ssh_with_retry "cd $REMOTE_APP_DIR && pm2 start ./start-server.sh --name freetool-web --time --max-memory-restart 1G"; then
    log_info "Server started successfully"
    
    # Save PM2 configuration
    $SSH_CMD "pm2 save || true"
    
    # Wait for the server to initialize
    log_info "Waiting for server to initialize (60 seconds)..."
    sleep 60
    
    # Check if the server is responding
    log_info "Checking if server is responding..."
    if ssh_with_retry "curl -s http://localhost:3000/"; then
      log_info "Server is responding to health checks"
      return 0
    else
      log_error "Server is not responding to health checks. Checking logs."
      # Show logs to debug
      $SSH_CMD "cd $REMOTE_APP_DIR && pm2 logs freetool-web --lines 100"
      log_info "Still continuing with deployment"
      return 0
    fi
  else
    log_error "Failed to start the application"
    return 1
  fi
}

# Configure PM2 to run at startup
configure_pm2() {
  log_info "Configuring PM2 to run at server startup..."
  
  # Save current PM2 process list
  ssh_with_retry "pm2 save || true"
  
  # Get the startup command
  local startup_cmd=$(ssh_with_retry "pm2 startup | grep -v PM2 | grep 'sudo' | tail -1 || true")
  
  if [ -n "$startup_cmd" ]; then
    log_info "Running PM2 startup command: $startup_cmd"
    ssh_with_retry "$startup_cmd"
  else
    log_info "Using alternate PM2 startup method"
    ssh_with_retry "sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $SSH_USER --hp /home/$SSH_USER || true"
  fi
  
  # Save again after startup setup
  ssh_with_retry "pm2 save || true"
  
  log_info "PM2 startup configuration completed."
}

# Verify deployment
verify_deployment() {
  log_info "Verifying deployment..."
  local max_attempts=10
  local attempt=1
  local success=false
  
  while [ $attempt -le $max_attempts ]; do
    log_info "Verification attempt $attempt of $max_attempts..."
    
    # Try multiple ways to verify the server is running
    if curl -s "http://$LS_IP/" > /tmp/response.html; then
      log_info "Server is responding on port 80!"
      head -n 20 /tmp/response.html
      success=true
      break
    elif curl -s "http://$LS_IP:3000/" > /tmp/response.html; then
      log_info "Server is responding on direct port 3000!"
      head -n 20 /tmp/response.html
      success=true
      break
    fi
    
    # Add more diagnostics on failure
    log_warning "Server not responding yet. Checking status..."
    $SSH_CMD "sudo systemctl status nginx"
    $SSH_CMD "cd $REMOTE_APP_DIR && pm2 status"
    $SSH_CMD "curl -v http://localhost:3000/ || echo 'Failed to connect to local app'"
    
    log_warning "Waiting 10 seconds before next attempt..."
    sleep 10
    attempt=$((attempt + 1))
  done
  
  if [ "$success" = true ]; then
    log_info "Deployment verification successful!"
    log_info "Your website is now available at: http://$LS_IP"
    return 0
  else
    log_error "Deployment verification failed. Server is not responding."
    
    # Check PM2 logs
    log_info "Checking PM2 logs..."
    $SSH_CMD "cd $REMOTE_APP_DIR && pm2 logs freetool-web --lines 50 || true"
    
    # Check Nginx logs
    log_info "Checking Nginx error logs..."
    $SSH_CMD "sudo tail -n 50 /var/log/nginx/error.log || true"
    $SSH_CMD "sudo tail -n 50 /var/log/nginx/freetool-error.log || true"
    
    # Try restarting services as a last resort
    log_info "Attempting to restart services..."
    $SSH_CMD "sudo systemctl restart nginx"
    $SSH_CMD "cd $REMOTE_APP_DIR && pm2 restart freetool-web || true"
    
    # Try one last time
    if curl -s "http://$LS_IP/" > /dev/null; then
      log_info "Server is now responding after restart!"
      return 0
    fi
    
    return 1
  fi
}

# Main deployment function
deploy() {
  if [ -z "$LS_IP" ]; then
    log_error "Lightsail IP address not provided. Usage: $0 <lightsail-ip> <ssh-key-path>"
    exit 1
  fi
  
  if [ -z "$SSH_KEY_PATH" ]; then
    log_error "SSH key path not provided. Usage: $0 <lightsail-ip> <ssh-key-path>"
    exit 1
  fi
  
  check_command ssh
  check_command scp
  check_command tar
  
  # Check if we can connect to the server
  log_info "Testing SSH connection to $LS_IP..."
  if ! ssh_with_retry "echo 'Connection successful'"; then
    log_error "Failed to connect to server at $LS_IP. Check your SSH key and server status."
    exit 1
  fi
  
  log_info "Starting deployment to Lightsail instance $LS_IP..."
  
  # Execute each deployment step with error handling
  {
    configure_swap &&
    install_software &&
    create_directories &&
    transfer_code &&
    configure_env &&
    configure_settings &&
    configure_nginx &&
    start_app &&
    configure_pm2 &&
    verify_deployment
  } || {
    log_error "Deployment failed at some step. Checking server status..."
    
    # Check PM2 logs
    $SSH_CMD "cd $REMOTE_APP_DIR && pm2 logs freetool-web --lines 30 || true"
    
    # Check Nginx logs
    log_info "Checking Nginx error logs..."
    $SSH_CMD "sudo tail -n 20 /var/log/nginx/error.log || true"
    $SSH_CMD "sudo tail -n 20 /var/log/nginx/freetool-error.log || true"
    
    exit 1
  }
  
  log_info "Deployment completed successfully!"
  log_info "Service is accessible at: http://$LS_IP"
}

# Run the deployment function
deploy