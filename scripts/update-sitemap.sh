#!/bin/bash

# Navigate to the project root directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo "===== Updating Sitemap and SEO Configurations ====="

# Ensure next-sitemap is installed
echo "Checking for next-sitemap installation..."
if ! npm list --depth=0 next-sitemap | grep -q 'next-sitemap'; then
  echo "Installing next-sitemap..."
  npm install --save-dev next-sitemap --legacy-peer-deps
else
  echo "next-sitemap is already installed."
fi

# Ensure next build is completed
echo "Building Next.js application..."
npm run build

# Generate sitemap
echo "Generating sitemap with next-sitemap..."
npx next-sitemap --config next-sitemap.config.js

# Verify sitemap was generated
if [ -f "public/sitemap.xml" ]; then
  echo "✅ Sitemap generated successfully at public/sitemap.xml"
  echo "Contents of sitemap.xml:"
  cat public/sitemap.xml | head -20
  echo "..."
else
  echo "❌ Error: Sitemap generation failed!"
  exit 1
fi

# Check robots.txt
if [ -f "public/robots.txt" ]; then
  echo "✅ robots.txt generated successfully"
  echo "Contents of robots.txt:"
  cat public/robots.txt
else
  echo "❌ Warning: robots.txt was not generated!"
fi

echo "===== SEO Update Complete ====="
echo "You can now test your sitemap at: https://freetool.online/sitemap.xml"
echo "You can test your robots.txt at: https://freetool.online/robots.txt"
echo "Don't forget to create a new deployment package with './scripts/create-eb-deploy-package.sh'" 