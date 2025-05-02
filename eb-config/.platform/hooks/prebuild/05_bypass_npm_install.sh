#!/bin/bash
# Complete bypass of the default Elastic Beanstalk npm installation
# This allows us to use our own installation process with NVMe

set -e
echo "====== PREBUILD: BYPASS NPM INSTALLATION ======"

# Check if node_modules is already symlinked to NVMe
if [ -L "/var/app/staging/node_modules" ]; then
  echo "node_modules is already symlinked, good!"
else
  echo "ERROR: node_modules is not symlinked. Running emergency setup..."
  # Try to set up symlink - this should have been done by the earlier script
  mkdir -p /mnt/nvme_data/node_modules
  chmod 777 /mnt/nvme_data/node_modules
  
  # Remove any existing node_modules directory
  if [ -d "/var/app/staging/node_modules" ]; then
    echo "Removing existing node_modules directory"
    rm -rf /var/app/staging/node_modules
  fi
  
  # Create symlink to NVMe
  ln -sf /mnt/nvme_data/node_modules /var/app/staging/node_modules
  chown -h webapp:webapp /var/app/staging/node_modules
fi

# Ensure proper npm config
echo "Setting up npm configuration..."
export NPM_CONFIG_CACHE="/mnt/nvme_data/npm-cache"
export NODE_OPTIONS="--max-old-space-size=512"
mkdir -p /mnt/nvme_data/npm-cache
chmod 777 /mnt/nvme_data/npm-cache

# Disable the standard Elastic Beanstalk npm install 
if [ -f "/opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh" ]; then
  echo "Disabling the standard EB npm install script"
  mv /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh /opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh.disabled
fi

# Check current disk space
echo "Current disk space:"
df -h /

# Perform heavy disk space cleanup
echo "Performing heavy disk space cleanup..."
rm -rf /tmp/* 2>/dev/null || true
find /var/log -name "*.gz" -delete 2>/dev/null || true
find /var/log -type f -size +5M -exec truncate -s 5M {} \; 2>/dev/null || true

# Run our custom npm install with NVMe
cd /var/app/staging

echo "Creating detailed .npmrc..."
cat > .npmrc <<EOL
cache=/mnt/nvme_data/npm-cache
legacy-peer-deps=true
prefer-offline=true
no-fund=true
no-audit=true
loglevel=warn
progress=false
strict-ssl=false
EOL

echo "Installing dependencies with custom flags to reduce disk usage..."
npm cache clean --force

echo "Running npm install with reduced package set..."
# Use a custom installation approach to reduce disk usage
npm install --verbose --legacy-peer-deps --no-optional --ignore-scripts --no-audit --progress=false 2>&1 | grep -v "deprecated"

# Run only essential scripts
echo "Running only essential postinstall scripts..."
npm run postinstall --if-present

echo "Disk space after npm install:"
df -h /

echo "====== PREBUILD NPM INSTALLATION BYPASS COMPLETE ======"
exit 0
