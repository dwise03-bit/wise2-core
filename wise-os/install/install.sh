#!/bin/bash

# WiseOS Installation Script for Raspberry Pi

set -e

echo "🚀 Installing WiseOS..."

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️  Warning: Not detected as Raspberry Pi. Proceeding anyway..."
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node version
echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Navigate to wise-os directory
WISEOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WISEOS_DIR"

echo "📂 Installing to: $WISEOS_DIR"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2 for process management..."
    sudo npm install -g pm2
    pm2 startup
fi

# Start with PM2
echo "🎯 Starting WiseOS with PM2..."
pm2 start server.js --name "wise-os" --watch
pm2 save

echo "✅ WiseOS installed successfully!"
echo "🌐 Access dashboard at: http://$(hostname -I | awk '{print $1}'):3000"
echo "📊 System stats updating in real-time"
echo ""
echo "Useful commands:"
echo "  pm2 start wise-os       # Start the service"
echo "  pm2 stop wise-os        # Stop the service"
echo "  pm2 restart wise-os     # Restart the service"
echo "  pm2 logs wise-os        # View logs"
echo "  pm2 delete wise-os      # Remove from PM2"
