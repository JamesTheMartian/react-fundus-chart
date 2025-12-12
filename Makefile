.PHONY: help install dev dev-server build lint clean version-info version-patch version-minor version-major publish

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
	npm version patch

version-minor: ## Bump minor version (0.x.0)
	npm version minor

version-major: ## Bump major version (x.0.0)
	npm version major

publish: ## Push changes and tags to remote
	git push && git push --tags
