.PHONY: help install dev prod test docker-build docker-run docker-stop clean lint format

PYTHON := python3
PIP := pip3
VENV := venv
PORT := 5000

help:
	@echo "MusicGen Inference Server - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Run development server"
	@echo "  make test         - Run test suite"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Run production server"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-stop  - Stop Docker container"
	@echo ""
	@echo "Maintenance:"
	@echo "  make lint         - Run linting"
	@echo "  make format       - Format code"
	@echo "  make clean        - Clean up temporary files"

install:
	@echo "Installing dependencies..."
	$(PIP) install -r requirements.txt

install-dev:
	@echo "Installing development dependencies..."
	$(PIP) install -r requirements.txt
	$(PIP) install pytest black flake8 mypy

dev:
	@echo "Starting development server..."
	ENVIRONMENT=development ./run.sh dev

prod:
	@echo "Starting production server..."
	ENVIRONMENT=production ./run.sh prod

test:
	@echo "Running test suite..."
	./run.sh test

lint:
	@echo "Running linting..."
	flake8 *.py --max-line-length=120 --ignore=E501,W503
	mypy *.py --ignore-missing-imports

format:
	@echo "Formatting code..."
	black *.py --line-length=120

docker-build:
	@echo "Building Docker image..."
	docker build -t musicgen-service:latest .

docker-run:
	@echo "Running Docker container..."
	docker run -it --gpus all \
		-p $(PORT):5000 \
		-v $(PWD)/models:/app/models \
		-v $(PWD)/logs:/app/logs \
		musicgen-service:latest

docker-stop:
	@echo "Stopping Docker container..."
	docker stop musicgen-service || true
	docker rm musicgen-service || true

docker-compose-up:
	@echo "Starting with docker-compose..."
	docker-compose up -d

docker-compose-down:
	@echo "Stopping docker-compose..."
	docker-compose down

docker-compose-logs:
	@echo "Showing docker-compose logs..."
	docker-compose logs -f musicgen-service

logs:
	@echo "Showing application logs..."
	tail -f logs/*.log

clean:
	@echo "Cleaning up..."
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".DS_Store" -delete
	rm -rf .pytest_cache .mypy_cache .coverage htmlcov
	rm -rf *.egg-info build dist

.DEFAULT_GOAL := help
