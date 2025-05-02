#!/bin/bash
# Custom npm installer that runs in predeploy phase
# This completely replaces the standard npm install process

set -e
echo "====== CUSTOM NPM INSTALLER: RUNNING ======"

# Check if we're in staging directory
if [ ! -d "/var/app/staging" ]; then
  echo "Not in staging directory, exiting"
  exit 0
fi

cd /var/app/staging

# Ensure NVMe is mounted and node_modules is symlinked
NVME_MOUNT="/mnt/nvme_data"
if ! mountpoint -q $NVME_MOUNT; then
  echo "ERROR: NVMe not mounted! Cannot proceed with npm install!"
  exit 1
fi

# Verify node_modules symlink
if [ ! -L "node_modules" ]; then
  echo "node_modules is not a symlink! Creating symlink to NVMe..."
  rm -rf node_modules
  ln -sf $NVME_MOUNT/node_modules node_modules
fi

# More disk space cleanup before npm install
echo "Cleaning npm cache..."
npm cache clean --force

echo "Removing all node_modules from root volume..."
find / -name "node_modules" -type d -not -path "$NVME_MOUNT/*" -exec rm -rf {} + 2>/dev/null || true

# Check disk space before npm install
echo "Disk space before npm install:"
df -h / $NVME_MOUNT

# Run NPM CI instead of install for faster, more reliable builds
# With very restricted memory usage and all optimizations enabled
echo "Running npm ci with all optimizations..."
NODE_OPTIONS="--max-old-space-size=512" \
npm ci \
  --prefer-offline \
  --no-audit \
  --no-fund \
  --loglevel=error \
  --no-optional \
  --legacy-peer-deps \
  --cache=$NVME_MOUNT/npm-cache \
  --production=false

# Check for success
if [ $? -ne 0 ]; then
  echo "npm ci failed, falling back to npm install..."
  # Clean up any partial installs
  rm -rf $NVME_MOUNT/node_modules/*
  
  # Run npm install as fallback with all optimizations
  NODE_OPTIONS="--max-old-space-size=512" \
  npm install \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --loglevel=error \
    --no-optional \
    --legacy-peer-deps \
    --cache=$NVME_MOUNT/npm-cache \
    --production=false \
    --force
fi

# Verify node_modules is populated
if [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "WARNING: node_modules appears to be empty after npm install!"
fi

# Check disk space after npm install
echo "Disk space after npm install:"
df -h / $NVME_MOUNT

# Clean up unnecessary npm files to save space
echo "Cleaning up unnecessary npm files..."
rm -rf .npm
rm -rf ~/.npm
find node_modules -name "*.md" -type f -delete 2>/dev/null || true
find node_modules -name "*.map" -type f -delete 2>/dev/null || true
find node_modules -name "*.test.js" -type f -delete 2>/dev/null || true
find node_modules -name "CHANGELOG*" -type f -delete 2>/dev/null || true
find node_modules -name "LICENSE*" -type f -delete 2>/dev/null || true

# One more disk space check
echo "Disk space after cleanup:"
df -h / $NVME_MOUNT

echo "====== CUSTOM NPM INSTALLER: COMPLETED ======"
exit 0
