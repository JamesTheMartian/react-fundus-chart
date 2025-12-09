# Versioning Strategy

This project uses **Semantic Versioning** driven by `npm version` and **Git Tags**.

## The "Source of Truth"

1.  **Primary**: The Git Tag (e.g., `v1.0.0`) is the absolute source of truth for releases.
2.  **Secondary**: `package.json` tracks the version for the frontend and npm ecosystem.

## Workflow

To release a new version, run one of the following commands in the root directory:

```bash
npm version patch   # 0.0.1 -> 0.0.2
npm version minor   # 0.0.1 -> 0.1.0
npm version major   # 0.0.1 -> 1.0.0
```

This command will:
1.  Update `version` in `package.json`.
2.  Commit the change.
3.  Create a Git Tag (e.g., `v0.0.2`).

## Backend Implementation

For compiled or runtime backends (Go, Python), you should **inject** the version from the Git Tag at build/deploy time, rather than hardcoding it in source files.

### 1. Go (Golang)

In Go, use `ldflags` to set a variable at build time.

**Code (`main.go`):**
```go
package main

import "fmt"

// Version is injected at build time
var Version = "dev"

func main() {
    fmt.Printf("Starting Service v%s\n", Version)
}
```

**Build Command:**
```bash
# Extract version from git tag
VERSION=$(git describe --tags --always)

# Build with version injection
go build -ldflags "-X main.Version=$VERSION" -o myapp
```

### 2. Python

For Python, you can pass the version as an environment variable or write a temporary version file during deployment.

**Code (`app.py`):**
```python
import os

# Read from env, default to 'dev'
VERSION = os.getenv('APP_VERSION', 'dev')

print(f"Starting API v{VERSION}")
```

**Run Command:**
```bash
export APP_VERSION=$(git describe --tags --always)
python app.py
```

### 3. React (Frontend)

We have already configured Vite to read from `package.json`.
- It is available globally as `__APP_VERSION__`.
- It is displayed in the Sidebar.

## Summary

| Component | Source | Mechanism |
|-----------|--------|-----------|
| **Frontend** | `package.json` | Vite `define` plugin |
| **Go** | Git Tag | `go build -ldflags` |
| **Python** | Git Tag | Environment Variable |

This ensures all parts of your stack stay in sync without needing to edit multiple files manually.
