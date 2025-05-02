#!/bin/bash
# Modify npm commands in build scripts to include legacy-peer-deps

set -e
echo "====== MODIFYING NPM COMMANDS ======"

# Look for deploy scripts that might have npm install commands
DEPLOY_SCRIPTS=(
  "/opt/elasticbeanstalk/hooks/appdeploy/pre/50npm.sh"
  "/opt/elasticbeanstalk/hooks/configdeploy/pre/50npm.sh"
)

for script in "${DEPLOY_SCRIPTS[@]}"; do
  if [ -f "$script" ]; then
    echo "Modifying $script to use --legacy-peer-deps"
    
    # Make a backup
    cp "$script" "${script}.bak"
    
    # Replace npm install commands with ones that include --legacy-peer-deps
    sed -i 's/npm install/npm install --legacy-peer-deps/g' "$script"
    sed -i 's/npm ci/npm ci --legacy-peer-deps/g' "$script"
    
    echo "Modified $script successfully"
  else
    echo "Script $script not found, skipping"
  fi
done

echo "====== NPM COMMAND MODIFICATION COMPLETE ======"
exit 0
