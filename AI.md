# React Fundus Chart - AI Project Overview

A modern, interactive Retinal Fundus Charting application for ophthalmologists and eye care professionals to draw, annotate, and manage fundus examination charts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **3D Graphics** | Three.js, react-three-fiber, react-three-drei |
| **Animation** | Framer Motion |
| **Styling** | Tailwind CSS |
| **Backend** | Express.js, TypeScript |
| **Database** | SQLite (sql.js - in-memory with file persistence) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |

---

## Project Structure

```
react-fundus-chart/
├── package.json              # Monorepo root (npm workspaces)
├── Makefile                  # Build/dev shortcuts + AWS deployment automation
├── docker-compose.yml        # Local Docker development setup
├── docker-compose.aws.yml    # AWS production Docker configuration
├── AWS_DEPLOYMENT.md         # Complete AWS deployment guide
│
├── client/                   # React Frontend
│   ├── Dockerfile            # Local development Docker build
│   ├── Dockerfile.aws        # AWS production build (nginx:alpine)
│   ├── Makefile              # Client-specific build commands
│   ├── vite.config.ts        # Vite configuration with base path support
│   │
│   ├── src/
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Global styles
│   │   │
│   │   ├── api/              # API layer
│   │   │   ├── client.ts     # Unified mock/real API client
│   │   │   ├── config.ts     # API configuration (USE_MOCK_API toggle)
│   │   │   ├── types.ts      # API type definitions
│   │   │   └── mockStore.ts  # In-browser mock storage
│   │   │
│   │   ├── components/
│   │   │   ├── canvas/       # FundusCanvas (main drawing area)
│   │   │   ├── toolbar/      # Tool buttons (desktop & mobile)
│   │   │   │   ├── desktop/  # Desktop toolbar components
│   │   │   │   └── mobile/   # Mobile toolbar components
│   │   │   ├── modals/       # Modal dialogs (Login, Save, Share, etc.)
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── three-d/      # 3D visualization components
│   │   │   └── LayerPanel.tsx # Layer management
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication state
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAutoSave.ts
│   │   │   ├── useDarkMode.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   │
│   │   ├── services/
│   │   │   └── aiService.ts  # AI analysis integration
│   │   │
│   │   ├── data/
│   │   │   └── colorLegend.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── types.ts      # Core types (FundusElement, etc.)
│   │   │   └── constants.ts  # App constants
│   │   │
│   │   └── assets/           # Static assets
│   │
│   └── public/textures/      # 3D shader textures
│
└── server/                   # Express Backend
    ├── Dockerfile            # Local development Docker build
    ├── Dockerfile.aws        # AWS production build (node:20-alpine)
    ├── src/
    │   ├── index.ts          # Server entry, route registration
    │   ├── database.ts       # SQLite setup & helpers
    │   ├── routes/
    │   │   ├── auth.ts       # /api/auth/* endpoints
    │   │   ├── charts.ts     # /api/charts/* endpoints
    │   │   └── patients.ts   # /api/patients/* endpoints
    │   ├── middleware/
    │   │   └── auth.ts       # JWT middleware
    │   └── types/            # Type definitions
    └── data/fundus.db        # SQLite database file
```

---

## Core Domain Model

### FundusElement (Drawing Object)
```typescript
interface FundusElement {
  id: string;
  type: 'stroke' | 'hemorrhage' | 'tear' | 'spot' | 'circle';
  points?: (Point | null)[];  // Stroke paths (null = break)
  position?: Point;           // Shape center
  radius?: number;
  color: ColorCode;           // 'red' | 'blue' | 'green' | 'brown' | 'yellow' | 'black' | 'pink'
  layer: string;              // 'retina', 'vitreous', etc.
  zDepth?: number;            // For 3D positioning
  pathology?: PathologyType;  // Medical classification
  visible: boolean;
  locked?: boolean;
}
```

### Medical Color Meanings
| Color | Hex | Use Case |
|-------|-----|----------|
| Red | #FF0000 | Arterioles, Hemorrhages, Retinal Tears |
| Blue | #468ff5 | Detached Retina, Veins, Lattice |
| Green | #008000 | Vitreous Opacities |
| Brown | #8B4513 | Choroidal tissue, Pigment |
| Yellow | #FFFF00 | Exudates, Drusen, Edema |
| Black | #000000 | Sclerosed vessels, Scars |
| Pink | #dea6bd | Normal/General annotations |

### Pathology Presets
The app includes medical presets: `hemorrhage`, `vitreous_hemorrhage`, `tear`, `detachment`, `hole`, `drusen`, `cotton_wool`, `hard_exudate`, `edema`, `lattice`.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/health` | Server health check (DB connectivity) |

### Charts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charts` | List user's charts |
| POST | `/api/charts` | Create new chart |
| GET | `/api/charts/:id` | Get chart by ID |
| PUT | `/api/charts/:id` | Update chart |
| DELETE | `/api/charts/:id` | Delete chart |
| POST | `/api/charts/:id/share` | Create share link |
| GET | `/api/charts/shared/:shareId` | Get shared chart |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Get patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/patients/:id/charts` | Get patient's charts |

---

## AWS Deployment Workflow

### Build Locally, Deploy to AWS

This project uses an optimized deployment workflow designed for resource-constrained servers (e.g., AWS t3.nano):

1. **Build locally** on your development machine (with sufficient resources)
2. **Create optimized Docker images** with pre-built artifacts (no build steps on server)
3. **Package images as tar.gz** for efficient transfer (~180MB total)
4. **Transfer and deploy** to AWS EC2 without any compilation

### Quick Deployment Commands

```bash
# Build everything for AWS deployment
make aws              # Builds client + server, creates Docker images as tar.gz

# Individual build targets
make aws-client       # Build client image only
make aws-server       # Build server image only
make aws-build-client # Build client dist folder only
make aws-build-server # Build server dist folder only

# Testing locally before deployment
make aws-load         # Load Docker images from tar.gz
make aws-up           # Start containers locally
make aws-down         # Stop containers

# Cleanup
make aws-clean        # Remove all AWS build artifacts
```

### Output Files

The `make aws` command creates:
- `aws-build/client-image.tar.gz` (~25-30MB) - Nginx-based static server
- `aws-build/server-image.tar.gz` (~150-180MB) - Node.js API server

### Deployment Steps

1. Transfer files to server:
   ```bash
   scp aws-build/*.tar.gz user@server:/path/to/app/
   scp docker-compose.aws.yml user@server:/path/to/app/
   ```

2. On the server:
   ```bash
   docker load < client-image.tar.gz
   docker load < server-image.tar.gz
   docker-compose -f docker-compose.aws.yml up -d
   ```

### Docker Optimizations

**Client (Dockerfile.aws):**
- Single-stage build with `nginx:alpine` (~25MB base)
- Pre-built `dist` folder copied from local machine
- No Node.js or build tools in image
- Configured with API proxy, SPA routing, and caching
- Health check endpoint at `/health`

**Server (Dockerfile.aws):**
- Production-only dependencies (`npm ci --only=production`)
- Pre-built `dist` folder copied from local machine
- No TypeScript or dev dependencies
- Runs as non-root user for security
- Direct `node` execution (faster than `npm start`)
- Health check at `/api/health`

### Build Environment Variables

**Client Build:**
- `VITE_BASE_PATH=/` - Application base path
- `VITE_API_BASE_URL=/api` - API endpoint (proxied by Nginx)
- `VITE_USE_MOCK_API=false` - Use real backend API

**Server:**
- `NODE_ENV=production` - Production mode
- `PORT=3000` - Server port

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for complete deployment guide.

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT
);

-- Patients
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  mrn TEXT NOT NULL,          -- Medical Record Number
  name TEXT NOT NULL,
  date_of_birth TEXT,
  notes TEXT,
  user_id TEXT NOT NULL,
  UNIQUE(mrn, user_id)
);

-- Charts
CREATE TABLE charts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  eye_side TEXT NOT NULL,     -- 'OD' (right) or 'OS' (left)
  elements TEXT NOT NULL,     -- JSON array of FundusElement
  patient_id TEXT,
  user_id TEXT NOT NULL,
  share_id TEXT UNIQUE,
  is_shared INTEGER DEFAULT 0
);
```

---

## Key Features

1. **Interactive Drawing** - Pen, brush, pattern, eraser, fill, select tools
2. **Undo/Redo** - Full history stack
3. **Eye Switching** - OD (right) / OS (left) toggle
4. **3D Visualization** - Three.js-powered retina model
5. **AI Analysis** - Integrated analysis service
6. **Patient Management** - CRUD with chart associations
7. **Share Links** - Public chart sharing via unique ID
8. **Auto-Save** - Guest charts saved to localStorage
9. **Dark Mode** - Theme toggle
10. **Keyboard Shortcuts** - Productivity hotkeys

---

## Development Commands

### Local Development

```bash
# Install all dependencies
npm install

# Run client dev server (localhost:5173)
npm run dev:client
# or
make dev

# Run backend server (localhost:3000)
npm run dev:server
# or
make dev-server

# Build client for production
npm run build:client
# or
make build

# Lint client code
make lint

# Clean all node_modules and rebuild
make clean
```

### AWS Deployment

```bash
# Build and package for AWS (recommended)
make aws              # Builds both client and server, creates tar.gz files

# Individual AWS build targets
make aws-client       # Build client Docker image as tar.gz
make aws-server       # Build server Docker image as tar.gz
make aws-build-client # Build client dist folder only
make aws-build-server # Build server dist folder only

# Local testing of AWS builds
make aws-load         # Load Docker images from tar.gz
make aws-up           # Start containers with docker-compose.aws.yml
make aws-down         # Stop AWS containers

# Cleanup AWS artifacts
make aws-clean        # Remove aws-build/ directory and images
```

### Version Management

```bash
make version-info     # Show current version and git tag
make version-patch    # Bump patch version (0.0.x)
make version-minor    # Bump minor version (0.x.0)
make version-major    # Bump major version (x.0.0)
make publish          # Push changes and tags to remote
```

**Demo credentials:** `demo` / `demo`

---

## Configuration

### Client Configuration

**API Config** (`client/src/api/config.ts`):
- `USE_MOCK_API`: Toggle between mock store and real backend
- `API_BASE_URL`: Backend URL (default: `http://localhost:3000/api`)

**Vite Build Config** (`client/vite.config.ts`):
- `VITE_BASE_PATH`: Application base path (default: `/react-fundus-chart/`, AWS: `/`)
- `VITE_API_BASE_URL`: API endpoint URL
- `VITE_USE_MOCK_API`: Enable/disable mock API

**Graphics Quality**:
Stored in localStorage under `graphics_quality` key. Options: `low`, `medium`, `high`.

### Server Configuration

**Environment Variables**:
- `NODE_ENV`: Environment mode (`development` | `production`)
- `PORT`: Server port (default: `3000`)
- `JWT_SECRET`: Secret key for JWT tokens (auto-generated if not set)

**Database**:
- Location: `server/data/fundus.db`
- Type: SQLite (via sql.js)
- Persistence: File-based with in-memory operations
