#!/bin/bash
# Build a deployment package for AWS Elastic Beanstalk
# This script builds an optimized deployment package for the Next.js application

set -e

# Parse command-line options
SKIP_BUILD=false
ZIP_ONLY=false
for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      ;;
    --zip-only)
      ZIP_ONLY=true
      ;;
  esac
done

# First delete any existing package to avoid inclusion issues
ZIP_FILE="eb-deploy-package.zip"
if [ -f "$ZIP_FILE" ]; then
    echo "Removing existing $ZIP_FILE to prevent inclusion..."
    rm -f "$ZIP_FILE"
fi

# Add log for tracking package size optimization
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting deployment package creation with optimized webpack cache exclusion"

TEMP_DIR=$(mktemp -d)
PACKAGE_DIR=$(pwd)
echo "Creating deployment package in: $TEMP_DIR"

# Function to cleanup temporary directory
cleanup() {
  echo "Cleaning up temporary directory..."
  rm -rf "$TEMP_DIR"
}

# Register the cleanup function to be called on exit
trap cleanup EXIT

# Step 1: Install dependencies and build the application locally
if [ "$SKIP_BUILD" = false ] && [ "$ZIP_ONLY" = false ]; then
  echo "===== STEP 1: Installing dependencies and building locally ====="
  npm install --force
  npm run build
else
  echo "===== STEP 1: SKIPPED (--skip-build or --zip-only flag used) ====="
  # Verify that .next directory exists when skipping build
  if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found. Cannot skip build if application hasn't been built."
    echo "Run without --skip-build to build the application first."
    exit 1
  fi
  echo "Using existing .next directory from previous build."
fi

# Step 2: Copy project files to temporary directory - EXCLUDING large files
echo "===== STEP 2: Copying project files to temporary directory with aggressive optimization ====="
# IMPORTANT: Explicitly exclude the deployment package to avoid recursion
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='*.zip' \
          --exclude='eb-deploy-package.zip' \
          --exclude='.next/cache' \
          --exclude='*.tsbuildinfo' \
          --exclude='tsconfig.tsbuildinfo' \
          --exclude='.next/cache/.tsbuildinfo' \
          --exclude='.eslintcache' \
          --exclude='.next/cache/eslint' \
          --exclude='*.map' \
          --exclude='.next/**/*.map' \
          ./ "$TEMP_DIR/"

# OPTIMIZATION STRATEGY: Instead of multiple copies of large WASM files, we'll maintain just one copy 
# and reference it with the right paths in production
echo "===== Aggressively optimizing WASM files and large assets ====="

# Create a special file that will signal the deployment to download WASM files on first run
mkdir -p "$TEMP_DIR/public/ffmpeg/esm"
mkdir -p "$TEMP_DIR/public/ffmpeg/umd"

# 1. Create a placeholder file instead of including the large WASM files
# We'll use a small placeholder (1KB) instead of the 32MB file
echo "Creating placeholder for WASM files (will be downloaded during deployment)..."
dd if=/dev/zero of="$TEMP_DIR/public/ffmpeg-core.wasm.placeholder" bs=1024 count=1 2>/dev/null
chmod 644 "$TEMP_DIR/public/ffmpeg-core.wasm.placeholder"

# 2. Delete all large WASM files from package
echo "Removing all large WASM files from package..."
rm -f "$TEMP_DIR/public/ffmpeg-core.wasm" 2>/dev/null || true
rm -f "$TEMP_DIR/public/ffmpeg/esm/ffmpeg-core.wasm" 2>/dev/null || true
rm -f "$TEMP_DIR/public/ffmpeg/umd/ffmpeg-core.wasm" 2>/dev/null || true

# 3. Add a script to download WASM files during deployment
echo "Adding script to download WASM files during deployment..."
mkdir -p "$TEMP_DIR/eb-config/.platform/hooks/postdeploy"
cat > "$TEMP_DIR/eb-config/.platform/hooks/postdeploy/01_download_wasm_files.sh" << 'EOL'
#!/bin/bash
# Download WASM files after deployment to avoid including in package
set -e

echo "===== DOWNLOADING WASM FILES POST-DEPLOYMENT ====="
WASM_FILE_URL="https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm"
APP_DIR="/var/app/current"

function download_wasm() {
  local target_path="$1"
  local target_dir=$(dirname "$target_path")
  
  mkdir -p "$target_dir"
  echo "Downloading to $target_path..."
  curl -s -o "$target_path" "$WASM_FILE_URL"
  
  if [ -f "$target_path" ]; then
    chmod 644 "$target_path"
    echo "Successfully downloaded $(du -h "$target_path" | cut -f1)"
  else
    echo "Failed to download to $target_path"
  fi
}

# Download to all required locations
download_wasm "$APP_DIR/public/ffmpeg-core.wasm"
download_wasm "$APP_DIR/public/ffmpeg/esm/ffmpeg-core.wasm"
download_wasm "$APP_DIR/public/ffmpeg/umd/ffmpeg-core.wasm"

echo "===== WASM FILES DOWNLOAD COMPLETE ====="
exit 0
EOL

chmod +x "$TEMP_DIR/eb-config/.platform/hooks/postdeploy/01_download_wasm_files.sh"

# Cleanup other cache and unnecessary files
echo "Removing additional unnecessary files..."
rm -rf "$TEMP_DIR/.next/cache/eslint" 2>/dev/null || true
find "$TEMP_DIR/.next" -name "*.map" -type f -delete 2>/dev/null || true
find "$TEMP_DIR" -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

# Optimize large image assets - create smaller versions for the EB package
# These will be downloaded in full resolution during deployment
echo "===== Optimizing large image assets ====="

# Create a directory to track which images need to be downloaded at deployment time
mkdir -p "$TEMP_DIR/eb-config/image-assets"

# Find and optimize large images (over 300KB)
find "$TEMP_DIR/public" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +300k | while read img; do
  img_size=$(du -k "$img" | cut -f1)
  img_name=$(basename "$img")
  echo "Optimizing large image: $img_name ($img_size KB)"
  
  # Copy the original to our tracking directory
  cp "$img" "$TEMP_DIR/eb-config/image-assets/original_$img_name"
  
  # Create a much smaller placeholder (10KB)
  dd if=/dev/zero of="$img" bs=1024 count=10 2>/dev/null
  echo "PLACEHOLDER: This image will be downloaded during deployment" > "$img"
  echo "Original size: $img_size KB" >> "$img"
done

# Add a script to download full-resolution images during deployment
cat > "$TEMP_DIR/eb-config/.platform/hooks/postdeploy/02_download_images.sh" << 'EOL'
#!/bin/bash
# Download full-resolution images after deployment
set -e

echo "===== DOWNLOADING FULL-RESOLUTION IMAGES ====="
APP_DIR="/var/app/current"
IMAGE_DIR="$APP_DIR/eb-config/image-assets"

if [ ! -d "$IMAGE_DIR" ]; then
  echo "No images to download - directory not found"
  exit 0
fi

# Find all original images and restore them
find "$IMAGE_DIR" -type f -name "original_*" | while read img; do
  filename=$(basename "$img" | sed 's/^original_//')
  target="$APP_DIR/public/$filename"
  target_dir=$(dirname "$target")
  
  if [ ! -d "$target_dir" ]; then
    mkdir -p "$target_dir"
  fi
  
  echo "Restoring full-resolution image: $filename"
  cp "$img" "$target"
  chmod 644 "$target"
done

echo "===== IMAGE DOWNLOAD COMPLETE ====="
exit 0
EOL

chmod +x "$TEMP_DIR/eb-config/.platform/hooks/postdeploy/02_download_images.sh"

# Final aggressive removal of unnecessary files
echo "===== Performing final optimizations ====="

# Remove development files not needed in production
rm -rf "$TEMP_DIR/.github" 2>/dev/null || true
rm -rf "$TEMP_DIR/.husky" 2>/dev/null || true
rm -rf "$TEMP_DIR/.storybook" 2>/dev/null || true
rm -rf "$TEMP_DIR/__tests__" 2>/dev/null || true
rm -rf "$TEMP_DIR/tests" 2>/dev/null || true
rm -rf "$TEMP_DIR/e2e" 2>/dev/null || true
rm -rf "$TEMP_DIR/coverage" 2>/dev/null || true
rm -rf "$TEMP_DIR/docs" 2>/dev/null || true
rm -rf "$TEMP_DIR/stories" 2>/dev/null || true

# Remove any leftover large files
find "$TEMP_DIR" -type f -size +10M | while read large_file; do
  echo "WARNING: Large file detected: $large_file"
  echo "Replacing with placeholder..."
  echo "LARGE FILE PLACEHOLDER: This file was too large for the EB package" > "$large_file"
done

# Step 3: Copy .next directory with comprehensive cache exclusions
echo "===== STEP 3: Copying .next directory with optimized cache exclusions ====="
mkdir -p "$TEMP_DIR/.next"

# Use detailed exclusion list for webpack cache directories to minimize package size
rsync -av --exclude='cache/webpack/server-production' \
         --exclude='cache/webpack/client-production' \
         --exclude='cache/webpack/server-development' \
         --exclude='cache/webpack/client-development' \
         --exclude='cache/webpack/edge-server-development' \
         --exclude='cache/webpack/edge-server-production' \
         --exclude='cache/webpack/client-development-fallback' \
         .next/ "$TEMP_DIR/.next/"

# Double-check to ensure no webpack cache directories are included
echo "Ensuring webpack cache is fully removed to minimize package size..."
rm -rf "$TEMP_DIR/.next/cache/webpack/"* 2>/dev/null || true

# Step 4: Create the deployment package
cd "$TEMP_DIR"

# Pre-create empty node_modules directory to force npm to use the NVMe mount
touch "$TEMP_DIR/DO_NOT_EXTRACT_DEPENDENCIES_HERE.txt"

# Create a special file to signal that dependencies should be installed on NVMe
cat > "$TEMP_DIR/USE_NVME_FOR_DEPENDENCIES.txt" << EOL
IMPORTANT: DO NOT EXTRACT npm dependencies to the root volume!
This application is configured to install dependencies to NVMe storage.
All node_modules must be symlinked to /mnt/nvme_data/node_modules.
EOL

# Create .npmrc in the package to force specific npm behaviors
cat > "$TEMP_DIR/.npmrc" << EOL
legacy-peer-deps=true
prefer-offline=true
no-fund=true
no-audit=true
loglevel=error
progress=false
EOL

# Create a special Procfile that ensures the application runs on port 3000
echo "web: npm run start -- -p 3000" > "$TEMP_DIR/Procfile"

# Set all predeploy and appdeploy hooks to be executable
find eb-config/.platform/hooks -type f -name "*.sh" -exec chmod +x {} \;
find eb-config/.ebextensions -type f -name "*.config" -exec chmod 644 {} \;

# CRITICAL: Add extreme disk management for npm install
mkdir -p "$TEMP_DIR/eb-config/.platform/hooks/predeploy"

# Create special scripts to prepare for npm install
cat > "$TEMP_DIR/eb-config/.platform/hooks/predeploy/00_ensure_nvme_first.sh" << 'EOL'
#!/bin/bash
# CRITICAL: This MUST run before npm tries to install dependencies
# This script ensures NVMe is mounted and prepared for npm install
set -e

echo "====== CRITICAL PRE-NPM PREPARATION ======"

# Aggressively clean root volume first
rm -rf /tmp/* /var/tmp/* 2>/dev/null || true
find /var/log -type f -delete 2>/dev/null || true
find /var/cache -type f -delete 2>/dev/null || true
find /root -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Check for and mount NVMe
NVME_MOUNT="/mnt/nvme_data"
if ! mountpoint -q $NVME_MOUNT; then
  echo "NVMe not mounted, attempting emergency mount..."
  mkdir -p $NVME_MOUNT
  
  if lsblk | grep -q nvme; then
    NVME_DEVICE=""
    if lsblk | grep -q nvme1n1; then
      NVME_DEVICE="/dev/nvme1n1"
    elif lsblk | grep -q nvme0n1; then
      NVME_DEVICE="/dev/nvme0n1"
    else
      NVME_DEVICE=$(lsblk | grep nvme | head -n1 | awk '{print $1}')
      NVME_DEVICE="/dev/$NVME_DEVICE"
    fi
    
    # Format if needed
    if ! blkid $NVME_DEVICE > /dev/null 2>&1; then
      echo "Formatting NVMe device $NVME_DEVICE..."
      mkfs -t xfs $NVME_DEVICE
    fi
    
    # Mount
    echo "Mounting NVMe device $NVME_DEVICE to $NVME_MOUNT..."
    mount $NVME_DEVICE $NVME_MOUNT
    if ! grep -q "$NVME_DEVICE" /etc/fstab; then
      echo "$NVME_DEVICE $NVME_MOUNT xfs defaults,nofail 0 2" >> /etc/fstab
    fi
  else
    echo "ERROR: No NVMe device found!"
    exit 1
  fi
fi

# Create our directories on NVMe and set permissions
echo "Setting up NVMe directories..."
mkdir -p $NVME_MOUNT/node_modules
mkdir -p $NVME_MOUNT/npm-cache
chmod -R 777 $NVME_MOUNT/node_modules
chmod -R 777 $NVME_MOUNT/npm-cache

# CRITICAL: If node_modules exists and is NOT a symlink, remove it
if [ -d "/var/app/staging/node_modules" ] && [ ! -L "/var/app/staging/node_modules" ]; then
  echo "CRITICAL: Removing node_modules directory that's not a symlink..."
  rm -rf /var/app/staging/node_modules
fi

# CRITICAL: Create the symlink
echo "Creating node_modules symlink to NVMe..."
ln -sf $NVME_MOUNT/node_modules /var/app/staging/node_modules
chown -h webapp:webapp /var/app/staging/node_modules

# Set up npm config
echo "Configuring npm to use NVMe..."
echo "cache=$NVME_MOUNT/npm-cache" > /var/app/staging/.npmrc
echo "legacy-peer-deps=true" >> /var/app/staging/.npmrc
echo "no-fund=true" >> /var/app/staging/.npmrc
echo "no-audit=true" >> /var/app/staging/.npmrc
echo "loglevel=error" >> /var/app/staging/.npmrc
echo "progress=false" >> /var/app/staging/.npmrc

# Copy to global npmrc
cp /var/app/staging/.npmrc /etc/npmrc
cp /var/app/staging/.npmrc /root/.npmrc

# Force npm settings globally
npm config set cache $NVME_MOUNT/npm-cache --global
npm config set legacy-peer-deps true --global
npm config set fund false --global
npm config set audit false --global
npm config set optional false --global
npm config set loglevel error --global

# CRITICAL: Block standard EB npm installer which will run on root volume
if [ -f "/opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh" ]; then
  echo "CRITICAL: Blocking standard EB npm installer..."
  chmod -x /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh
  mv /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh.DISABLED || true
fi

# Set NODE_OPTIONS to limit memory usage
echo "Setting reduced Node.js memory limit for npm..."
echo "export NODE_OPTIONS=--max-old-space-size=512" > /etc/profile.d/nodejs-mem-limit.sh
export NODE_OPTIONS=--max-old-space-size=512

# Show current disk space
echo "Current disk space:"
df -h / $NVME_MOUNT

echo "====== NVMe PREPARATION COMPLETE ======"
exit 0
EOL

# Create the actual npm installer script that will replace the default EB one
cat > "$TEMP_DIR/eb-config/.platform/hooks/predeploy/01_custom_npm_install.sh" << 'EOL'
#!/bin/bash
# Critical: Custom NPM installer that runs on NVMe
set -e

echo "====== RUNNING CUSTOM NPM INSTALLER ON NVME ======"

# Check if we're in staging directory
if [ ! -d "/var/app/staging" ]; then
  echo "Not in staging directory, cannot proceed"
  exit 1
fi

cd /var/app/staging

# Verify NVMe is mounted and node_modules is symlinked
NVME_MOUNT="/mnt/nvme_data"
if ! mountpoint -q $NVME_MOUNT; then
  echo "CRITICAL ERROR: NVMe not mounted! Cannot proceed with npm install."
  exit 1
fi

# Verify symlink
if [ ! -L "node_modules" ]; then
  echo "CRITICAL ERROR: node_modules is not a symlink!"
  rm -rf node_modules
  ln -sf $NVME_MOUNT/node_modules node_modules
fi

# Clean npm cache first
npm cache clean --force

# MORE aggressive disk space management
echo "Performing aggressive disk cleanup before npm install..."
rm -rf /var/log/* 2>/dev/null || true
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true
rm -rf ~/.npm 2>/dev/null || true

# Check disk space before npm operations
echo "Disk space before npm install:"
df -h / $NVME_MOUNT

# Try npm ci first, which is faster and more reliable
echo "Running npm ci with all optimizations and memory limits..."
NODE_OPTIONS="--max-old-space-size=512" \
DISABLE_OPENCOLLECTIVE=true \
npm ci \
  --prefer-offline \
  --no-audit \
  --no-fund \
  --ignore-scripts \
  --no-optional \
  --loglevel=error \
  --cache=$NVME_MOUNT/npm-cache \
  --userconfig=/var/app/staging/.npmrc

# If npm ci fails, fall back to npm install
if [ $? -ne 0 ]; then
  echo "npm ci failed, falling back to npm install..."
  
  # Clean cache one more time
  npm cache clean --force
  
  # Clean up any partial installs
  rm -rf $NVME_MOUNT/node_modules/*
  
  # Try with regular npm install but with memory limits and other optimizations
  NODE_OPTIONS="--max-old-space-size=512" \
  DISABLE_OPENCOLLECTIVE=true \
  npm install \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --ignore-scripts \
    --no-optional \
    --loglevel=error \
    --cache=$NVME_MOUNT/npm-cache \
    --legacy-peer-deps \
    --userconfig=/var/app/staging/.npmrc
    
  # If that fails too, try one more time with --force
  if [ $? -ne 0 ]; then
    echo "npm install failed, attempting one more time with --force..."
    
    # More cleanup
    rm -rf /var/log/* 2>/dev/null || true
    rm -rf /tmp/* 2>/dev/null || true
    
    NODE_OPTIONS="--max-old-space-size=512" \
    DISABLE_OPENCOLLECTIVE=true \
    npm install \
      --prefer-offline \
      --no-audit \
      --no-fund \
      --ignore-scripts \
      --no-optional \
      --loglevel=error \
      --cache=$NVME_MOUNT/npm-cache \
      --legacy-peer-deps \
      --force \
      --userconfig=/var/app/staging/.npmrc
  fi
fi

# Generate a copy of package-lock.json with dev dependencies removed
# This helps reduce its size
echo "Optimizing package-lock.json..."
if [ -f "package-lock.json" ]; then
  grep -v '"dev": true' package-lock.json > package-lock.optimized.json 2>/dev/null || true
  if [ -s "package-lock.optimized.json" ]; then
    mv package-lock.optimized.json package-lock.json
  fi
fi

# Verify node_modules is populated
NODE_MODULES_FILES=$(find node_modules -type f | wc -l)
echo "Node modules contains $NODE_MODULES_FILES files."

if [ $NODE_MODULES_FILES -lt 100 ]; then
  echo "WARNING: node_modules seems underpopulated after install!"
fi

# Check disk space after npm install
echo "Disk space after npm install:"
df -h / $NVME_MOUNT

# Clean up unnecessary npm files to save space
echo "Cleaning up unnecessary files in node_modules..."
find node_modules -name "*.md" -type f -delete 2>/dev/null || true
find node_modules -name "*.map" -type f -delete 2>/dev/null || true
find node_modules -name "*.test.js" -type f -delete 2>/dev/null || true
find node_modules -name "*.min.js.map" -type f -delete 2>/dev/null || true
find node_modules -name "CHANGELOG*" -type f -delete 2>/dev/null || true
find node_modules -name "LICENSE*" -type f -delete 2>/dev/null || true
find node_modules -name "README*" -type f -delete 2>/dev/null || true
find node_modules -path "*/test/*" -delete 2>/dev/null || true
find node_modules -path "*/docs/*" -delete 2>/dev/null || true
find node_modules -path "*/examples/*" -delete 2>/dev/null || true

# Final disk space check
echo "Disk space after cleanup:"
df -h / $NVME_MOUNT

echo "====== CUSTOM NPM INSTALL COMPLETED ======"
exit 0
EOL

# Create a script that ensures cleanup after npm install
cat > "$TEMP_DIR/eb-config/.platform/hooks/predeploy/02_post_npm_cleanup.sh" << 'EOL'
#!/bin/bash
# Post-npm install cleanup to save disk space
set -e

echo "====== RUNNING POST-NPM CLEANUP ======"

# Clean npm caches
npm cache clean --force
rm -rf ~/.npm 2>/dev/null || true

# Remove all logs and temp files
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true
find /var/log -type f -not -path "*/\.ssh/*" -delete 2>/dev/null || true

# Clean package-lock.json to save space
if [ -f "/var/app/staging/package-lock.json" ]; then
  echo "Optimizing package-lock.json size..."
  sed -i '/integrity/d' /var/app/staging/package-lock.json 2>/dev/null || true
fi

# Final disk space report
echo "Disk space after all cleanup:"
df -h /

echo "====== POST-NPM CLEANUP COMPLETE ======"
exit 0
EOL

# Also add a script to ensure WASM files are properly handled
cat > "$TEMP_DIR/eb-config/.platform/hooks/predeploy/03_handle_wasm_files.sh" << 'EOL'
#!/bin/bash
# Ensure WASM files are correctly handled
set -e

echo "====== HANDLING WASM FILES ======"

# Check if we're in staging directory
if [ ! -d "/var/app/staging" ]; then
  echo "Not in staging directory, exiting"
  exit 0
fi

cd /var/app/staging

# Check if ffmpeg directories exist
if [ -d "public/ffmpeg" ]; then
  echo "Found ffmpeg directory, linking WASM files to NVMe..."
  
  NVME_MOUNT="/mnt/nvme_data"
  if mountpoint -q $NVME_MOUNT; then
    # Create directory for WASM files on NVMe
    mkdir -p $NVME_MOUNT/wasm-files
    chmod 777 $NVME_MOUNT/wasm-files
    
    # Download WASM files directly to NVMe if needed
    FFMPEG_CORE_URL="https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.wasm"
    
    if [ ! -f "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" ]; then
      echo "Downloading ffmpeg-core.wasm to NVMe..."
      curl -o "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" $FFMPEG_CORE_URL || true
    fi
    
    # Create directories if they don't exist
    mkdir -p public/ffmpeg/umd
    mkdir -p public/ffmpeg/esm
    
    # Create symlinks to NVMe
    if [ -f "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" ]; then
      echo "Creating symlinks to WASM files on NVMe..."
      ln -sf "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" public/ffmpeg-core.wasm
      ln -sf "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" public/ffmpeg/umd/ffmpeg-core.wasm
      ln -sf "$NVME_MOUNT/wasm-files/ffmpeg-core.wasm" public/ffmpeg/esm/ffmpeg-core.wasm
    fi
  else
    echo "NVMe not mounted, cannot store WASM files on NVMe"
  fi
fi

echo "====== WASM FILES HANDLING COMPLETE ======"
exit 0
EOL

# Make our scripts executable
chmod +x "$TEMP_DIR/eb-config/.platform/hooks/predeploy/00_ensure_nvme_first.sh"
chmod +x "$TEMP_DIR/eb-config/.platform/hooks/predeploy/01_custom_npm_install.sh"
chmod +x "$TEMP_DIR/eb-config/.platform/hooks/predeploy/02_post_npm_cleanup.sh"
chmod +x "$TEMP_DIR/eb-config/.platform/hooks/predeploy/03_handle_wasm_files.sh"

# Also add a script that runs very early to disable the default npm installer
mkdir -p "$TEMP_DIR/eb-config/.platform/confighooks/prebuild"
cat > "$TEMP_DIR/eb-config/.platform/confighooks/prebuild/00_disable_default_npm.sh" << 'EOL'
#!/bin/bash
# Disable the default EB npm installer
# This runs very early in the deployment process

if [ -f "/opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh" ]; then
  echo "Disabling default Elastic Beanstalk npm installer..."
  chmod -x /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh
  mv /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh.DISABLED || true
fi
exit 0
EOL
chmod +x "$TEMP_DIR/eb-config/.platform/confighooks/prebuild/00_disable_default_npm.sh"

# Double-check for any ZIP files and remove them before creating the package
echo "Final check for any ZIP files in the temp directory..."
find "$TEMP_DIR" -name "*.zip" -exec rm -f {} \;

# Create a ZIP file with the deploy package
# First switch back to the original directory
cd "$PACKAGE_DIR"

# Remove old package if it exists
if [ -f "$ZIP_FILE" ]; then
  echo "Removing any old package..."
  rm -f "$ZIP_FILE"
fi

# Create zip file with maximum compression optimized for mixed content
echo "Creating deployment package with maximum compression and optimization..."

# Log start time of compression
COMPRESS_START=$(date +%s)

# Create deployment package with optimized compression settings
# -9: Maximum compression level
# -y: Store symbolic links as links, not the file they point to
# -r: Recursive
# --no-unicode: Don't store path names in UTF-8
# -q: Quiet operation - only show the final size
(cd "$TEMP_DIR" && zip -9yr -q "$PACKAGE_DIR/$ZIP_FILE" .)

# Log compression time
COMPRESS_END=$(date +%s)
COMPRESS_TIME=$((COMPRESS_END - COMPRESS_START))
echo "Package compressed in $COMPRESS_TIME seconds."

# Show the final package size
du -sh "$ZIP_FILE"
echo "===== DEPLOYMENT PACKAGE CREATED SUCCESSFULLY ====="
echo "Package location: $(pwd)/$ZIP_FILE"
echo "IMPORTANT: This package contains a pre-built Next.js application for deployment to Elastic Beanstalk."
echo "IMPORTANT: Deploy to Elastic Beanstalk using the c6gd instance type for NVMe storage capabilities."
echo "To deploy: Use the AWS Management Console or AWS CLI to deploy this package to your Elastic Beanstalk environment."

# Show CloudFront recommendations
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