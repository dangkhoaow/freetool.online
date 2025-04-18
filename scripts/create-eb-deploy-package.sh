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

# Install next-sitemap for sitemap generation
npm install --save-dev next-sitemap --legacy-peer-deps --force

# Create next-sitemap config file if it doesn't exist
if [ ! -f "next-sitemap.config.js" ]; then
  echo "Creating next-sitemap.config.js..."
  cat > next-sitemap.config.js <<EOL
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://freetool.online',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/admin/**', '/api/**'],
  generateIndexSitemap: false,
  outDir: 'public',
}
EOL
fi

# Try to build the app locally
echo "Building Next.js application locally..."
npm run build

# Generate sitemap after building
echo "Generating sitemap.xml..."
npx next-sitemap --config next-sitemap.config.js

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

# Verify sitemap.xml was created and copy it
echo "Checking for sitemap files..."
if [ ! -f "public/sitemap.xml" ]; then
  echo "WARNING: sitemap.xml was not generated. Creating a comprehensive one manually..."
  mkdir -p $TEMP_DIR/public
  CURRENT_DATE=$(date +%Y-%m-%d)
  cat > $TEMP_DIR/public/sitemap.xml <<EOL
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://freetool.online/</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://freetool.online/heic-converter</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
EOL
  echo "Manual sitemap.xml created."
  
  # Create robots.txt if it doesn't exist
  if [ ! -f "public/robots.txt" ]; then
    cat > $TEMP_DIR/public/robots.txt <<EOL
# *
User-agent: *
Allow: /

# Host
Host: https://freetool.online

# Sitemaps
Sitemap: https://freetool.online/sitemap.xml
EOL
    echo "Manual robots.txt created."
  fi
else
  echo "Sitemap generated successfully. Copying to package..."
  mkdir -p $TEMP_DIR/public
  cp public/sitemap*.xml $TEMP_DIR/public/
  if [ -f "public/robots.txt" ]; then
    cp public/robots.txt $TEMP_DIR/public/
  else
    # Create robots.txt if it was not generated
    cat > $TEMP_DIR/public/robots.txt <<EOL
# *
User-agent: *
Allow: /

# Host
Host: https://freetool.online

# Sitemaps
Sitemap: https://freetool.online/sitemap.xml
EOL
    echo "Manual robots.txt created."
  fi
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

# Remove any existing .platform to avoid conflicts
echo "Setting up .platform..."
rm -rf $TEMP_DIR/.platform
mkdir -p $TEMP_DIR/.platform/nginx/conf.d/
mkdir -p $TEMP_DIR/.platform/hooks/prebuild/
mkdir -p $TEMP_DIR/.platform/hooks/postdeploy/

# Create Nginx config with increased upload size limit
cat > $TEMP_DIR/.platform/nginx/conf.d/custom.conf <<EOL
upstream nodejs {
  server 127.0.0.1:8080;
  keepalive 256;
}

# HTTP server
server {
  listen 80;
  server_name freetool.online;
  
  # Increase max file upload size to 500MB
  client_max_body_size 500M;
  
  location / {
    proxy_pass http://nodejs;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Increase proxy timeout for larger file uploads
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
  }
}
EOL

# Create a postdeploy hook to set up swap
cat > $TEMP_DIR/.platform/hooks/postdeploy/01_setup_environment.sh <<EOL
#!/bin/bash
# Set up swap space if needed

# Get the SWAP_SIZE_MB from environment or use default
SWAP_SIZE_MB=\${SWAP_SIZE_MB:-4096}

# Create swap file
SWAP_FILE="/mnt/swap.1"

if [ ! -f "\$SWAP_FILE" ] || ! swapon -s | grep -q "\$SWAP_FILE"; then
  echo "Creating \${SWAP_SIZE_MB}MB swap file..."
  
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

# Create default upload directories
mkdir -p /var/app/current/uploads/temp /var/app/current/uploads/converted /var/app/current/uploads/thumbnails
chown -R webapp:webapp /var/app/current/uploads
chmod -R 0755 /var/app/current/uploads

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