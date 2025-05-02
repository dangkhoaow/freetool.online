#!/bin/bash
# Set up NVMe very early in the process to prevent disk space issues
# This must run before any npm operations

set -e
echo "====== EARLY PREBUILD: EMERGENCY SETUP FOR NVME ======"

# Emergency disk space cleanup
echo "Running emergency disk cleanup..."
find /tmp -type f -not -path "*/\.ssh/*" -delete 2>/dev/null || true
find /var/log -name "*.gz" -delete 2>/dev/null || true
find /var/log -name "*.old" -delete 2>/dev/null || true
find /var/log -type f -size +10M -exec truncate -s 10M {} \; 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

# Clear package manager caches
if command -v yum >/dev/null 2>&1; then
  echo "Cleaning yum cache..."
  yum clean all
  rm -rf /var/cache/yum
fi

# Configure node and npm to use less disk space
export NODE_OPTIONS="--max-old-space-size=512"

# Check for NVMe device
echo "Checking for NVMe device..."
if lsblk | grep -q "nvme"; then
  # NVMe device found
  echo "NVMe device found, setting up..."
  
  # Ensure NVMe is properly configured
  if [ -f "/usr/local/bin/configure-nvme.sh" ]; then
    echo "Running NVMe configuration script..."
    /usr/local/bin/configure-nvme.sh
  else
    echo "NVMe configuration script not found, setting up manually..."
    
    # Check if nvme1n1 exists
    NVME_DEVICE=""
    if lsblk | grep -q nvme1n1; then
      NVME_DEVICE="/dev/nvme1n1"
    elif lsblk | grep -q nvme0n1; then
      NVME_DEVICE="/dev/nvme0n1"
    else
      # Get first nvme device
      NVME_DEVICE=$(lsblk | grep nvme | head -n1 | awk '{print $1}')
      NVME_DEVICE="/dev/$NVME_DEVICE"
    fi
    
    echo "Found NVMe device: $NVME_DEVICE"
    
    # Format if needed
    if ! blkid $NVME_DEVICE > /dev/null; then
      echo "Formatting NVMe disk..."
      mkfs -t xfs $NVME_DEVICE
    fi
    
    # Create and mount
    NVME_MOUNT="/mnt/nvme_data"
    mkdir -p $NVME_MOUNT
    
    if ! mountpoint -q $NVME_MOUNT; then
      echo "Mounting NVMe disk to $NVME_MOUNT..."
      mount $NVME_DEVICE $NVME_MOUNT
      echo "$NVME_DEVICE $NVME_MOUNT xfs defaults,nofail 0 2" >> /etc/fstab
    fi
  fi
  
  # Make sure NVMe is mounted
  NVME_MOUNT="/mnt/nvme_data"
  if mountpoint -q $NVME_MOUNT; then
    echo "NVMe mounted at $NVME_MOUNT"
    
    # Create node_modules directory on NVMe
    mkdir -p $NVME_MOUNT/node_modules
    chmod 777 $NVME_MOUNT/node_modules
    chown webapp:webapp $NVME_MOUNT/node_modules
    
    # Create npm cache directory
    mkdir -p $NVME_MOUNT/npm-cache
    chmod 777 $NVME_MOUNT/npm-cache
    
    # Set up symlinks NOW before any npm operations
    # Override the paths to make absolutely sure npm uses NVMe
    export NPM_CONFIG_CACHE="$NVME_MOUNT/npm-cache"
    
    # Force npm to respect our settings
    echo "Setting global npm config"
    npm config set cache $NVME_MOUNT/npm-cache --global
    npm config set legacy-peer-deps true --global
    
    # Create global .npmrc 
    echo "Creating global .npmrc files"
    cat > /etc/npmrc <<EOL
cache=$NVME_MOUNT/npm-cache
legacy-peer-deps=true
EOL
    
    cat > /root/.npmrc <<EOL
cache=$NVME_MOUNT/npm-cache
legacy-peer-deps=true
EOL
    
    if [ -d "/home/webapp" ]; then
      cat > /home/webapp/.npmrc <<EOL
cache=$NVME_MOUNT/npm-cache
legacy-peer-deps=true
EOL
      chown webapp:webapp /home/webapp/.npmrc
    fi
    
    # Then create staging directory symlink
    if [ -d "/var/app/staging" ]; then
      echo "Setting up symlink for staging node_modules"
      
      # Ensure staging directory exists
      mkdir -p /var/app/staging
      
      # Remove node_modules if it's a directory
      if [ -d "/var/app/staging/node_modules" ] && [ ! -L "/var/app/staging/node_modules" ]; then
        echo "Removing existing node_modules directory"
        rm -rf /var/app/staging/node_modules
      fi
      
      # Create symlink to NVMe
      if [ ! -L "/var/app/staging/node_modules" ]; then
        echo "Creating symlink to $NVME_MOUNT/node_modules"
        ln -sf $NVME_MOUNT/node_modules /var/app/staging/node_modules
        chown -h webapp:webapp /var/app/staging/node_modules
      fi
      
      # Create .npmrc in staging directory
      echo "Creating .npmrc in staging directory"
      cat > /var/app/staging/.npmrc <<EOL
cache=$NVME_MOUNT/npm-cache
prefer-offline=true
legacy-peer-deps=true
EOL
      chown webapp:webapp /var/app/staging/.npmrc
    fi
    
    echo "NVMe setup complete"
  else
    echo "WARNING: NVMe is not mounted"
  fi
else
  echo "No NVMe device found, cannot set up"
fi

echo "Current mount points:"
mount | grep -E 'ext4|xfs|nvme'

echo "Current disk space:"
df -h

echo "====== EARLY PREBUILD SETUP COMPLETE ======"
exit 0
