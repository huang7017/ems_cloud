# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EMS Cloud is an Energy Management System with a monorepo structure containing:
- **Backend** (`ems_backend/`): Go-based API server using DDD + Clean Architecture
- **Frontend** (`ems_frontend/`): React + TypeScript with Redux Saga state management

## Development Commands

### Backend (Go)

```bash
# Run backend locally (from ems_backend/ directory)
go run cmd/api/main.go

# Build for Linux deployment (cross-compile from Mac)
cd ems_backend && ./build.sh

# The server runs on port 8080 by default
```

### Frontend (React + Vite)

```bash
# Install dependencies
cd ems_frontend && npm install

# Run development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm preview
```

## Architecture

### Backend Architecture (DDD + Clean Architecture)

The backend follows Domain-Driven Design with Clean Architecture principles, organized in layers from inner (domain) to outer (interface):

**Directory Structure:**
```
ems_backend/internal/
├── domain/              # Business logic and domain rules (innermost layer)
│   ├── auth/           # Authentication bounded context
│   ├── member/         # Member/user bounded context
│   ├── member_role/    # Role management
│   ├── menu/           # Menu/navigation
│   ├── meter/          # Meter data
│   ├── temperature/    # Temperature monitoring
│   ├── company/        # Company entities
│   └── company_device/ # Device management
│
├── application/         # Application services (orchestration layer)
│   ├── dto/            # Data transfer objects
│   └── services/       # Application service layer
│
├── infrastructure/      # Technical implementations
│   ├── persistence/    # Database implementations
│   │   ├── models/     # GORM models
│   │   └── repositories/ # Repository implementations
│   └── messaging/      # Message queue (AWS SQS integration)
│
└── interface/          # External interfaces (outermost layer)
    └── api/
        ├── handlers/   # HTTP request handlers
        ├── middleware/ # Auth, CORS, etc.
        └── router/     # Route definitions
```

**Key Concepts:**
- **Bounded Contexts**: Each domain folder (auth, member, etc.) represents a bounded context with its own entities, value objects, and repositories
- **Dependency Rule**: Dependencies point inward - domain has no external dependencies, infrastructure depends on domain interfaces
- **Repository Pattern**: Domain defines repository interfaces, infrastructure provides implementations
- **Value Objects**: Immutable objects that encapsulate business rules (e.g., Email, UserID)

**Main Entry Point**: `cmd/api/main.go`
- Initializes database (PostgreSQL via GORM)
- Sets up all repositories and domain services
- Configures HTTP router (Gin framework)
- Handles graceful shutdown

### Frontend Architecture (Redux Saga + Feature-Based)

**Directory Structure:**
```
ems_frontend/src/
├── features/           # Feature-based organization
│   ├── Login/         # Each feature contains:
│   ├── Home/          #   - index.tsx (component)
│   ├── Menu/          #   - reducer.ts (Redux reducer)
│   ├── Settings/      #   - saga.ts (side effects)
│   ├── Temperature/   #   - selector.ts (state selectors)
│   └── Util/          #   - types.ts (TypeScript types)
│
├── layouts/           # Layout components
│   ├── BasicLayout.tsx    # Authenticated layout
│   └── PublicLayout.tsx   # Public pages layout
│
├── store/             # Redux store configuration
│   ├── index.ts       # Store setup + saga middleware
│   └── reducers.ts    # Root reducer combining all feature reducers
│
├── api/               # API client functions
│   ├── auth.ts
│   ├── menu.ts
│   └── home/dashboard.ts
│
├── helper/            # Utilities
│   └── axios.ts       # Axios instance with interceptors
│
├── lib/               # Shared components
│   └── components/AuthGuard/
│
└── router.tsx         # Route configuration
```

**State Management Flow:**
1. Component dispatches action
2. Saga intercepts action, performs async work (API calls)
3. Saga dispatches success/failure action
4. Reducer updates state
5. Component re-renders via selector

**Authentication Flow:**
- JWT-based with access token (24h) and refresh token (7 days)
- Tokens stored in cookies
- Axios interceptor automatically:
  - Adds `Authorization: Bearer <token>` header
  - Adds `X-Role-ID` header from cookies
  - Handles 401 by refreshing token automatically
  - Queues requests during token refresh
- `AuthGuard` component protects authenticated routes

### API Communication

**Backend API Base Path**: `/api` prefix expected (configured via CORS)

**Key Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /menu` - Get all menus
- `GET /menu/sidebar` - Get menu by role
- `GET /dashboard/*` - Dashboard data endpoints

**Frontend API Client** (`helper/axios.ts`):
- Configured base URL from `config/environment`
- Automatic token injection from cookies
- Token refresh on 401 with request queuing
- Redirects to `/public/login` on auth failure

### Database

- **ORM**: GORM
- **Database**: PostgreSQL
- **Connection**: Configured via environment variables in `main.go`
- **Models**: Located in `internal/infrastructure/persistence/models/`

### Authentication & Authorization

**Backend:**
- JWT tokens with HS256 signing
- Token validation in `middleware/auth_middleware.go`
- Role-based access control via `member_role` domain
- Session management in `auth` bounded context

**Frontend:**
- Cookies: `accessToken`, `refreshToken`, `roleId`
- `AuthGuard` component for route protection
- Automatic token refresh via axios interceptor

## Important Patterns & Conventions

### Backend Patterns

1. **Repository Pattern**: Always define interface in domain, implement in infrastructure
2. **Service Initialization**: All services initialized in `main.go` with dependency injection
3. **Handler Pattern**: Handlers receive dependencies via constructor, methods are Gin handlers
4. **Error Handling**: Domain errors should be translated to HTTP responses in handlers
5. **Bounded Context Isolation**: Each domain folder should be self-contained

### Frontend Patterns

1. **Feature Organization**: Each feature is self-contained with component, reducer, saga, selector, types
2. **Saga Registration**: All sagas must be registered in `store/index.ts` via `sagaMiddleware.run()`
3. **Reducer Registration**: All reducers must be added to `store/reducers.ts` combineReducers
4. **API Calls**: Always in saga files, never directly in components
5. **Type Safety**: Define TypeScript interfaces in feature's `types.ts`

## Environment Configuration

### Backend
Environment variables are set in `main.go` via `setupEnvironment()` function. Key variables:
- Database connection (PostgreSQL DSN)
- JWT secret keys
- Server port (default: 8080)

### Frontend
Configuration in `src/config/environment.ts`:
- API base URL
- API timeout
- Environment-specific settings

## Testing

Currently no test files present in the repository. When adding tests:
- Backend: Use Go's testing package, name files `*_test.go`
- Frontend: Use Vitest (configured via Vite)

## Deployment

### Backend Deployment
1. Build Linux binary: `cd ems_backend && ./build.sh`
2. Binary output: `ems_backend_linux`
3. Deploy to EC2 via SCP
4. Service management scripts available: `install_service.sh`, `start.sh`
5. Systemd service file: `ems-backend.service`

### Frontend Deployment
1. Build: `cd ems_frontend && npm run build`
2. Static files output to `dist/` directory
3. Serve via static file server or CDN

## Tech Stack Summary

**Backend:**
- Framework: Gin
- ORM: GORM
- Database: PostgreSQL
- Auth: JWT (golang-jwt/jwt/v5)
- Password: bcrypt (golang.org/x/crypto)
- Architecture: DDD + Clean Architecture

**Frontend:**
- Framework: React 19
- Build Tool: Vite
- Language: TypeScript
- State: Redux Toolkit + Redux Saga
- UI Library: Material-UI (MUI)
- Charts: Nivo, MUI X Charts
- Data Grid: MUI X Data Grid Pro
- Routing: React Router v7
- HTTP Client: Axios
- Date: Day.js

## Key Files to Understand the Codebase

1. **Backend Entry**: `ems_backend/cmd/api/main.go` - See how everything is wired together
2. **Backend Routes**: `ems_backend/internal/interface/api/router/routes.go` - API endpoint definitions
3. **Frontend Store**: `ems_frontend/src/store/index.ts` - Redux store and saga setup
4. **Frontend Routes**: `ems_frontend/src/router.tsx` - Route configuration
5. **Axios Config**: `ems_frontend/src/helper/axios.ts` - API client with interceptors
6. **Auth Flow**:
   - Backend: `internal/domain/auth/services/auth_service.go`
   - Frontend: `features/Login/saga.ts`
