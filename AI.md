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
├── package.json           # Monorepo root (npm workspaces)
├── Makefile               # Build/dev shortcuts
│
├── client/                # React Frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component (683 lines)
│   │   ├── main.tsx       # Entry point
│   │   ├── index.css      # Global styles
│   │   │
│   │   ├── api/           # API layer
│   │   │   ├── client.ts  # Unified mock/real API client
│   │   │   ├── config.ts  # API configuration
│   │   │   ├── types.ts   # API type definitions
│   │   │   └── mockStore.ts # In-browser mock storage
│   │   │
│   │   ├── components/
│   │   │   ├── canvas/    # FundusCanvas (main drawing area)
│   │   │   ├── toolbar/   # Tool buttons (pen, brush, eraser, etc.)
│   │   │   ├── modals/    # 13 modals (Login, Save, Share, Patients, etc.)
│   │   │   ├── ui/        # Reusable UI components
│   │   │   ├── three-d/   # 3D visualization components
│   │   │   └── LayerPanel.tsx  # Layer management
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Authentication state
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
│   │   └── utils/
│   │       ├── types.ts     # Core types (FundusElement, etc.)
│   │       └── constants.ts # App constants
│   │
│   └── public/textures/   # 3D shader textures
│
└── server/                # Express Backend
    ├── src/
    │   ├── index.ts       # Server entry, route registration
    │   ├── database.ts    # SQLite setup & helpers
    │   ├── routes/
    │   │   ├── auth.ts    # /api/auth/* endpoints
    │   │   ├── charts.ts  # /api/charts/* endpoints
    │   │   └── patients.ts # /api/patients/* endpoints
    │   ├── middleware/
    │   │   └── auth.ts    # JWT middleware
    │   └── types/
    └── data/fundus.db     # SQLite database file
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

```bash
# Install all dependencies
npm install

# Run client dev server (localhost:5173)
npm run dev:client

# Run backend server (localhost:3000)
npm run dev:server

# Build client for production
npm run build:client
```

**Demo credentials:** `demo` / `demo`

---

## Configuration

### Client API Config (`client/src/api/config.ts`)
- `USE_MOCK_API`: Toggle between mock store and real backend
- `API_BASE_URL`: Backend URL (default: `http://localhost:3000/api`)

### Graphics Quality
Stored in localStorage under `graphics_quality` key. Options: `low`, `medium`, `high`.
