.PHONY: help install build dev test lint format clean docker-build docker-run docker-stop deploy

help:
	@echo "WISE² Edge Appliance - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make build        - Build TypeScript"
	@echo "  make dev          - Start development server"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier"
	@echo "  make type-check   - Check TypeScript types"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Start Docker containers"
	@echo "  make docker-stop  - Stop Docker containers"
	@echo "  make docker-logs  - View container logs"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       - Deploy with Ansible"
	@echo "  make deploy-canary - Deploy to canary (edge-node-2)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make format-check - Check formatting without changes"

install:
	npm install

build:
	npm run build

dev:
	npm run dev

test:
	npm run test

test-watch:
	npm run test:watch

test-cov:
	npm run test:cov

lint:
	npm run lint

format:
	npm run format

format-check:
	npm run format:check

type-check:
	npm run type-check

clean:
	rm -rf dist coverage node_modules .turbo
	npm cache clean --force

docker-build:
	npm run docker:build

docker-run:
	npm run docker:run

docker-stop:
	npm run docker:stop

docker-logs:
	docker-compose logs -f edge-runtime

deploy:
	@echo "Deploying to all edge nodes..."
	ansible-playbook -i ansible/inventory.yml ansible/setup.yml

deploy-canary:
	@echo "Deploying to canary (edge-node-2)..."
	ansible-playbook -i ansible/inventory.yml ansible/setup.yml -l edge-canary

deploy-primary:
	@echo "Deploying to primary (edge-node-1)..."
	ansible-playbook -i ansible/inventory.yml ansible/setup.yml -l edge-primary

status:
	curl http://localhost:3000/health | jq

health-report:
	curl http://localhost:3000/health/report

metrics:
	curl http://localhost:3000/health/metrics | jq

logs:
	journalctl -u wise2-edge -f

logs-health:
	journalctl -u wise2-health-check -f

.DEFAULT_GOAL := help
