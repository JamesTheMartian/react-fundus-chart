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
