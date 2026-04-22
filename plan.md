# Implementation Plan — MEAN Stack Course Project

## 1. Existing Repo Summary

### Framework and versions
- **Angular 21.2** (standalone components, no NgModules)
- **@angular/fire 20.0.1** with **firebase 12.12.0** — authentication only
- **@angular/material 21.2** — UI components
- **@ngx-translate** — i18n with `es` and `ca` locales
- **TypeScript ~5.9**, strict mode enabled (`strictNullChecks` is off but `strict: true` elsewhere)
- Build tool: `@angular/build` (esbuild-based, not Webpack)
- Test runner: **vitest 4.0** (not Karma/Jasmine)

### Firebase setup found
- Project ID: `del-test-fundesplai`
- Firebase config is hardcoded in `src/app/app.config.ts` (acceptable for a course project; the backend will use a service account, not this config)
- `AuthService` (`src/app/services/auth.ts`) calls `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` and stores the raw ID token in `sessionStorage` as `tokenId`
- Route guards use `@angular/fire/auth-guard` (`canActivate`, `redirectLoggedInTo`, `redirectUnauthorizedTo`)

### Pages
| Route | Component | Guard |
|---|---|---|
| `/login` | `Login` | redirects logged-in users to `/home` |
| `/register` | `Register` | redirects logged-in users to `/home` |
| `/home` | `Home` | requires auth |
| `/carrito` | `Carrito` | requires auth |
| `/about` | `About` | requires auth |

### Services (current state — localStorage/in-memory only)
- `PedidoService` — stores pedidos in `localStorage`, exposes a signal
- `UserService` — stores users in `localStorage`, stores token in `localStorage`
- `AuthService` — Firebase login/register/logout wrapper

### Shared components
- `Header` — navigation, logout, language switcher
- `PedidoCard` — displays a single Pedido, emits edit/delete events

### Entities (TypeScript interfaces in `src/app/models/interfaces.ts`)
```ts
interface Pedido {
  nombre: string;      // required
  precio: number;      // required
  fecha: Date;         // required
  stock: boolean;      // required
  descripcion?: string;
  cantidad?: number;
}

interface User {
  username: string;    // required
  name: string;        // required
  email: string;       // required
}
```

### What does NOT yet exist
- NestJS backend (entire `backend/` directory)
- MongoDB persistence (currently localStorage)
- Any backend tests
- Docker files
- Railway deployment config

---

## 2. Git Setup

### Current branch state
- `main` — production target (tracked at `origin/main`)
- `dev` — active development branch (current branch, no remote tracking yet)
- `google-login` — feature branch (no further action needed)

### Rules for this project
- All subagent work happens on `dev`
- `dev` has no remote yet; first push will be `git push -u origin dev`
- `main` is only updated when the user explicitly requests deployment (merge via PR or direct merge, not here)
- Conventional commits after each subagent completes

---

## 3. Backend Tasks

### 3.1 NestJS scaffold

```
backend/
  src/
    app.module.ts
    main.ts
    config/
      configuration.ts        # typed env config via @nestjs/config
    auth/
      firebase-admin.module.ts
      firebase-auth.guard.ts
      firebase-auth.guard.spec.ts
    pedidos/
      pedido.schema.ts
      pedido.dto.ts
      pedidos.service.ts
      pedidos.service.spec.ts
      pedidos.controller.ts
      pedidos.controller.spec.ts
      pedidos.module.ts
    users/
      user.schema.ts
      user.dto.ts
      users.service.ts
      users.service.spec.ts
      users.controller.ts
      users.controller.spec.ts
      users.module.ts
    dashboard/
      dashboard.service.ts
      dashboard.service.spec.ts
      dashboard.controller.ts
      dashboard.controller.spec.ts
      dashboard.module.ts
    health/
      health.controller.ts
      health.controller.spec.ts
  test/                        # e2e (optional, not in scope)
  package.json
  tsconfig.json
  tsconfig.build.json
  nest-cli.json
  .env.example
```

**Install commands (to be run by nestjs-builder subagent)**
```bash
npm i -g @nestjs/cli
nest new backend --package-manager npm --skip-git
cd backend
npm install @nestjs/mongoose mongoose @nestjs/config
npm install firebase-admin
npm install --save-dev @types/node
```

### 3.2 NestJS version target
Use **NestJS 10** (latest stable). Node version: **20 LTS**.

### 3.3 Mongoose connection setup
- `MongooseModule.forRootAsync` in `AppModule`
- Connection string read from `process.env.MONGO_URI` via `@nestjs/config`
- `useNewUrlParser: true`, `useUnifiedTopology: true` options
- Add `timestamps: true` to all schemas

### 3.4 Firebase Admin SDK setup
Create `FirebaseAdminModule` as a **global module**:
- Initialize `firebase-admin` with `applicationDefault()` when `GOOGLE_APPLICATION_CREDENTIALS` is set, or with `cert(serviceAccount)` when `FIREBASE_SERVICE_ACCOUNT_JSON` env var contains the JSON string
- Export the initialized `app` so the guard can inject it
- Initialization is done once via a custom provider using `APP_INITIALIZER` pattern or a factory provider

### 3.5 Auth Guard implementation (`FirebaseAuthGuard`)
- Implements `CanActivate`
- Reads the `Authorization` header: `Bearer <token>`
- Calls `firebase-admin` auth `verifyIdToken(token)`
- Attaches the decoded token to `request.user`
- Returns `401 UnauthorizedException` if token is missing or invalid
- Is applied **globally** via `APP_GUARD` in `AppModule` to protect all routes by default
- The `GET /health` route is excluded with a `@Public()` custom decorator (uses `SetMetadata('isPublic', true)` — guard checks for this metadata and skips verification)

---

## 4. Data Model

### 4.1 Pedido schema (`backend/src/pedidos/pedido.schema.ts`)

```ts
@Schema({ timestamps: true })
export class Pedido {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  precio: number;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  stock: boolean;

  @Prop()
  descripcion?: string;

  @Prop()
  cantidad?: number;
}
```

- **Indexes**: `fecha` (for date-range queries in dashboard), `stock` (for filtering)
- `_id` is auto-generated MongoDB ObjectId
- `createdAt` and `updatedAt` added by `timestamps: true`

### 4.2 User schema (`backend/src/users/user.schema.ts`)

```ts
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;
}
```

- **Indexes**: `email` unique index (enforces no duplicate Firebase users)
- `_id` is auto-generated MongoDB ObjectId
- `createdAt` and `updatedAt` added by `timestamps: true`

### 4.3 DTOs

**CreatePedidoDto**
```ts
{ nombre: string; precio: number; fecha: Date; stock: boolean; descripcion?: string; cantidad?: number; }
```
Validation via `class-validator`: `@IsString`, `@IsNumber`, `@IsDateString`, `@IsBoolean`, `@IsOptional`.

**UpdatePedidoDto** — `PartialType(CreatePedidoDto)` (all fields optional).

**CreateUserDto**
```ts
{ username: string; name: string; email: string; }
```

**UpdateUserDto** — `PartialType(CreateUserDto)`.

Use `ValidationPipe` globally in `main.ts` with `whitelist: true, forbidNonWhitelisted: true`.

---

## 5. API Endpoints

Base URL: `http://localhost:3000` (local), `https://<railway-domain>` (production).

All endpoints except `GET /health` require header: `Authorization: Bearer <firebase-id-token>`.

### Health

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/health` | None | — | `{ status: "ok", timestamp: ISO-string }` |

### Pedidos

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/pedidos` | Required | — | `Pedido[]` |
| GET | `/pedidos/:id` | Required | — | `Pedido` or 404 |
| POST | `/pedidos` | Required | `CreatePedidoDto` | Created `Pedido` (201) |
| PATCH | `/pedidos/:id` | Required | `UpdatePedidoDto` | Updated `Pedido` |
| DELETE | `/pedidos/:id` | Required | — | 204 No Content |

### Users

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/users` | Required | — | `User[]` |
| GET | `/users/:id` | Required | — | `User` or 404 |
| POST | `/users` | Required | `CreateUserDto` | Created `User` (201) |
| PATCH | `/users/:id` | Required | `UpdateUserDto` | Updated `User` |
| DELETE | `/users/:id` | Required | — | 204 No Content |

### Dashboard

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/dashboard/summary` | Required | — | see below |

**Dashboard summary response shape** (computed via MongoDB aggregation, not on the frontend):
```json
{
  "totalPedidos": 42,
  "totalRevenue": 1234.56,
  "averagePrecio": 29.39,
  "stockDisponible": 30,
  "sinStock": 12,
  "pedidosPorMes": [
    { "month": "2025-01", "count": 10, "revenue": 290.00 }
  ]
}
```

The `pedidosPorMes` array is produced by a `$group` aggregation stage on `fecha` field, keyed by year+month. This is the main "backend does real work" showcase for the course.

---

## 6. Testing Plan

Test runner: **Jest** (installed as part of NestJS default scaffold — `@nestjs/testing`, `jest`, `ts-jest`).

Coverage target: **80%** statements, branches, functions, lines.

### 6.1 Unit tests — PedidosService (`pedidos.service.spec.ts`)
- Mock `getModelToken('Pedido')` with a Jest mock object having `find`, `findById`, `create`, `findByIdAndUpdate`, `findByIdAndDelete` stubs
- Test: `findAll()` returns array from mock
- Test: `findOne(id)` returns single document; throws `NotFoundException` when not found
- Test: `create(dto)` calls `new this.pedidoModel(dto)` and `.save()`
- Test: `update(id, dto)` calls `findByIdAndUpdate` with `{ new: true }`
- Test: `remove(id)` calls `findByIdAndDelete` and returns void

### 6.2 Unit tests — PedidosController (`pedidos.controller.spec.ts`)
- Mock `PedidosService` completely
- Test that each controller method delegates to the correct service method
- Test that `@Param('id')` and `@Body()` are passed through correctly

### 6.3 Unit tests — UsersService (`users.service.spec.ts`)
- Same pattern as PedidosService
- Extra test: `create()` throws `ConflictException` if email already exists (handle MongoDB duplicate key error `code 11000`)

### 6.4 Unit tests — UsersController (`users.controller.spec.ts`)
- Same pattern as PedidosController

### 6.5 Unit tests — DashboardService (`dashboard.service.spec.ts`)
- Mock the `PedidoModel` with `.aggregate()` stub returning fake data
- Test: `getSummary()` returns correctly shaped object
- Test: aggregation pipeline contains the expected `$group` stage

### 6.6 Unit tests — DashboardController (`dashboard.controller.spec.ts`)
- Mock `DashboardService`, verify delegation

### 6.7 Unit tests — FirebaseAuthGuard (`firebase-auth.guard.spec.ts`)
- Mock `firebase-admin` `auth().verifyIdToken`
- Test: missing `Authorization` header → throws `UnauthorizedException`
- Test: malformed token (not `Bearer ...`) → throws `UnauthorizedException`
- Test: `verifyIdToken` rejects → throws `UnauthorizedException`
- Test: valid token → returns `true` and attaches decoded user to `request.user`
- Test: route decorated with `@Public()` → returns `true` without calling `verifyIdToken`

### 6.8 Running coverage
```bash
cd backend
npm run test:cov
```
Jest config in `package.json` sets `collectCoverageFrom: ["src/**/*.ts", "!src/**/*.module.ts", "!src/main.ts"]`.

---

## 7. Docker Plan

### 7.1 `backend/Dockerfile`
Multi-stage build:

**Stage 1 — builder**
- Base: `node:20-alpine`
- Copy `package*.json`, run `npm ci`
- Copy `src/`, `tsconfig*.json`, `nest-cli.json`
- Run `npm run build` (outputs to `dist/`)

**Stage 2 — production**
- Base: `node:20-alpine`
- Copy `package*.json`, run `npm ci --omit=dev`
- Copy `dist/` from builder stage
- Expose port `3000`
- CMD: `node dist/main`

### 7.2 `docker-compose.yml` (repo root — for local development without Atlas)
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/fundesplai
      - FIREBASE_SERVICE_ACCOUNT_JSON=${FIREBASE_SERVICE_ACCOUNT_JSON}
      - PORT=3000
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

> Note: When using MongoDB Atlas (production), remove the `mongo` service and set `MONGO_URI` to the Atlas connection string.

### 7.3 `.env.example` (in `backend/`)
```
# MongoDB connection string (Atlas for production, local for dev)
MONGO_URI=mongodb://localhost:27017/fundesplai

# Firebase service account JSON (the entire JSON as a single-line string)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# NestJS port
PORT=3000
```

### 7.4 `.dockerignore` (in `backend/`)
```
node_modules
dist
.env
coverage
```

---

## 8. Railway Plan

### 8.1 Recommendation: MongoDB
Use **MongoDB Atlas** via `MONGO_URI`. No Railway MongoDB add-on needed — this avoids an extra provisioning step and Atlas free tier is sufficient for a course project.

### 8.2 `railway.json` (in `backend/`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "node dist/main",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Nixpacks will auto-detect Node 20 from `.node-version` or `engines.node` in `package.json`. Add `"engines": { "node": "20.x" }` to `backend/package.json`.

### 8.3 Environment variables to set in Railway dashboard

| Variable | Value |
|---|---|
| `MONGO_URI` | Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/fundesplai`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full JSON string of Firebase service account key (download from Firebase Console → Project Settings → Service Accounts) |
| `PORT` | `3000` (Railway injects this automatically, but explicit is safer) |
| `NODE_ENV` | `production` |

### 8.4 CORS configuration
In `backend/src/main.ts`, enable CORS with the Angular app's origin:
```ts
app.enableCors({
  origin: process.env.FRONTEND_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```
Add `FRONTEND_ORIGIN` to Railway env vars once the Angular app is deployed (e.g. Vercel/Firebase Hosting URL).

### 8.5 Deployment steps (for reference, executed manually)
1. Push `dev` to GitHub
2. Create Railway project → "Deploy from GitHub repo" → select `backend/` as root directory
3. Set all env vars in Railway dashboard
4. Railway triggers build automatically on every push to `main`

---

## 9. Commit Plan

All commits are on `dev` branch. Format: `type(scope): message`.

| # | Commit message | What it includes |
|---|---|---|
| 1 | `feat(backend): scaffold NestJS project with Mongoose and config` | `backend/` directory, `AppModule`, `MongooseModule`, `ConfigModule`, `main.ts` with `ValidationPipe` and CORS, `nest-cli.json`, `tsconfig*.json`, `backend/package.json` |
| 2 | `feat(backend): add Firebase Admin global module` | `firebase-admin.module.ts`, `@Public()` decorator, FirebaseAdminProvider factory |
| 3 | `feat(backend): implement FirebaseAuthGuard as global APP_GUARD` | `firebase-auth.guard.ts`, registration as `APP_GUARD` in `AppModule` |
| 4 | `feat(backend): add Pedido schema, DTOs, service and controller` | `pedido.schema.ts`, `pedido.dto.ts`, `pedidos.service.ts`, `pedidos.controller.ts`, `pedidos.module.ts` |
| 5 | `feat(backend): add User schema, DTOs, service and controller` | `user.schema.ts`, `user.dto.ts`, `users.service.ts`, `users.controller.ts`, `users.module.ts` |
| 6 | `feat(backend): add Dashboard module with aggregation summary endpoint` | `dashboard.service.ts`, `dashboard.controller.ts`, `dashboard.module.ts` |
| 7 | `feat(backend): add health check endpoint` | `health.controller.ts` with `@Public()` decorator |
| 8 | `test(backend): add unit tests for all services, controllers and auth guard` | All `*.spec.ts` files in `backend/src/` |
| 9 | `test(backend): confirm 80% coverage threshold in Jest config` | `jest.config` update in `backend/package.json` |
| 10 | `feat(docker): add Dockerfile and docker-compose for local development` | `backend/Dockerfile`, `backend/.dockerignore`, `docker-compose.yml` in repo root, `backend/.env.example` |
| 11 | `feat(railway): add Railway deployment configuration` | `backend/railway.json`, update `backend/package.json` with `engines.node` |
| 12 | `docs: add final project README` | Root-level notes on how to run locally and deploy (if user requests it) |

---

## Notes for Subagents

### nestjs-builder
- Do NOT modify any Angular frontend files
- The `backend/` folder is a completely separate Node project (its own `package.json`, `tsconfig.json`)
- Use `@nestjs/mongoose` decorators, not raw `mongoose` schemas
- Use `class-validator` and `class-transformer` for DTO validation
- Token extraction: read `request.headers.authorization`, split on space, take index 1
- The Firebase service account JSON env var approach avoids committing credentials to git

### tester
- Install `@nestjs/testing`, `jest`, `ts-jest` (already in NestJS default scaffold)
- Use `Test.createTestingModule` for all unit tests
- Mock mongoose models using `getModelToken(ModelName.name)`
- Coverage report should be saved to `backend/coverage/`

### docker-builder
- Multi-stage Dockerfile is required to keep the production image small
- `docker-compose.yml` goes in the repo root (not inside `backend/`) so it can start the full stack from one command
- Confirm `backend/.env.example` lists every variable the app reads

### railway-builder
- `railway.json` goes inside `backend/` (Railway uses this when `backend/` is set as the root)
- Set `healthcheckPath` to `/health` (the only public endpoint)
- Nixpacks handles the Node environment — no custom build image needed
