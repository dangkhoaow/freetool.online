#!/bin/bash
# Fix nginx configuration for t4g.nano deployment
set -e

echo "====== CONFIGURING NGINX FOR T4G.NANO ======"

# Create nginx configuration directory if it doesn't exist
mkdir -p /etc/nginx/conf.d

# Ensure proper permissions for nginx config files
chown -R root:root /etc/nginx/conf.d
chmod 644 /etc/nginx/conf.d/*.conf 2>/dev/null || true

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t || {
    echo "Nginx configuration test failed. Fixing..."
    
    # Remove any problematic configurations
    rm -f /etc/nginx/conf.d/static-files.conf 2>/dev/null || true
    rm -f /etc/nginx/conf.d/t4g-nano-optimization.conf 2>/dev/null || true
    rm -f /etc/nginx/conf.d/freetool-web.conf 2>/dev/null || true
    
    echo "Problematic nginx configs removed. Will be recreated by EB."
}

# Create backup of original nginx config
if [ -f "/etc/nginx/nginx.conf" ] && [ ! -f "/etc/nginx/nginx.conf.backup" ]; then
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    echo "Created backup of original nginx.conf"
fi

echo "====== NGINX CONFIGURATION SETUP COMPLETE ======"
exit 0
