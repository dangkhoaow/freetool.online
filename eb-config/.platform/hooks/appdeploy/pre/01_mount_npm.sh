#!/bin/bash
# Ensure node_modules directory is on NVMe before npm install

set -e
echo "====== PRE-DEPLOY: SETTING UP NODE_MODULES ON NVME ======"

# Emergency cleanup to free disk space
find /tmp -type f -mtime +1 -delete 2>/dev/null || true 
find /var/log -name "*.gz" -type f -mtime +3 -delete 2>/dev/null || true
find /var/log -type f -size +10M -exec truncate -s 10M {} \; 2>/dev/null || true

# Check disk space
echo "Current disk space:"
df -h /

# Check if NVMe is mounted
if ! mountpoint -q /mnt/nvme_data; then
  echo "NVMe not mounted, configuring NVMe..."
  /usr/local/bin/configure-nvme.sh
fi

# If NVMe is mounted, set up node_modules symlink
if mountpoint -q /mnt/nvme_data; then
  echo "NVMe is mounted at /mnt/nvme_data"
  
  # Set up node_modules symlink
  if [ -d "/var/app/staging" ]; then
    echo "Setting up node_modules symlink for /var/app/staging"
    
    # Remove existing node_modules if it's a directory
    if [ -d "/var/app/staging/node_modules" ] && [ ! -L "/var/app/staging/node_modules" ]; then
      echo "Removing existing node_modules directory"
      rm -rf /var/app/staging/node_modules
    fi
    
    # Create symlink
    if [ ! -L "/var/app/staging/node_modules" ]; then
      echo "Creating symlink to /mnt/nvme_data/node_modules"
      ln -sf /mnt/nvme_data/node_modules /var/app/staging/node_modules
      chown -h webapp:webapp /var/app/staging/node_modules
    fi
  fi
  
  # Configure npm to use NVMe cache and legacy-peer-deps
  echo "Configuring npm to use cache on NVMe"
  mkdir -p /mnt/nvme_data/npm-cache
  chmod 777 /mnt/nvme_data/npm-cache
  npm config set cache /mnt/nvme_data/npm-cache

  # CRITICAL: Force npm to use legacy-peer-deps
  echo "Setting npm to use legacy-peer-deps"
  npm config set legacy-peer-deps true
  
  # Create .npmrc in the app directory with legacy-peer-deps
  if [ -d "/var/app/staging" ]; then
    echo "Creating .npmrc in /var/app/staging"
    cat > /var/app/staging/.npmrc <<EOL
cache=/mnt/nvme_data/npm-cache
prefer-offline=true
legacy-peer-deps=true
EOL
    chown webapp:webapp /var/app/staging/.npmrc
  fi
  
  echo "Current disk space after setup:"
  df -h /
else
  echo "WARNING: NVMe is not mounted"
fi

echo "====== PRE-DEPLOY SETUP COMPLETE ======"
exit 0
