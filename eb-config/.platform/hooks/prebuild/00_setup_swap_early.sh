#!/bin/bash
# CRITICAL: Setup swap BEFORE deployment starts to prevent memory issues
set -e

echo "====== EMERGENCY SWAP SETUP FOR T4G.NANO ======"

# Check if swap already exists and is active
if swapon --show | grep -q "/swapfile"; then
    echo "✅ Swap already active"
    free -h
    exit 0
fi

# Create 2048MB swap file IMMEDIATELY
SWAP_FILE="/swapfile"
SWAP_SIZE_MB=2048

echo "🚨 CRITICAL: Creating ${SWAP_SIZE_MB}MB swap file for t4g.nano..."

# Remove old swap file if exists but not active
if [ -f "$SWAP_FILE" ]; then
    swapoff "$SWAP_FILE" 2>/dev/null || true
    rm -f "$SWAP_FILE"
fi

# Create swap file quickly
dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$SWAP_SIZE_MB status=progress
chmod 600 "$SWAP_FILE"
mkswap "$SWAP_FILE"
swapon "$SWAP_FILE"

# Add to fstab for persistence
if ! grep -q "$SWAP_FILE" /etc/fstab; then
    echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
fi

# Configure aggressive swapping for t4g.nano
echo "vm.swappiness=80" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
echo "vm.dirty_ratio=15" >> /etc/sysctl.conf
echo "vm.dirty_background_ratio=5" >> /etc/sysctl.conf
sysctl -p

# Free up memory immediately
echo "🧹 Freeing memory caches..."
sync
echo 3 > /proc/sys/vm/drop_caches

# Kill unnecessary processes
pkill -f "yum\|dnf\|packagekit" 2>/dev/null || true

echo "✅ SWAP ACTIVATED SUCCESSFULLY"
echo "Memory status after swap setup:"
free -h
echo "Swap status:"
swapon --show

echo "====== SWAP SETUP COMPLETE ======"
