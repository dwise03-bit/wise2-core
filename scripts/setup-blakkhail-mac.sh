#!/bin/bash
# BLAKKHAIL Storefront - Mac Setup Script
# One-command install for easy BLAKKHAIL deployment

set -e

echo "🎬 BLAKKHAIL Storefront - Mac Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker Desktop for Mac first:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker found"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Install Xcode Command Line Tools:"
    echo "   xcode-select --install"
    exit 1
fi

echo "✅ Git found"
echo ""

# Navigate to project
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Project: $PROJECT_DIR"
echo ""

# Build Docker image
echo "🏗️  Building Docker image..."
docker-compose -f docker-compose.prod.yml build website

echo ""
echo "🚀 Starting BLAKKHAIL..."
docker-compose -f docker-compose.prod.yml up -d website

echo ""
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3001/sencere/blakkhail > /dev/null 2>&1; then
    echo ""
    echo "✅ BLAKKHAIL is LIVE!"
    echo ""
    echo "📍 Access at: http://localhost:3001/sencere/blakkhail"
    echo ""
    echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
    echo ""
else
    echo ""
    echo "⚠️  Server may still be starting... trying again in 5 seconds"
    sleep 5

    if curl -s http://localhost:3001/sencere/blakkhail > /dev/null 2>&1; then
        echo "✅ BLAKKHAIL is LIVE!"
        echo ""
        echo "📍 Access at: http://localhost:3001/sencere/blakkhail"
    else
        echo "❌ Server failed to start. Check Docker logs:"
        echo "   docker-compose -f docker-compose.prod.yml logs website"
        exit 1
    fi
fi
