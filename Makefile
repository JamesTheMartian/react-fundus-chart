.PHONY: help install dev dev-server build lint clean

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
