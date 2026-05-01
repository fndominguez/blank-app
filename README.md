# 🚀 SaaS Boilerplate

An industrial-grade, production-ready full-stack SaaS monorepo boilerplate.

## Tech Stack

| Layer           | Technology                                                 |
| --------------- | ---------------------------------------------------------- |
| Backend         | Python 3.12+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2 |
| Package Manager | uv                                                         |
| Migrations      | Alembic                                                    |
| Frontend        | Next.js 14+ (App Router), TypeScript, Tailwind CSS         |
| UI Components   | shadcn/ui                                                  |
| Server State    | TanStack Query v5                                          |
| Client State    | Zustand                                                    |
| Database        | PostgreSQL                                                 |
| Auth            | JWT via HTTP-only cookies                                  |
| Rate Limiting   | slowapi                                                    |
| Quality         | Ruff, mypy (strict), pytest-asyncio                        |
| CI/CD           | GitHub Actions                                             |
| Infrastructure  | Docker (multi-stage), docker-compose                       |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### One-Command Local Setup

```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env to set SECRET_KEY and other values

# Start all services
docker-compose up --build
```

- **Backend API**: http://localhost:8000
- **API Docs** (debug only): http://localhost:8000/docs
- **Frontend**: http://localhost:3000

---

## Architecture

### Backend Layer Flow

```
api/ → services/ → repositories/ → models/
```

- **`api/v1/`** — FastAPI routes using `Depends()` for all injections
- **`services/`** — Business logic with atomic transactions
- **`repositories/`** — SQLAlchemy 2.0 async data access
- **`models/`** — SQLAlchemy ORM models
- **`core/`** — Config (pydantic-settings), security (JWT), logging
- **`db/`** — Async engine, session factory, base model

### Security

- JWT Access + Refresh tokens stored in **HTTP-only Secure cookies**
- Rate limiting on `/auth` (10/min) and `/register` (5/min) endpoints
- Password validation (length, uppercase, digit requirements)
- Strict pydantic-settings validation — fails fast on missing/malformed env vars

---

## Development

### Backend

```bash
cd backend

# Install uv first if needed
# Windows: winget install Astral.uv
# Or: python -m pip install uv
pip install uv

# Create and activate a clean virtual env
uv venv

# Bash (Git Bash, WSL, macOS, Linux)
# source .venv/bin/activate

# Install dependencies into the venv
uv pip install -e ".[dev]"

# Set up environment
cp .env.example .env

# Start PostgreSQL before running migrations
docker-compose up -d postgres

# Run migrations
uv run alembic upgrade head

# Start server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest

# Lint & format
uv run ruff check .
uv run ruff format .

# Type check
uv run mypy app

# Export OpenAPI schema (no server needed)
uv run python scripts/export_openapi.py

# Check migrations are in sync with models
uv run alembic check
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Install the Playwright browser used by e2e tests
npx playwright install chromium

# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Run frontend e2e smoke tests
npm run test:e2e

# Generate typed API client from OpenAPI spec
# (requires backend/openapi.json to exist)
npm run generate-client
```

---

## Environment Variables

Create a `.env` file in the root (for docker-compose) and `backend/.env`:

```env
# Database
POSTGRES_DB=saas_db
POSTGRES_USER=saas_user
POSTGRES_PASSWORD=your-secure-password

# Backend
DATABASE_URL=postgresql://saas_user:your-secure-password@localhost:5432/saas_db
SECRET_KEY=your-super-secret-key-at-least-32-chars-long
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=["http://localhost:3000"]

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## CI/CD Pipeline

GitHub Actions workflow runs on every push/PR:

1. **Ruff lint** — Code style and linting
2. **Ruff format check** — Consistent formatting
3. **mypy** — Strict type checking
4. **pytest** — Tests with coverage report
5. **Alembic check** — Fails if models and migrations are out of sync
6. **TypeScript type check** — Frontend type safety
7. **ESLint** — Frontend linting

---

## File Structure

```
/
├── .github/workflows/ci.yml      # CI/CD pipeline
├── backend/
│   ├── app/
│   │   ├── api/v1/               # FastAPI routes (auth, users)
│   │   │   └── deps/             # Dependency injection (current_user)
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # SQLAlchemy async data access
│   │   ├── models/               # ORM models
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   ├── core/                 # Config, security, logging
│   │   ├── db/                   # Session, base model
│   │   └── main.py               # FastAPI app
│   ├── alembic/                  # Database migrations
│   ├── scripts/export_openapi.py # Static OpenAPI export
│   ├── tests/                    # Async pytest tests
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/           # React components + shadcn/ui
│   │   ├── hooks/                # TanStack Query hooks
│   │   ├── store/                # Zustand UI state
│   │   ├── lib/                  # API client, utilities
│   │   ├── api-generated/        # OpenAPI-generated typed client
│   │   └── middleware.ts         # Auth guard middleware
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
