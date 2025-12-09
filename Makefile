.PHONY: help install dev build lint preview clean

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start the development server
	npm run dev

build: ## Build the project for production
	npm run build

lint: ## Lint the codebase
	npm run lint

preview: ## Preview the production build
	npm run preview

clean: ## Clean up build artifacts and node_modules
	rm -rf dist node_modules

version-info: ## Show current version info
	@echo "Package version: $$(npm pkg get version)"
	@echo "Git tag: $$(git describe --tags --always 2>/dev/null || echo 'no-tags')"

version-patch: ## Bump patch version (0.0.x)
	npm version patch

version-minor: ## Bump minor version (0.x.0)
	npm version minor

version-major: ## Bump major version (x.0.0)
	npm version major
