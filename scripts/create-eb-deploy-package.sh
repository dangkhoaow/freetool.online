#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Create a temporary directory for the package
TEMP_DIR=$(mktemp -d)
ZIP_FILE="eb-deploy-package.zip"

echo "Creating deployment package in: $TEMP_DIR"

# === BUILD LOCALLY FIRST ===
echo "===== STEP 1: Installing dependencies and building locally ====="
# Use --force to bypass dependency conflicts
npm install --legacy-peer-deps --force

# Install tailwindcss and UI component dependencies explicitly with --force
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography --legacy-peer-deps --force
npm install shadcn-ui @radix-ui/react-slot --legacy-peer-deps --force

# Try to build the app locally
echo "Building Next.js application locally..."
npm run build

# Check if the build succeeded
if [ ! -d ".next" ]; then
  echo "ERROR: Local build failed - .next directory not found!"
  echo "Fix your build issues before deploying."
  rm -rf $TEMP_DIR
  exit 1
fi

# === COPY PROJECT FILES TO TEMP DIR ===
echo "===== STEP 2: Copying project files to temporary directory ====="
rsync -av --exclude="node_modules" \
         --exclude=".git" \
         --exclude="$ZIP_FILE" \
         --exclude="dist" \
         --exclude="uploads/*" \
         --exclude="logs/*" \
         . $TEMP_DIR/

# === COPY BUILD OUTPUT TO TEMP DIR ===
echo "===== STEP 3: Copying build output (.next directory) ====="
rsync -av .next/ $TEMP_DIR/.next/

# Verify .next directory was copied
if [ ! -d "$TEMP_DIR/.next" ]; then
  echo "ERROR: Failed to copy .next directory to package"
  rm -rf $TEMP_DIR
  exit 1
fi

# === CONFIGURE DEPLOYMENT ===
echo "===== STEP 4: Configuring deployment files ====="

# Remove any existing .ebextensions to avoid conflicts
echo "Setting up .ebextensions..."
rm -rf $TEMP_DIR/.ebextensions
mkdir -p $TEMP_DIR/.ebextensions

# Create a simple .config file with minimal settings
cat > $TEMP_DIR/.ebextensions/env.config <<EOL
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
    API_BASE_URL: https://service.freetool.online
    AWS_REGION: us-east-1
    SWAP_SIZE_MB: 4096
  
  # Health check configuration
  aws:elasticbeanstalk:environment:process:default:
    HealthCheckPath: /health
    MatcherHTTPCode: 200
    Port: 8080
    Protocol: HTTP
  
  # Auto-scaling configuration
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 4
  
  # Launch configuration
  aws:autoscaling:launchconfiguration:
    MonitoringInterval: 1 minute
    
  # Enable load balancing for high availability
  aws:elasticbeanstalk:environment:
    LoadBalancerType: application
EOL

# Add NVMe disk configuration
cat > $TEMP_DIR/.ebextensions/nvme-storage.config <<EOL
files:
  "/usr/local/bin/setup-nvme-storage.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/bin/bash
      # Set up NVMe storage for uploads directory if available
      
      # Get the SWAP_SIZE_MB from environment or use default
      SWAP_SIZE_MB=\${SWAP_SIZE_MB:-4096}
      
      # Check if nvme1n1 exists
      if lsblk | grep -q nvme1n1; then
        echo "NVMe disk (nvme1n1) detected."
        
        # Ensure NVMe disk is formatted
        if ! blkid /dev/nvme1n1 > /dev/null; then
          echo "Formatting NVMe disk..."
          mkfs -t xfs /dev/nvme1n1
        fi
        
        # Create persistent mount point outside application directory
        NVME_MOUNT="/mnt/nvme_data"
        mkdir -p \$NVME_MOUNT
        
        # Mount NVMe to persistent location first
        if ! mountpoint -q \$NVME_MOUNT; then
          echo "Mounting NVMe disk to \$NVME_MOUNT..."
          mount /dev/nvme1n1 \$NVME_MOUNT
          
          # Add to fstab for persistence
          if ! grep -q "/dev/nvme1n1.*\$NVME_MOUNT" /etc/fstab; then
            echo "/dev/nvme1n1 \$NVME_MOUNT xfs defaults,nofail 0 2" >> /etc/fstab
          fi
          
          echo "NVMe disk mounted to \$NVME_MOUNT successfully."
        else
          echo "NVMe disk already mounted to \$NVME_MOUNT."
        fi
        
        # Create the application uploads directory
        UPLOAD_DIR="/var/app/current/uploads"
        mkdir -p \$UPLOAD_DIR
        
        # Create application upload directories on NVMe volume
        mkdir -p \$NVME_MOUNT/uploads/{temp,converted,thumbnails}
        
        # Use bind mounts to link the NVMe storage to the application directory
        echo "Setting up bind mount from \$NVME_MOUNT/uploads to \$UPLOAD_DIR..."
        mount --bind \$NVME_MOUNT/uploads \$UPLOAD_DIR
        
        # Add bind mount to fstab for persistence
        if ! grep -q "\$NVME_MOUNT/uploads.*\$UPLOAD_DIR" /etc/fstab; then
          echo "\$NVME_MOUNT/uploads \$UPLOAD_DIR none bind 0 0" >> /etc/fstab
        fi
        
        # Set permissions
        chown -R webapp:webapp \$UPLOAD_DIR
        chmod -R 0755 \$UPLOAD_DIR
        chown -R webapp:webapp \$NVME_MOUNT/uploads
        chmod -R 0755 \$NVME_MOUNT/uploads
        
        echo "Uploads directory bind mounted successfully."
        
        # Create swap file in persistent location
        SWAP_FILE="\$NVME_MOUNT/swap.1"
        
        if [ ! -f "\$SWAP_FILE" ] || ! swapon -s | grep -q "\$SWAP_FILE"; then
          echo "Creating \${SWAP_SIZE_MB}MB swap file in \$NVME_MOUNT..."
          
          # Remove existing swap if present
          if swapon -s | grep -q "/var/app/current/uploads/swap.1"; then
            echo "Deactivating old swap file in uploads directory..."
            swapoff "/var/app/current/uploads/swap.1" 2>/dev/null
          fi
          
          if swapon -s | grep -q "/mnt/swap.1"; then
            echo "Deactivating old swap file in /mnt..."
            swapoff "/mnt/swap.1" 2>/dev/null
          fi
          
          # Create new swap file
          dd if=/dev/zero of="\$SWAP_FILE" bs=1M count=\$SWAP_SIZE_MB
          chmod 600 "\$SWAP_FILE"
          mkswap "\$SWAP_FILE"
          swapon "\$SWAP_FILE"
          
          # Add to fstab
          if ! grep -q "\$SWAP_FILE" /etc/fstab; then
            echo "\$SWAP_FILE none swap sw 0 0" >> /etc/fstab
          fi
          
          echo "Swap file configured successfully."
        else
          echo "Swap file already exists and is active."
        fi
      else
        echo "No NVMe disk (nvme1n1) detected. Using default storage."
        
        # Create default upload directories
        mkdir -p /var/app/current/uploads/temp /var/app/current/uploads/converted /var/app/current/uploads/thumbnails
        chown -R webapp:webapp /var/app/current/uploads
        chmod -R 0755 /var/app/current/uploads
      fi
      
      exit 0

container_commands:
  01_setup_nvme:
    command: "chmod +x /usr/local/bin/setup-nvme-storage.sh"
    ignoreErrors: true
EOL

# Remove any existing .platform to avoid conflicts
echo "Setting up .platform..."
rm -rf $TEMP_DIR/.platform
mkdir -p $TEMP_DIR/.platform/nginx/conf.d/
mkdir -p $TEMP_DIR/.platform/hooks/prebuild/
mkdir -p $TEMP_DIR/.platform/hooks/predeploy/
mkdir -p $TEMP_DIR/.platform/hooks/postdeploy/

# Get script directory and project root
SCRIPT_DIR="$(dirname "$0")"
NGINX_CONFIG_DIR="$PROJECT_ROOT/config/nginx"

# Check if Nginx config directory exists and create it if it doesn't
if [ ! -d "$NGINX_CONFIG_DIR" ]; then
  echo "Creating Nginx config directory: $NGINX_CONFIG_DIR"
  mkdir -p "$NGINX_CONFIG_DIR"
fi

# Check if required config files exist, create minimal versions if they don't
for CONFIG_FILE in "custom.conf" "custom-fallback.conf" "next-headers.conf" "emergency.conf"; do
  if [ ! -f "$NGINX_CONFIG_DIR/$CONFIG_FILE" ]; then
    echo "Required Nginx config file $NGINX_CONFIG_DIR/$CONFIG_FILE does not exist. Creating a minimal version..."
    
    # Create minimal versions of each required file
    if [ "$CONFIG_FILE" = "custom.conf" ]; then
      cat > "$NGINX_CONFIG_DIR/$CONFIG_FILE" << 'EOL'
upstream nodejs {
  server 127.0.0.1:8080;
  keepalive 256;
}

server {
  listen 80;
  server_name freetool.online;
  client_max_body_size 500M;
  
  location / {
    proxy_pass http://nodejs;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
EOL
    elif [ "$CONFIG_FILE" = "custom-fallback.conf" ]; then
      cat > "$NGINX_CONFIG_DIR/$CONFIG_FILE" << 'EOL'
upstream nodejs {
  server 127.0.0.1:8080;
  keepalive 256;
}

server {
  listen 80;
  server_name freetool.online;
  client_max_body_size 500M;
  
  location / {
    proxy_pass http://nodejs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
EOL
    elif [ "$CONFIG_FILE" = "next-headers.conf" ]; then
      cat > "$NGINX_CONFIG_DIR/$CONFIG_FILE" << 'EOL'
# Map for JavaScript content types
map $uri $content_type_by_extension {
  "~\.js$" "application/javascript";
  "~\.css$" "text/css";
  default "";
}

# Define a named location for headers
location @next_headers {
  add_header Content-Type $content_type_by_extension always;
}
EOL
    elif [ "$CONFIG_FILE" = "emergency.conf" ]; then
      # Only create emergency.conf if it doesn't exist
      if [ ! -f "$NGINX_CONFIG_DIR/$CONFIG_FILE" ]; then
        cat > "$NGINX_CONFIG_DIR/$CONFIG_FILE" << 'EOL'
# Emergency minimal configuration
upstream nodejs {
  server 127.0.0.1:8080;
}

server {
  listen 80;
  server_name freetool.online;
  
  location / {
    proxy_pass http://nodejs;
  }
}
EOL
        echo "Created minimal $CONFIG_FILE"
      else
        echo "Using existing $CONFIG_FILE"
      fi
    fi
    
    # Only echo if we created a file
    if [ "$CONFIG_FILE" != "emergency.conf" ]; then
      echo "Created minimal $CONFIG_FILE"
    fi
  fi
done

# Copy the config files to the deployment package
echo "Copying Nginx configuration files..."
cp "$NGINX_CONFIG_DIR/custom.conf" $TEMP_DIR/.platform/nginx/conf.d/
cp "$NGINX_CONFIG_DIR/next-headers.conf" $TEMP_DIR/.platform/nginx/conf.d/
cp "$NGINX_CONFIG_DIR/custom-fallback.conf" $TEMP_DIR/.platform/nginx/conf.d/

# Only copy emergency.conf if it exists and verify it doesn't create duplicate upstreams
if [ -f "$NGINX_CONFIG_DIR/emergency.conf" ]; then
  echo "Copying emergency.conf to deployment package..."
  cp "$NGINX_CONFIG_DIR/emergency.conf" $TEMP_DIR/.platform/nginx/conf.d/
  
  # Add a comment to emergency.conf to ensure it's only used in emergency situations
  sed -i.bak '1i# This file is only used as a fallback if other configurations fail' $TEMP_DIR/.platform/nginx/conf.d/emergency.conf
  rm -f $TEMP_DIR/.platform/nginx/conf.d/emergency.conf.bak
else
  echo "Warning: emergency.conf not found in $NGINX_CONFIG_DIR"
fi

# Create a predeploy script to handle Nginx configuration
echo "Creating Nginx setup script..."
cat > $TEMP_DIR/.platform/hooks/predeploy/02_setup_nginx.sh <<EOL
#!/bin/bash
# Setup Nginx configuration

echo "===== SETTING UP NGINX CONFIGURATION ====="

# Make sure we have the proxy directory
mkdir -p /var/proxy/staging/nginx/conf.d

# Clean up any existing custom configurations to avoid conflicts
rm -f /var/proxy/staging/nginx/conf.d/custom.conf
rm -f /var/proxy/staging/nginx/conf.d/next-headers.conf
rm -f /var/proxy/staging/nginx/conf.d/custom-fallback.conf
rm -f /var/proxy/staging/nginx/conf.d/emergency.conf

# First copy the headers configuration - it doesn't have upstream blocks
if [ -f "/var/app/current/.platform/nginx/conf.d/next-headers.conf" ]; then
  echo "Copying next-headers.conf from application directory"
  cp /var/app/current/.platform/nginx/conf.d/next-headers.conf /var/proxy/staging/nginx/conf.d/
elif [ -f "/var/app/staging/.platform/nginx/conf.d/next-headers.conf" ]; then
  echo "Copying next-headers.conf from staging directory"
  cp /var/app/staging/.platform/nginx/conf.d/next-headers.conf /var/proxy/staging/nginx/conf.d/
else
  echo "Warning: Could not find next-headers.conf in expected locations"
fi

# Now try to copy our main configuration file
if [ -f "/var/app/current/.platform/nginx/conf.d/custom.conf" ]; then
  echo "Copying custom.conf from application directory"
  cp /var/app/current/.platform/nginx/conf.d/custom.conf /var/proxy/staging/nginx/conf.d/
elif [ -f "/var/app/staging/.platform/nginx/conf.d/custom.conf" ]; then
  echo "Copying custom.conf from staging directory"
  cp /var/app/staging/.platform/nginx/conf.d/custom.conf /var/proxy/staging/nginx/conf.d/
else
  echo "Warning: Could not find custom.conf in expected locations"
fi

# Test Nginx configuration
echo "Testing Nginx configuration..."
if ! /usr/sbin/nginx -t -c /var/proxy/staging/nginx/nginx.conf; then
  echo "Nginx configuration test failed! Using fallback configuration..."
  
  # Remove the failing configuration first to avoid duplicate upstreams
  rm -f /var/proxy/staging/nginx/conf.d/custom.conf
  
  # Use fallback configuration
  if [ -f "/var/app/current/.platform/nginx/conf.d/custom-fallback.conf" ]; then
    echo "Copying fallback configuration from application directory"
    cp /var/app/current/.platform/nginx/conf.d/custom-fallback.conf /var/proxy/staging/nginx/conf.d/custom.conf
  elif [ -f "/var/app/staging/.platform/nginx/conf.d/custom-fallback.conf" ]; then
    echo "Copying fallback configuration from staging directory"
    cp /var/app/staging/.platform/nginx/conf.d/custom-fallback.conf /var/proxy/staging/nginx/conf.d/custom.conf
  else
    echo "Warning: Could not find custom-fallback.conf in expected locations"
  fi
  
  # Test again with fallback configuration
  if ! /usr/sbin/nginx -t -c /var/proxy/staging/nginx/nginx.conf; then
    echo "Fallback configuration also failed! Using emergency configuration..."
    
    # First, remove any existing next-headers.conf which might be causing conflicts
    echo "Moving next-headers.conf to temporary location until we fix it"
    mv /var/proxy/staging/nginx/conf.d/next-headers.conf /tmp/next-headers.conf.bak 2>/dev/null
    
    # Remove the failed fallback configuration
    rm -f /var/proxy/staging/nginx/conf.d/custom.conf
    
    # Use emergency configuration from static file
    if [ -f "/var/app/current/.platform/nginx/conf.d/emergency.conf" ]; then
      echo "Copying emergency configuration from application directory"
      cp /var/app/current/.platform/nginx/conf.d/emergency.conf /var/proxy/staging/nginx/conf.d/custom.conf
    elif [ -f "/var/app/staging/.platform/nginx/conf.d/emergency.conf" ]; then
      echo "Copying emergency configuration from staging directory"
      cp /var/app/staging/.platform/nginx/conf.d/emergency.conf /var/proxy/staging/nginx/conf.d/custom.conf
    else
      echo "ERROR: Could not find emergency.conf in expected locations"
      echo "Deployment may fail due to invalid Nginx configuration"
    fi
    
    # Test with emergency configuration
    if ! /usr/sbin/nginx -t -c /var/proxy/staging/nginx/nginx.conf; then
      echo "Even emergency configuration failed! Nginx might not start properly"
    else
      echo "Emergency configuration test passed - will use minimal configuration"
    fi
  else
    echo "Fallback configuration test passed"
  fi
fi

echo "===== NGINX CONFIGURATION SETUP COMPLETE ====="
exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/predeploy/02_setup_nginx.sh

# Create a predeploy script to deactivate swap before deployment
cat > $TEMP_DIR/.platform/hooks/predeploy/01_deactivate_swap.sh <<EOL
#!/bin/bash
# Safely deactivate swap and unmount NVMe disk before deployment

# Check if swap is active and deactivate it
if swapon -s | grep -q "/var/app/current/uploads/swap.1"; then
  echo "Deactivating swap file before deployment..."
  swapoff /var/app/current/uploads/swap.1
  echo "Swap file deactivated successfully."
fi

# Check if the old swap file in /mnt needs to be deactivated
if swapon -s | grep -q "/mnt/swap.1"; then
  echo "Deactivating swap file in /mnt before deployment..."
  swapoff /mnt/swap.1
  echo "Swap file in /mnt deactivated successfully."
fi

# Check if the swap file in NVMe mount needs to be deactivated
if swapon -s | grep -q "/mnt/nvme_data/swap.1"; then
  echo "Deactivating swap file in NVMe mount before deployment..."
  swapoff "/mnt/nvme_data/swap.1"
  echo "Swap file in NVMe mount deactivated successfully."
fi

# Check if uploads dir is a mount point and unmount it
if mountpoint -q /var/app/current/uploads; then
  echo "Unmounting NVMe disk from /var/app/current/uploads..."
  umount /var/app/current/uploads
  echo "NVMe disk unmounted successfully."
fi

exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/predeploy/01_deactivate_swap.sh

# Create postdeploy hook to set up NVMe storage
cat > $TEMP_DIR/.platform/hooks/postdeploy/01_setup_environment.sh <<EOL
#!/bin/bash
# Set up NVMe storage if available

# Setup NVMe storage
echo "Setting up NVMe storage..."
/usr/local/bin/setup-nvme-storage.sh

# Reload NGINX to apply any changes
/sbin/service nginx reload
exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/postdeploy/01_setup_environment.sh

# Create a predeploy script to install dependencies only (no build)
cat > $TEMP_DIR/.platform/hooks/prebuild/01_install_deps.sh <<EOL
#!/bin/bash
cd /var/app/staging

echo "===== INSTALLING DEPENDENCIES ====="

# First install the most critical dependencies explicitly
echo "Installing core dependencies..."
NODE_OPTIONS=--max_old_space_size=2048 npm install next@latest react@latest react-dom@latest --legacy-peer-deps --force

# Then install all production dependencies
echo "Installing all production dependencies..."
NODE_OPTIONS=--max_old_space_size=2048 npm install --only=production --legacy-peer-deps --force

# Verify next executable exists and is accessible
if [ -f "node_modules/.bin/next" ]; then
  echo "✅ next executable found at node_modules/.bin/next"
  ls -la node_modules/.bin/next
  
  # Create a symlink to make next available in PATH
  echo "Creating symlink to next in /usr/local/bin..."
  ln -sf \$(pwd)/node_modules/.bin/next /usr/local/bin/next
else
  echo "❌ ERROR: next executable not found in node_modules/.bin/"
  echo "Attempting emergency installation of Next.js..."
  npm install next@latest --legacy-peer-deps --force
  
  if [ -f "node_modules/.bin/next" ]; then
    ln -sf \$(pwd)/node_modules/.bin/next /usr/local/bin/next
  fi
fi

echo "===== DEPENDENCIES INSTALLED SUCCESSFULLY ====="
exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/prebuild/01_install_deps.sh

# Create a wrapper script to start Next.js
echo "Creating Next.js start wrapper script..."
cat > $TEMP_DIR/start-next.sh <<EOL
#!/bin/bash
# Wrapper script to ensure Next.js starts properly
export PATH=\$PATH:/var/app/current/node_modules/.bin
cd /var/app/current
echo "Starting Next.js with node_modules/.bin/next..."
NODE_OPTIONS=--max_old_space_size=2048 ./node_modules/.bin/next start -p 8080
EOL
chmod +x $TEMP_DIR/start-next.sh

# Create simple Procfile that just starts the app
echo "Setting up Procfile..."
cat > $TEMP_DIR/Procfile <<EOL
web: if [ -f "./start-next.sh" ]; then ./start-next.sh; elif [ -f "/usr/local/bin/next" ]; then NODE_OPTIONS=--max_old_space_size=2048 /usr/local/bin/next start -p 8080; elif [ -f "node_modules/.bin/next" ]; then NODE_OPTIONS=--max_old_space_size=2048 ./node_modules/.bin/next start -p 8080; else NODE_OPTIONS=--max_old_space_size=2048 npx next start -p 8080; fi
EOL

# Create .npmrc file for legacy peer deps support
cat > $TEMP_DIR/.npmrc <<EOL
legacy-peer-deps=true
EOL

# Update package.json start script
if [ -f "$TEMP_DIR/package.json" ]; then
  echo "Updating package.json start script..."
  sed -i.bak 's/"start": "next start"/"start": "next start -p 8080"/' $TEMP_DIR/package.json
  rm -f $TEMP_DIR/package.json.bak
fi

# === CREATE DIRECTORIES ===
echo "===== STEP 5: Creating necessary directories ====="

# Create necessary upload directories but without content
echo "Creating empty upload directories..."
mkdir -p $TEMP_DIR/uploads/temp
mkdir -p $TEMP_DIR/uploads/converted
mkdir -p $TEMP_DIR/uploads/thumbnails

# Create logs directory
echo "Creating logs directory..."
mkdir -p $TEMP_DIR/logs
touch $TEMP_DIR/logs/.gitkeep

# Add .gitkeep files to ensure directories are maintained
touch $TEMP_DIR/uploads/temp/.gitkeep
touch $TEMP_DIR/uploads/converted/.gitkeep
touch $TEMP_DIR/uploads/thumbnails/.gitkeep

# Add health check route for Elastic Beanstalk
echo "Adding health check route..."
mkdir -p $TEMP_DIR/app/health
if [ ! -f "$TEMP_DIR/app/health/route.ts" ]; then
  cat > $TEMP_DIR/app/health/route.ts <<EOL
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
EOL
fi

# === VERIFY PACKAGE ===
echo "===== STEP 6: Verifying package contents ====="

# Check if .next/build-manifest.json exists (required for next start)
if [ ! -f "$TEMP_DIR/.next/build-manifest.json" ]; then
  echo "ERROR: .next/build-manifest.json not found! The Next.js build is incomplete."
  rm -rf $TEMP_DIR
  exit 1
fi

echo "Checking for .next directory..."
ls -la $TEMP_DIR/.next

# Check estimated package size before creating zip
echo "Checking package size before zipping..."
du -sh $TEMP_DIR

# === CREATE ZIP PACKAGE ===
echo "===== STEP 7: Creating zip package ====="

# Create zip file
echo "Creating zip file..."
cd $TEMP_DIR
zip -r $ZIP_FILE * .ebextensions/ .npmrc .platform/ .next/ 2>/dev/null

# Check final zip file size
echo "Final zip file size:"
du -sh $ZIP_FILE

# Move the zip file to the project root
mv $ZIP_FILE $PROJECT_ROOT/$ZIP_FILE

# Clean up
cd $PROJECT_ROOT
rm -rf $TEMP_DIR

echo "===== DEPLOYMENT PACKAGE CREATED SUCCESSFULLY ====="
echo "Package location: $PROJECT_ROOT/$ZIP_FILE"
echo "IMPORTANT: This package contains a pre-built Next.js application for deployment to Elastic Beanstalk."
echo "IMPORTANT: Deploy to Elastic Beanstalk using the c6gd instance type for NVMe storage capabilities."
echo "To deploy: Use the AWS Management Console or AWS CLI to deploy this package to your Elastic Beanstalk environment."

# Create a postdeploy verification script to ensure Next.js is available
echo "Creating verification postdeploy script..."
mkdir -p $TEMP_DIR/.platform/hooks/postdeploy
cat > $TEMP_DIR/.platform/hooks/postdeploy/02_verify_next.sh <<EOL
#!/bin/bash
# Verify Next.js environment after deployment

cd /var/app/current

echo "===== VERIFYING NEXT.JS ENVIRONMENT ====="

# Check if node_modules/.bin/next exists
if [ -f "node_modules/.bin/next" ]; then
  echo "✅ next executable found at node_modules/.bin/next"
  ls -la node_modules/.bin/next
else
  echo "❌ ERROR: next executable not found in node_modules/.bin/"
  echo "Attempting emergency fix by installing next directly..."
  NODE_OPTIONS=--max_old_space_size=2048 npm install next@latest --legacy-peer-deps --force
fi

# Verify if .next directory exists
if [ ! -d ".next" ]; then
  echo "❌ WARNING: .next directory not found. Attempting to rebuild..."
  NODE_OPTIONS=--max_old_space_size=2048 npm run build
else
  echo "✅ .next directory found"
  ls -la .next
fi

echo "===== ENVIRONMENT VERIFICATION COMPLETE ====="
exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/postdeploy/02_verify_next.sh

# Add Nginx configuration verification script
cat > $TEMP_DIR/.platform/hooks/postdeploy/03_verify_nginx.sh <<EOL
#!/bin/bash
# Verify Nginx configuration after deployment

echo "===== VERIFYING NGINX CONFIGURATION ====="

# Check if custom Nginx configs exist
echo "Checking Nginx configuration files..."
NGINX_CONF_FILES=0

if [ -f "/etc/nginx/conf.d/next-headers.conf" ]; then
  echo "✅ next-headers.conf found at /etc/nginx/conf.d/"
  NGINX_CONF_FILES=$((NGINX_CONF_FILES+1))
else
  echo "❌ WARNING: next-headers.conf not found in /etc/nginx/conf.d/"
fi

if [ -f "/var/proxy/staging/nginx/conf.d/custom.conf" ]; then
  echo "✅ custom.conf found at /var/proxy/staging/nginx/conf.d/"
  NGINX_CONF_FILES=$((NGINX_CONF_FILES+1))
else
  echo "❌ WARNING: custom.conf not found in /var/proxy/staging/nginx/conf.d/"
fi

if [ -f "/var/app/current/.platform/nginx/conf.d/emergency.conf" ] || [ -f "/var/app/staging/.platform/nginx/conf.d/emergency.conf" ]; then
  echo "✅ emergency.conf found in application/staging directory"
else
  echo "❌ WARNING: emergency.conf not found in expected locations"
fi

if [ $NGINX_CONF_FILES -eq 0 ]; then
  echo "❌ ERROR: No Nginx configuration files found!"
fi

# Check for duplicate upstream blocks
echo "Checking for duplicate upstream definitions..."
UPSTREAM_COUNT=$(grep -c "upstream nodejs" /var/proxy/staging/nginx/conf.d/* 2>/dev/null || echo "0")
if [ "$UPSTREAM_COUNT" -gt 1 ]; then
  echo "❌ WARNING: Multiple upstream nodejs blocks found ($UPSTREAM_COUNT). This may cause conflicts."
  
  # Find the files with upstream definitions
  echo "Upstream blocks found in the following files:"
  UPSTREAM_FILES=$(grep -l "upstream nodejs" /var/proxy/staging/nginx/conf.d/* 2>/dev/null)
  echo "$UPSTREAM_FILES"
  
  # Keep custom.conf upstream block and comment out others
  PRIORITY_ORDER=("custom.conf" "custom-fallback.conf" "emergency.conf")
  PRIMARY_FILE=""
  
  # Find the highest priority file that exists and has an upstream block
  for file in "${PRIORITY_ORDER[@]}"; do
    if echo "$UPSTREAM_FILES" | grep -q "$file"; then
      PRIMARY_FILE="/var/proxy/staging/nginx/conf.d/$file"
      echo "Using upstream block from $PRIMARY_FILE (highest priority)"
      break
    fi
  done
  
  # If no priority file found, use the first one
  if [ -z "$PRIMARY_FILE" ]; then
    PRIMARY_FILE=$(echo "$UPSTREAM_FILES" | head -n 1)
    echo "Using upstream block from $PRIMARY_FILE (first found)"
  fi
  
  # Comment out upstream blocks in all other files
  for file in $UPSTREAM_FILES; do
    if [ "$file" != "$PRIMARY_FILE" ]; then
      echo "Commenting out upstream block in $file"
      sed -i.bak '/upstream nodejs/,/}/s/^/#/' "$file"
      rm -f "$file.bak"
    fi
  done
  
  echo "Fixed duplicate upstream nodejs blocks"
else
  echo "✅ No duplicate upstream blocks found"
fi

# Verify Nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
  echo "✅ Nginx configuration test passed"
else
  echo "❌ ERROR: Nginx configuration test failed"
  echo "Attempting to fix common issues..."
  
  # Identify the specific error
  NGINX_ERROR=$(nginx -t 2>&1)
  echo "Nginx error: $NGINX_ERROR"
  
  if echo "$NGINX_ERROR" | grep -q "duplicate upstream"; then
    echo "Detected duplicate upstream definition. Fixing..."
    
    # Find all files with upstream nodejs block
    UPSTREAM_FILES=$(grep -l "upstream nodejs" /var/proxy/staging/nginx/conf.d/* 2>/dev/null)
    
    # Keep only the first one, remove upstream block from others
    FIRST_FILE=$(echo "$UPSTREAM_FILES" | head -n 1)
    echo "Keeping upstream block in $FIRST_FILE"
    
    for file in $UPSTREAM_FILES; do
      if [ "$file" != "$FIRST_FILE" ]; then
        echo "Removing upstream block from $file"
        sed -i '/upstream nodejs/,/}/d' "$file"
      fi
    done
    
    # Test again
    if nginx -t; then
      echo "✅ Fixed duplicate upstream issue"
    else
      echo "❌ Error still persists after fixing upstream blocks"
      
      # Create a simplified basic config (backup original first)
      mkdir -p /tmp/nginx-backup
      cp -a /var/proxy/staging/nginx/conf.d/* /tmp/nginx-backup/
      
      # Remove all configs and use the emergency configuration
      rm -f /var/proxy/staging/nginx/conf.d/*
      
      if [ -f "/var/app/current/.platform/nginx/conf.d/emergency.conf" ]; then
        echo "Using emergency configuration from application directory"
        cp /var/app/current/.platform/nginx/conf.d/emergency.conf /var/proxy/staging/nginx/conf.d/custom.conf
      elif [ -f "/var/app/staging/.platform/nginx/conf.d/emergency.conf" ]; then
        echo "Using emergency configuration from staging directory"
        cp /var/app/staging/.platform/nginx/conf.d/emergency.conf /var/proxy/staging/nginx/conf.d/custom.conf
      else
        echo "❌ ERROR: Could not find emergency.conf in expected locations"
        
        # Create absolute minimal config as last resort
        cat > /var/proxy/staging/nginx/conf.d/custom.conf << 'EOF'
# Emergency minimal configuration (auto-generated)
# Remove any previous configs to prevent conflicts
# This file was generated as a last resort when all other configs failed

upstream nodejs {
  server 127.0.0.1:8080;
  keepalive 256;
}

server {
  listen 80;
  server_name freetool.online;
  client_max_body_size 500M;
  
  location / {
    proxy_pass http://nodejs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  
  # Emergency JavaScript handler
  location ~ \.js$ {
    proxy_pass http://nodejs;
    add_header Content-Type "application/javascript" always;
  }
  
  # Emergency CSS handler
  location ~ \.css$ {
    proxy_pass http://nodejs;
    add_header Content-Type "text/css" always;
  }
}
EOF
      fi
      
      # Test again
      if nginx -t; then
        echo "✅ Emergency configuration test passed"
        
        # Try to also add back the map directives from headers file
        if [ -f "/tmp/nginx-backup/next-headers.conf" ]; then
          # Extract just the map directives
          grep "map" /tmp/nginx-backup/next-headers.conf > /var/proxy/staging/nginx/conf.d/next-headers.conf
          
          # Test again to make sure it still works
          if ! nginx -t; then
            echo "❌ Adding back map directives failed, removing them"
            rm -f /var/proxy/staging/nginx/conf.d/next-headers.conf
          else
            echo "✅ Successfully added back map directives"
          fi
        fi
      else
        echo "❌ ERROR: Emergency configuration also failed. Nginx may not start properly."
      fi
    fi
  fi
fi

# Report final Nginx configuration status
echo "Final Nginx configuration status:"
if nginx -t; then
  echo "✅ Nginx configuration is valid"
else
  echo "❌ ERROR: Nginx configuration remains invalid. Service may not start properly."
fi

echo "===== NGINX VERIFICATION COMPLETE ====="
exit 0
EOL
chmod +x $TEMP_DIR/.platform/hooks/postdeploy/03_verify_nginx.sh

# Create disk cleanup configuration
echo "Creating disk cleanup configuration..."
mkdir -p $TEMP_DIR/.ebextensions
cat > $TEMP_DIR/.ebextensions/disk-cleanup.config <<EOL
files:
  "/usr/local/bin/cleanup-disk-space.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/bin/bash
      # Disk space cleanup script for Elastic Beanstalk
      
      echo "Starting disk space cleanup..."
      
      # Clean up package manager caches
      if command -v apt-get &> /dev/null; then
        echo "Cleaning apt cache..."
        apt-get clean
        apt-get autoremove -y
      fi
      
      if command -v yum &> /dev/null; then
        echo "Cleaning yum cache..."
        yum clean all
        rm -rf /var/cache/yum
      fi
      
      # Clean npm cache
      if command -v npm &> /dev/null; then
        echo "Cleaning npm cache..."
        npm cache clean --force
      fi
      
      # Clean /tmp directory
      echo "Cleaning /tmp directory..."
      find /tmp -type f -atime +1 -delete
      
      # Clean old deployment versions
      echo "Cleaning old deployment versions..."
      if [ -d /var/app/ondeck ]; then
        rm -rf /var/app/ondeck/*
      fi
      
      # Clean old log files
      echo "Cleaning old log files..."
      find /var/log -type f -name "*.gz" -delete
      find /var/log -type f -name "*.old" -delete
      find /var/log -type f -name "*.1" -delete
      find /var/log -type f -name "*.2" -delete
      
      # Truncate large log files but don't delete them
      find /var/log -type f -size +50M -exec truncate -s 5M {} \;
      
      # Clean Docker images if Docker is installed
      if command -v docker &> /dev/null; then
        echo "Cleaning unused Docker images and containers..."
        docker system prune -af
      fi
      
      # Output disk usage after cleanup
      echo "Current disk usage after cleanup:"
      df -h /
      
      exit 0

  "/etc/cron.d/disk-cleanup":
    mode: "000644"
    owner: root
    group: root
    content: |
      # Run disk cleanup every 6 hours
      0 */6 * * * root /usr/local/bin/cleanup-disk-space.sh > /var/log/disk-cleanup.log 2>&1

container_commands:
  01_setup_disk_cleanup:
    command: "chmod +x /usr/local/bin/cleanup-disk-space.sh && crontab /etc/cron.d/disk-cleanup"
    ignoreErrors: true
    
  02_initial_cleanup:
    command: "/usr/local/bin/cleanup-disk-space.sh"
    ignoreErrors: true
EOL

# Add CloudFront compatibility configuration
echo "Creating CloudFront compatibility configuration..."
cat > $TEMP_DIR/.ebextensions/cloudfront-compat.config <<EOL
files:
  "/usr/local/bin/setup-cloudfront-compat.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/bin/bash
      # Script to ensure compatibility with CloudFront
      
      echo "Setting up CloudFront compatibility..."
      
      # Verify config files exist
      if [ -f "/var/proxy/nginx/conf.d/custom.conf" ]; then
        echo "Found custom.conf in /var/proxy/nginx/conf.d/"
      else
        echo "Warning: custom.conf not found in expected location"
      fi
      
      if [ -f "/var/proxy/nginx/conf.d/next-headers.conf" ]; then
        echo "Found next-headers.conf in /var/proxy/nginx/conf.d/"
      else
        echo "Warning: next-headers.conf not found in expected location"
      fi
      
      # Create a custom configuration for NGINX to work better with CloudFront
      NGINX_CONF="/etc/nginx/conf.d/cloudfront-compat.conf"
      
      cat > \$NGINX_CONF <<EOF
      # Additional configuration for CloudFront compatibility
      
      # Enable CORS for assets
      map \$http_origin \$cors_origin {
        default "";
        "~^https?://(.*\.)?freetool\.online(:[0-9]+)?\$" "\$http_origin";
      }
      
      # Set CORS headers for specific requests
      map \$request_uri \$add_cors_headers {
        default 0;
        "~*\.(js|css|json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$" 1;
      }
      
      # Configure proxy caching for CloudFront
      proxy_cache_path /var/cache/nginx/cloudfront_cache levels=1:2 keys_zone=cloudfront_cache:10m max_size=500m inactive=60m;
      
      # Configure AWS headers map
      map \$http_cloudfront_forwarded_proto \$cf_proto {
        default \$scheme;
        "https" "https";
        "http" "http";
      }
      EOF
      
      echo "Created CloudFront compatibility configuration."
      
      # Creating .well-known directory for better handling with CloudFront
      mkdir -p /var/app/current/.well-known
      
      # Reload NGINX to apply changes
      /sbin/service nginx reload
      
      echo "CloudFront compatibility setup complete."
      exit 0

  "/etc/nginx/conf.d/next-headers.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      # Include the configuration file we copied to the expected location
      include /var/proxy/staging/nginx/conf.d/next-headers.conf;

container_commands:
  01_setup_cloudfront_compat:
    command: "chmod +x /usr/local/bin/setup-cloudfront-compat.sh && /usr/local/bin/setup-cloudfront-compat.sh"
    ignoreErrors: true
EOL

# Print CloudFront recommendations
echo "===== DEPLOYMENT PACKAGE CREATED SUCCESSFULLY ====="
echo "Package location: $PROJECT_ROOT/$ZIP_FILE"
echo "IMPORTANT: This package contains a pre-built Next.js application for deployment to Elastic Beanstalk."
echo "IMPORTANT: Deploy to Elastic Beanstalk using the c6gd instance type for NVMe storage capabilities."
echo "To deploy: Use the AWS Management Console or AWS CLI to deploy this package to your Elastic Beanstalk environment."
echo ""
echo "===== CLOUDFRONT CONFIGURATION RECOMMENDATIONS ====="
echo "After deploying to Elastic Beanstalk, please ensure your CloudFront distribution has the following settings:"
echo ""
echo "1. For the Origin (Elastic Beanstalk domain):"
echo "   - Origin Protocol Policy: HTTP Only (Elastic Beanstalk handles HTTPS termination)"
echo "   - Origin Read Timeout: 60 seconds (to handle longer file uploads/processing)"
echo ""
echo "2. Cache Policy Configuration:"
echo "   - Create a custom cache policy with:"
echo "     * Minimum TTL: 0 seconds"
echo "     * Maximum TTL: 31536000 seconds (1 year)"
echo "     * Default TTL: 86400 seconds (1 day)"
echo "     * Cached HTTP methods: GET, HEAD"
echo "     * Headers to include in cache key: Origin, Accept, Accept-Encoding"
echo "     * Query strings: All"
echo "     * Cookies: None"
echo ""
echo "3. For JavaScript Files in _next/static/*:"
echo "   - Create a specific behavior with:"
echo "     * Path pattern: _next/static/chunks/*"
echo "     * Compress objects automatically: Yes"
echo "     * Origin request policy: Include all headers (CRITICAL for content type)"
echo "     * Response headers policy: Create a custom policy that explicitly sets:"
echo "       - Content-Type: application/javascript"
echo "       - Cache-Control: public, max-age=31536000, immutable"
echo "       - X-Content-Type-Options: nosniff"
echo ""
echo "4. CRITICAL: Create Response Headers Policy:"
echo "   - Create a custom policy for JavaScript files that overrides Content-Type:"
echo "     * For .js files in _next/static/chunks paths: Set Content-Type to application/javascript"
echo "     * Enable CORS headers if needed"
echo "     * Set the security headers as appropriate"
echo ""
echo "5. To validate content types after deployment:"
echo "   - Use curl to check headers: curl -I https://freetool.online/_next/static/chunks/[some-file].js"
echo "   - Verify Content-Type is 'application/javascript' not 'text/plain'"
echo ""
echo "===== END CLOUDFRONT RECOMMENDATIONS ====="