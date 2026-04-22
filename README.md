# QR Mini App — Backend

Backend service for a QR code creation and management application built on the Zalo Mini App platform. Provides APIs for user authentication, static/dynamic QR storage, file upload management, and serving landing pages for Dynamic QR codes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Object Storage | AWS S3 / MinIO (local dev) |
| Auth | Zalo OAuth 2.0 + JWT |
| Tunnel | ngrok |
| Runtime | Node.js 24 LTS |

---

## Requirements

- Node.js >= 24
- Docker & Docker Compose
- `ngrok` CLI (to expose localhost to the public internet)

---

## Installation & Setup

### 1. Bootstrap

Install dependencies and create the `.env` file from the template:

```bash
make bootstrap
```

### 2. Configure environment

Open the newly created `.env` file and fill in the required values (see [Environment Variables](#environment-variables) below).

```bash
make config
```

### 3. Start infrastructure

Start PostgreSQL, Adminer, and MinIO via Docker Compose:

```bash
make up
```

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| Adminer (DB UI) | `http://localhost:8080` |
| MinIO Console | `http://localhost:9000` |
| Swagger | `http://localhost:8000/docs` |

### 4. Migration & Seed

```bash
make migration   # Run database migrations
make seed        # Seed sample data (VietQR bank list, default stickers...)
```

### 5. Start the server

```bash
make dev         # Development mode with hot reload
```

Server runs at `http://localhost:8000` by default.

---

## ngrok Tunnel

Dynamic QR codes require a **stable public URL** to be encoded into the QR image. This project uses ngrok because its free tier provides one static domain permanently tied to your account — no custom domain purchase required.

### Installation

```bash
# macOS
brew install ngrok

# Linux / Windows: see https://ngrok.com/download
```

### Claim a static domain (one-time setup)

1. Register at [dashboard.ngrok.com](https://dashboard.ngrok.com)
2. Go to **Domains → New Domain** and choose a subdomain (e.g. `qr-miniapp`)
3. Copy your authtoken from **Getting Started → Your Authtoken**

```bash
ngrok config add-authtoken <YOUR_AUTHTOKEN>
```

### Run the tunnel

```bash
make ngrok
```

Then update `APP_PUBLIC_URL=https://your-subdomain.ngrok-free.app` in your `.env`.

---

## Environment Variables

```bash
# App
NODE_ENV=development
APP_PORT=8000
APP_NAME="QR Mini App API"
API_PREFIX=api
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang
FRONTEND_DOMAIN=http://localhost:3000
BACKEND_DOMAIN=http://localhost:8000

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=secret
DATABASE_NAME=api
DATABASE_SYNCHRONIZE=false
DATABASE_MAX_CONNECTIONS=100
DATABASE_SSL_ENABLED=false
DATABASE_REJECT_UNAUTHORIZED=false
DATABASE_CA=
DATABASE_KEY=
DATABASE_CERT=
DATABASE_URL=

# Zalo
ZALO_APP_ID=your-zalo-app-id
ZALO_APP_SECRET=your-zalo-app-secret

# Minio
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

---

## Git Branching Model

### Main branches

| Branch | Purpose | Merged from |
|---|---|---|
| `staging` | Stable branch, requires code review before merging | Merged from `dev` after testing |
| `dev` | Integration branch for deploying to the test environment | Merged from `feature/*`, `fix/*` |

### Supporting branches

| Branch | Naming convention | Example | Branch from | Merge into |
|---|---|---|---|---|
| Feature | `feature/<feature-name>` | `feature/qr-editor-konva` | `staging` | `staging` |
| Fix | `fix/<issue-name>` | `fix/slug-collision-retry` | `staging` | `staging` |
| Release | `release/v<major>.<minor>.<patch>` | `release/v0.3.0` | `staging` | `release` → `staging` |

### Release convention

During development, use **semver** starting at `v0.x.y`:

```
v0.1.0  — first milestone (auth + QR CRUD complete)
v0.2.0  — new features added (editor, landing pages)
v0.2.1  — minor hotfix on staging
v1.0.0  — production-ready, acceptance criteria passed
```

Versioning rules:
- `patch` (`v0.x.Y`) — bug fixes, no new features
- `minor` (`v0.X.0`) — new features, backward compatible
- `major` (`vX.0.0`) — breaking changes or production release

---

## Git Commit Convention

Follows [Conventional Commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13).

### Format

```
<type>(<optional scope>): <description>

<optional body>

<optional footer>
```

### Types

| Type | When to use |
|---|---|
| `feat` | Add or change a feature in the API or UI |
| `fix` | Fix a bug introduced by a previous `feat` |
| `refactor` | Rewrite or restructure code without changing behavior |
| `perf` | A refactor that specifically improves performance |
| `style` | Code formatting, whitespace — no behavior change |
| `test` | Add or correct tests |
| `docs` | Documentation changes only |
| `build` | Build tools, dependencies, project version |
| `ops` | Infrastructure, CI/CD, deployment scripts |
| `chore` | Everything else (init, `.gitignore`, ...) |

### Description rules

- Use **imperative, present tense**: `add` not `added` or `adds`
- **Do not** capitalize the first letter
- **Do not** end with a period (`.`)

### Breaking changes

Add `!` before `:` and describe in the footer:

```
feat(auth)!: remove zalo token exchange endpoint

BREAKING CHANGE: clients must now use POST /auth/zalo with body { accessToken }
```