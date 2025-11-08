#!/bin/bash
# Heavy dependencies optimization for t4g.micro (FFmpeg, TensorFlow, WebLLM)
set -e

echo "====== HEAVY DEPENDENCIES OPTIMIZATION FOR T4G.MICRO ======"

# Verify swap is active (should be created by ebextensions commands)
if ! swapon --show | grep -q "/swapfile"; then
    echo "❌ ERROR: Swap not found! Heavy dependencies require swap space."
    echo "Current memory status:"
    free -h
    exit 1
fi

echo "✅ Swap is active for t4g.micro heavy dependencies:"
swapon --show
free -h

# Set npm configuration for heavy dependencies on t4g.micro
echo "Configuring npm for t4g.micro heavy dependencies (FFmpeg, TensorFlow, WebLLM)..."
npm config set maxsockets 4
npm config set fetch-timeout 600000
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000
npm config set registry https://registry.npmjs.org/
npm config set prefer-offline false
npm config set progress false
npm config set loglevel error
npm config set audit false
npm config set fund false

# Increase Node.js memory for npm install process (t4g.micro has 1GB RAM)
export NODE_OPTIONS="--max-old-space-size=1280"
echo "Set NODE_OPTIONS=$NODE_OPTIONS for npm install on t4g.micro"

# Clear npm cache to free up space
echo "Clearing npm cache before heavy dependency install..."
npm cache clean --force 2>/dev/null || true

# Show memory status before heavy operations
echo "Memory status before heavy dependency installation on t4g.micro:"
free -h
df -h /

echo "====== T4G.MICRO READY FOR HEAVY DEPENDENCIES INSTALL ======"
