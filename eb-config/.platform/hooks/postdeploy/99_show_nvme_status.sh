#!/bin/bash
# Report NVMe status for dashboard monitoring

set -e
echo "===== REPORTING NVME STATUS ====="

# Store device info in a central location
NVME_INFO_FILE="/var/app/current/nvme-info.json"

# Check for NVMe devices in a more robust way
NVME_DEVICE=""
if lsblk -d | grep -q nvme1n1; then
  NVME_DEVICE="/dev/nvme1n1"
elif lsblk -d | grep -q nvme0n1; then
  NVME_DEVICE="/dev/nvme0n1"
elif lsblk -d | grep -q nvme; then
  # If we have any nvme device, grab the first one
  NVME_DEVICE=$(lsblk -d | grep nvme | head -n1 | awk '{print $1}')
  NVME_DEVICE="/dev/$NVME_DEVICE"
fi

# Print device info for debugging
echo "NVMe device check:"
lsblk -d
echo "Selected NVMe device: $NVME_DEVICE"

# Create JSON with mount info - with more robust NVMe detection
if [ -n "$NVME_DEVICE" ]; then
  echo "NVMe disk detected: $NVME_DEVICE, gathering info..."
  
  # Check if it's mounted
  NVME_MOUNT=$(mount | grep $NVME_DEVICE | awk '{print $3}' | head -n1)
  if [ -z "$NVME_MOUNT" ]; then
    NVME_MOUNT="/mnt/nvme_data"
  fi
  
  IS_MOUNTED=$(mountpoint -q $NVME_MOUNT && echo "true" || echo "false")
  
  # Check if swap is enabled on NVMe
  SWAP_ENABLED=$(swapon -s | grep -q "$NVME_MOUNT/swap" && echo "true" || echo "false")
  
  # Create basic JSON structure
  cat > $NVME_INFO_FILE <<JSONEOF
{
  "nvmeAvailable": true,
  "device": "$NVME_DEVICE",
  "mountPoint": "$NVME_MOUNT",
  "isMounted": $IS_MOUNTED,
  "swapEnabled": $SWAP_ENABLED,
  "cacheDirectories": [
    "npm-cache",
    "nginx-cache"
  ],
  "diskInfo": {
JSONEOF
  
  # Add disk info
  if [ "$IS_MOUNTED" = "true" ]; then
    # Get disk usage info
    DISK_INFO=$(df -h $NVME_MOUNT | tail -n 1)
    TOTAL=$(echo $DISK_INFO | awk '{print $2}')
    USED=$(echo $DISK_INFO | awk '{print $3}')
    AVAIL=$(echo $DISK_INFO | awk '{print $4}')
    USE_PCT=$(echo $DISK_INFO | awk '{print $5}' | tr -d '%')
    
    # Add to JSON
    cat >> $NVME_INFO_FILE <<JSONEOF
    "total": "$TOTAL",
    "used": "$USED",
    "available": "$AVAIL",
    "usedPercent": $USE_PCT
JSONEOF
  else
    # Not mounted but device exists
    echo "NVMe device exists but is not mounted"
    
    # Add default 0 values since we can't get actual info
    cat >> $NVME_INFO_FILE <<JSONEOF
    "total": "0",
    "used": "0",
    "available": "0",
    "usedPercent": 0
JSONEOF
  fi
  
  # Close JSON
  cat >> $NVME_INFO_FILE <<JSONEOF
  },
  "mounts": [
JSONEOF

  # Add mount points info if mounted
  if [ "$IS_MOUNTED" = "true" ]; then
    # Add special directories on NVMe
    FIRST_MOUNT=true
    
    for DIR in "node_modules" "npm-cache" "nginx-cache"; do
      if [ -d "$NVME_MOUNT/$DIR" ]; then
        if [ "$FIRST_MOUNT" = "true" ]; then
          FIRST_MOUNT=false
        else
          echo "," >> $NVME_INFO_FILE
        fi
        
        # Get size of directory
        SIZE_INFO=$(du -sh $NVME_MOUNT/$DIR 2>/dev/null || echo "0M")
        SIZE=$(echo $SIZE_INFO | awk '{print $1}')
        
        # Add to JSON
        cat >> $NVME_INFO_FILE <<JSONEOF
    {
      "mountPoint": "$NVME_MOUNT/$DIR",
      "type": "$(echo $DIR | sed 's/-/ /g')",
      "size": "$SIZE"
    }
JSONEOF
      fi
    done
    
    # Add SWAP info if enabled
    if [ "$SWAP_ENABLED" = "true" ]; then
      if [ "$FIRST_MOUNT" = "true" ]; then
        FIRST_MOUNT=false
      else
        echo "," >> $NVME_INFO_FILE
      fi
      
      # Get swap size
      SWAP_SIZE=$(ls -lh $NVME_MOUNT/swap.1 2>/dev/null | awk '{print $5}')
      
      cat >> $NVME_INFO_FILE <<JSONEOF
    {
      "mountPoint": "$NVME_MOUNT/swap.1",
      "type": "swap file",
      "size": "$SWAP_SIZE"
    }
JSONEOF
    fi
  fi
  
  # Close JSON array and object
  cat >> $NVME_INFO_FILE <<JSONEOF
  ]
}
JSONEOF

else
  # No NVMe available
  echo "No NVMe device found"
  cat > $NVME_INFO_FILE <<JSONEOF
{
  "nvmeAvailable": false,
  "device": null,
  "mountPoint": null,
  "isMounted": false,
  "swapEnabled": false,
  "cacheDirectories": [],
  "diskInfo": {
    "total": "0",
    "used": "0",
    "available": "0",
    "usedPercent": 0
  },
  "mounts": []
}
JSONEOF
fi

echo "NVMe info file generated at $NVME_INFO_FILE"
echo "Contents:"
cat $NVME_INFO_FILE
chmod 644 $NVME_INFO_FILE
chown webapp:webapp $NVME_INFO_FILE

exit 0
