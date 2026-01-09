.PHONY: help install dev dev-server build lint clean version-info version-patch version-minor version-major publish \
	aws-build-client aws-build-server aws-client aws-server aws aws-clean aws-load aws-up aws-down

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all workspaces
	npm install

dev: ## Start the client development server
	npm run dev:client

dev-server: ## Start the server development server
	npm run dev:server

build: ## Build the client for production
	npm run build:client

lint: ## Lint the client codebase
	npm run lint -w client

clean: ## Clean up build artifacts and node_modules
	rm -rf node_modules client/node_modules server/node_modules client/dist server/dist

version-info: ## Show current version info
	@echo "Package version: $$(npm pkg get version)"
	@echo "Git tag: $$(git describe --tags --always 2>/dev/null || echo 'no-tags')"

version-patch: ## Bump patch version (0.0.x)
	$(MAKE) version-bump BUMP=patch

version-minor: ## Bump minor version (0.x.0)
	$(MAKE) version-bump BUMP=minor

version-major: ## Bump major version (x.0.0)
	$(MAKE) version-bump BUMP=major

version-bump:
	@if [ -z "$(BUMP)" ]; then echo "Error: BUMP variable not set"; exit 1; fi
	@echo "Bumping version ($(BUMP))..."
	npm version $(BUMP) --no-git-tag-version
	@VERSION=$$(npm pkg get version | tr -d '"'); \
	echo "Syncing version $$VERSION to workspaces..."; \
	npm pkg set version="$$VERSION" -w client; \
	npm pkg set version="$$VERSION" -w server; \
	echo "Generating changelog..."; \
	npx conventional-changelog-cli -p angular -i CHANGELOG.md -s; \
	git add package.json package-lock.json client/package.json server/package.json CHANGELOG.md; \
	if [ -f client/package-lock.json ]; then git add client/package-lock.json; fi; \
	if [ -f server/package-lock.json ]; then git add server/package-lock.json; fi; \
	git commit -m "v$$VERSION"; \
	git tag "v$$VERSION"
	@echo "✓ Version bumped, changelog generated, and synced to $$VERSION"

publish: ## Push changes and tags to remote
	git push && git push --tags

# ============================================================================
# AWS Deployment Targets
# ============================================================================

aws-build-client: ## Build client dist folder locally for AWS (with VITE_BASE_PATH=/)
	@echo "Building client dist folder for AWS..."
	@# Clean dist folder to avoid permission issues
	@rm -rf client/dist
	cd client && VITE_BASE_PATH=/ VITE_API_BASE_URL=/api VITE_USE_MOCK_API=false npm run build
	@echo "✓ Client dist folder built successfully at client/dist"

aws-build-server: ## Build server dist folder locally for AWS
	@echo "Building server dist folder for AWS..."
	@# Clean dist folder to avoid permission issues
	@rm -rf server/dist
	cd server && npm run build
	@echo "✓ Server dist folder built successfully at server/dist"

aws-client: aws-build-client ## Build client image and save as tar.gz
	@echo "Building client Docker image..."
	@mkdir -p aws-build
	@# Temporarily rename .dockerignore to allow dist folder
	@whoami
	@if [ -f client/.dockerignore ]; then mv client/.dockerignore client/.dockerignore.bak; fi
	@if [ -f client/.dockerignore.aws ]; then cp client/.dockerignore.aws client/.dockerignore; fi
	docker build --pull --no-cache --platform linux/arm64 -f client/Dockerfile.aws -t react-fundus-chart-client:aws ./client
	@# Restore original .dockerignore
	@rm -f client/.dockerignore
	@if [ -f client/.dockerignore.bak ]; then mv client/.dockerignore.bak client/.dockerignore; fi
	docker save react-fundus-chart-client:aws | gzip > aws-build/client-image.tar.gz
	@echo "✓ Client Docker image saved to aws-build/client-image.tar.gz"
	@ls -lh aws-build/client-image.tar.gz

aws-server: aws-build-server ## Build server image and save as tar.gz
	@echo "Building server Docker image..."
	@mkdir -p aws-build
	@# Temporarily rename .dockerignore to allow dist folder
	@if [ -f server/.dockerignore ]; then mv server/.dockerignore server/.dockerignore.bak; fi
	@if [ -f server/.dockerignore.aws ]; then cp server/.dockerignore.aws server/.dockerignore; fi
	docker build --pull --no-cache --platform linux/arm64 -f server/Dockerfile.aws -t react-fundus-chart-server:aws ./server
	@# Restore original .dockerignore
	@rm -f server/.dockerignore
	@if [ -f server/.dockerignore.bak ]; then mv server/.dockerignore.bak server/.dockerignore; fi
	docker save react-fundus-chart-server:aws | gzip > aws-build/server-image.tar.gz
	@echo "✓ Server Docker image saved to aws-build/server-image.tar.gz"
	@ls -lh aws-build/server-image.tar.gz

aws: aws-client aws-server ## Build both client and server for AWS deployment
	@echo ""
	@echo "================================================"
	@echo "AWS Build Complete!"
	@echo "================================================"
	@echo "Client image: aws-build/client-image.tar.gz"
	@echo "Server image: aws-build/server-image.tar.gz"
	@echo ""
	@echo "To deploy to AWS:"
	@echo "1. Transfer files to your server:"
	@echo "   scp aws-build/*.tar.gz user@your-server:/path/to/app/"
	@echo "   scp docker-compose.aws.yml user@your-server:/path/to/app/"
	@echo ""
	@echo "2. On your server, load and run:"
	@echo "   docker load < client-image.tar.gz"
	@echo "   docker load < server-image.tar.gz"
	@echo "   docker-compose -f docker-compose.aws.yml up -d"
	@echo "================================================"

aws-clean: ## Clean AWS build artifacts
	@echo "Cleaning AWS build artifacts..."
	rm -rf aws-build
	rm -rf client/dist server/dist
	docker rmi react-fundus-chart-client:aws react-fundus-chart-server:aws 2>/dev/null || true
	@echo "✓ AWS build artifacts cleaned"

aws-load: ## Load Docker images from tar.gz files (for local testing)
	@echo "Loading Docker images..."
	@test -f aws-build/client-image.tar.gz || (echo "Error: client-image.tar.gz not found. Run 'make aws' first." && exit 1)
	@test -f aws-build/server-image.tar.gz || (echo "Error: server-image.tar.gz not found. Run 'make aws' first." && exit 1)
	docker load < aws-build/client-image.tar.gz
	docker load < aws-build/server-image.tar.gz
	@echo "✓ Docker images loaded successfully"

aws-up: ## Start AWS containers locally (for testing)
	docker-compose -f docker-compose.aws.yml up -d
	@echo "✓ Containers started. Access at http://localhost"

aws-down: ## Stop AWS containers
	docker-compose -f docker-compose.aws.yml down
	@echo "✓ Containers stopped"
