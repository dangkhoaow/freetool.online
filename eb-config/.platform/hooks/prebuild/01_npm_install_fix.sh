#!/bin/bash
# Fix npm installation with legacy-peer-deps

set -e
echo "====== PREBUILD: FIXING NPM INSTALLATION ======"

# Check if we're in the right directory
if [ -f "/var/app/staging/package.json" ]; then
  cd /var/app/staging
  
  # Ensure we have a valid .npmrc file
  cat > .npmrc <<EOL
cache=/mnt/nvme_data/npm-cache
prefer-offline=true
legacy-peer-deps=true
EOL

  # Set npm config
  npm config set legacy-peer-deps true
  npm config set cache /mnt/nvme_data/npm-cache
  
  # Emergency disk cleanup again to be safe
  echo "Running emergency disk cleanup before npm install"
  find /tmp -type f -mtime +1 -delete 2>/dev/null || true 
  find /var/log -name "*.gz" -type f -mtime +3 -delete 2>/dev/null || true
  find /var/log -type f -size +10M -exec truncate -s 10M {} \; 2>/dev/null || true
  
  # Show disk space
  echo "Disk space before npm install:"
  df -h /
  
  # Make sure node_modules is on NVMe
  if [ ! -L "node_modules" ] && mountpoint -q /mnt/nvme_data; then
    # Remove if exists but not a symlink
    if [ -d "node_modules" ]; then
      echo "Removing existing node_modules directory"
      rm -rf node_modules
    fi
    
    # Create symlink to NVMe
    echo "Creating symlink to NVMe node_modules"
    ln -sf /mnt/nvme_data/node_modules node_modules
  fi
  
  echo "====== PREBUILD NPM FIX COMPLETE ======"
else
  echo "WARNING: Not in the staging directory, skipping npm fix"
fi

exit 0
