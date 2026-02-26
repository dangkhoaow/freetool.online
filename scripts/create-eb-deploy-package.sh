#!/bin/bash
# Clean deployment package creation script for AWS Elastic Beanstalk
# Optimized for Node.js 22 on Amazon Linux 2023/6.6.4 with t4g.nano instances

set -e

# Parse command-line options
SKIP_BUILD=false
ZIP_ONLY=false
CLEANUP_DISK=false
for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      ;;
    --zip-only)
      ZIP_ONLY=true
      ;;
    --cleanup-disk)
      CLEANUP_DISK=true
      ;;
    --help|-h)
      echo "EB deployment package creator (t4g.nano)"
      echo ""
      echo "Usage:"
      echo "  $0                 # Build and create package"
      echo "  $0 --skip-build   # Skip build, use existing .next"
      echo "  $0 --zip-only     # Only create zip from current tree"
      echo "  $0 --cleanup-disk # Before build: remove old zip, .venv, run git gc"
      echo "  $0 --help         # Show this help"
      echo ""
      echo "Use --cleanup-disk to free space (e.g. .venv ~2GB, old zip, shrink .git)."
      exit 0
      ;;
  esac
done

# Configuration
ZIP_FILE="eb-deploy-package.zip"
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR=$(pwd)

# Cleanup function
cleanup() {
  echo "Cleaning up temporary directory..."
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Optional disk cleanup (--cleanup-disk): remove old zip, .venv, run git gc
if [ "$CLEANUP_DISK" = true ]; then
  echo "===== Disk cleanup (--cleanup-disk) ====="
  if [ -f "$ZIP_FILE" ]; then
    echo "Removing existing $ZIP_FILE..."
    rm -f "$ZIP_FILE"
    echo "  $ZIP_FILE removed."
  fi
  if [ -d ".venv" ]; then
    echo "Removing .venv (recreate with: python -m venv .venv if needed)..."
    rm -rf .venv
    echo "  .venv removed."
  fi
  if [ -d ".git" ]; then
    echo "Running git gc --prune=now to shrink .git..."
    git gc --prune=now 2>/dev/null || true
    echo "  git gc done."
  fi
  echo "Disk cleanup complete."
  echo ""
fi

# Remove existing package (if not already removed by --cleanup-disk)
if [ -f "$ZIP_FILE" ]; then
    echo "Removing existing $ZIP_FILE..."
    rm -f "$ZIP_FILE"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - Creating deployment package for t4g.nano"
echo "Package directory: $TEMP_DIR"

# Step 1: Build application locally if needed
if [ "$SKIP_BUILD" = false ] && [ "$ZIP_ONLY" = false ]; then
  echo "===== Building application locally ====="
  npm install --force
  npm run build
else
  echo "===== Skipping build ====="
  if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found. Cannot skip build."
    exit 1
  fi
fi

# Step 2: Copy project files with exclusions
echo "===== Copying project files ====="
rsync -av \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.zip' \
  --exclude='.next/cache' \
  --exclude='*.tsbuildinfo' \
  --exclude='.eslintcache' \
  --exclude='*.map' \
  --exclude='__pycache__' \
  --exclude='venv' \
  --exclude='.github' \
  --exclude='.husky' \
  --exclude='__tests__' \
  --exclude='tests' \
  --exclude='e2e' \
  --exclude='coverage' \
  --exclude='docs' \
  --exclude='stories' \
  --exclude='.storybook' \
  --exclude='tmp' \
  --exclude='uploads' \
  --exclude='logs' \
  --exclude='dist' \
  ./ "$TEMP_DIR/"

# Step 3: Copy .next directory (excluding webpack cache)
echo "===== Copying .next directory ====="
if [ -d ".next" ]; then
  rsync -av --exclude='cache/webpack' .next/ "$TEMP_DIR/.next/"
fi

# Step 4: Clean up unnecessary files
echo "===== Cleaning unnecessary files ====="
find "$TEMP_DIR" -name "*.map" -delete 2>/dev/null || true
find "$TEMP_DIR" -name "*.tsbuildinfo" -delete 2>/dev/null || true
find "$TEMP_DIR" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Step 5: Create essential deployment files
cd "$TEMP_DIR"

# Procfile for t4g.nano
cat > "Procfile" << 'EOF'
web: npm start
EOF

# Basic .npmrc (the eb-config will handle the rest)
cat > ".npmrc" << 'EOF'
legacy-peer-deps=true
prefer-offline=true
no-fund=true
no-audit=true
loglevel=error
progress=false
EOF

# Set executable permissions for EB config files
find eb-config -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
find eb-config -name "*.config" -exec chmod 644 {} \; 2>/dev/null || true

echo "===== Creating deployment package ====="
cd "$PACKAGE_DIR"

# Create ZIP package
COMPRESS_START=$(date +%s)
(cd "$TEMP_DIR" && zip -9yr -q "$PACKAGE_DIR/$ZIP_FILE" .)
COMPRESS_END=$(date +%s)
COMPRESS_TIME=$((COMPRESS_END - COMPRESS_START))

echo "Package created in $COMPRESS_TIME seconds"
du -sh "$ZIP_FILE"

echo "===== DEPLOYMENT PACKAGE READY ====="
echo "✅ Package: $(pwd)/$ZIP_FILE"
echo "✅ Optimized for: t4g.nano ARM instances"
echo "✅ Node.js: 22.x with memory optimization"
echo "✅ Swap: 1024MB (configured via eb-config)"
echo "✅ Enhanced Health: Enabled"
echo ""
echo "Deploy command:"
echo "  aws elasticbeanstalk create-application-version ..."
echo "  or use AWS EB Console"