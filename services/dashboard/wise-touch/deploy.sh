#!/bin/bash

PI_HOST="dwise@192.168.8.136"
PI_PATH="/home/dwise/wise-touch"
LOCAL_PATH="/private/tmp/claude-501/-Users-danielwise/6ed78171-1494-4bb7-bc30-66da3019e894/scratchpad/wise2-core/wise-touch"

echo "📦 Deploying WISE TOUCH to Raspberry Pi..."
echo ""

# Create remote directory
echo "1️⃣  Creating directory on Pi..."
ssh $PI_HOST "mkdir -p $PI_PATH"

# Copy source files (exclude large folders)
echo "2️⃣  Copying source files..."
rsync -avz --exclude=node_modules --exclude=.next --exclude=.git \
  $LOCAL_PATH/ $PI_HOST:$PI_PATH/

# Install dependencies on Pi
echo "3️⃣  Installing dependencies on Pi..."
ssh $PI_HOST "cd $PI_PATH && npm install"

# Build on Pi
echo "4️⃣  Building on Pi..."
ssh $PI_HOST "cd $PI_PATH && npm run build"

# Start with PM2
echo "5️⃣  Starting with PM2..."
ssh $PI_HOST "cd $PI_PATH && pm2 start 'npm start' --name wise-touch --restart-delay 5000"

# Check status
echo ""
echo "6️⃣  Checking status..."
ssh $PI_HOST "pm2 status"

echo ""
echo "✅ Deployment complete!"
echo "Access WISE TOUCH at: http://192.168.8.136:3000"
