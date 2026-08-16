#!/bin/bash

# MusicGen Inference Server - Startup Script

set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults
ENVIRONMENT=${ENVIRONMENT:-"development"}
PORT=${MUSICGEN_PORT:-5000}
HOST=${MUSICGEN_HOST:-"0.0.0.0"}

echo "======================================"
echo "MusicGen Inference Server"
echo "======================================"
echo "Environment: $ENVIRONMENT"
echo "Host: $HOST"
echo "Port: $PORT"
echo ""

# Check if models need to be downloaded
if [ ! -d "models" ]; then
    echo "Creating models directory..."
    mkdir -p models
fi

# Development server
if [ "$ENVIRONMENT" = "development" ] || [ "$1" = "dev" ]; then
    echo "Starting development server (Flask)..."
    echo "Access at http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop"
    python musicgen_server.py
fi

# Production server
if [ "$ENVIRONMENT" = "production" ] || [ "$1" = "prod" ]; then
    echo "Starting production server (Gunicorn)..."

    WORKERS=${GUNICORN_WORKERS:-2}
    TIMEOUT=${GUNICORN_TIMEOUT:-120}

    echo "Workers: $WORKERS"
    echo "Timeout: ${TIMEOUT}s"
    echo "Access at http://$HOST:$PORT"
    echo ""

    gunicorn \
        -b "$HOST:$PORT" \
        -w "$WORKERS" \
        -t "$TIMEOUT" \
        --graceful-timeout 30 \
        --access-logfile - \
        --error-logfile - \
        musicgen_server:app
fi

# Docker mode
if [ "$ENVIRONMENT" = "docker" ] || [ "$1" = "docker" ]; then
    echo "Starting in Docker mode..."
    exec gunicorn \
        -b "0.0.0.0:5000" \
        -w 2 \
        -t 120 \
        --graceful-timeout 30 \
        --access-logfile - \
        --error-logfile - \
        musicgen_server:app
fi

# Test mode
if [ "$1" = "test" ]; then
    echo "Running tests..."
    python test_server.py
fi

# If no argument, show usage
if [ $# -eq 0 ]; then
    echo "Usage: ./run.sh [dev|prod|docker|test]"
    echo ""
    echo "  dev      - Run development server with Flask"
    echo "  prod     - Run production server with Gunicorn"
    echo "  docker   - Run in Docker container"
    echo "  test     - Run test suite"
    echo ""
    echo "Environment variables (from .env):"
    echo "  MUSICGEN_HOST      - Server host (default: 0.0.0.0)"
    echo "  MUSICGEN_PORT      - Server port (default: 5000)"
    echo "  ENVIRONMENT        - Environment mode"
    echo "  DEVICE             - GPU/CPU device (default: cuda)"
    echo "  DEBUG              - Debug mode (default: false)"
fi
