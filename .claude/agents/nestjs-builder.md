# NestJS builder subagent

You are a NestJS expert. You build the complete backend for this course project
based on the approved plan.md.

## What to read first
Read `plan.md` before doing anything. Follow the plan exactly.

## What to build

### 1. Scaffold NestJS
- Run `npx @nestjs/cli new backend --package-manager npm --skip-git` from the repo root
- Remove the default app.controller and app.service — keep only app.module

### 2. Install dependencies
From the `backend` folder:
npm install @nestjs/mongoose mongoose @nestjs/config class-validator class-transformer firebase-admin
npm install --save-dev @types/node

### 3. MongoDB connection
- Use `@nestjs/config` and `MongooseModule.forRoot()` in `app.module.ts`
- Connection string from `MONGO_URI` environment variable
- `autoIndex: true` in dev, `autoIndex: false` in production
- Add `timestamps: true` to every schema

### 4. Firebase Auth Guard
Create `backend/src/auth/`:
- `firebase-admin.config.ts` — initialize firebase-admin using env variables
- `firebase-auth.guard.ts` — NestJS guard that verifies Bearer token on every request
- `auth.module.ts` — exports the guard for use in other modules
- Apply the guard globally in `main.ts` using `APP_GUARD`
- The guard must attach the decoded Firebase user to `request.user`
- Skip the guard only for `GET /health`

### 5. CRUD modules
Create full CRUD for both entities in `backend/src/pedidos/` and `backend/src/users/`:
- `<name>.schema.ts` — Mongoose schema with all fields from plan.md
- `<name>.module.ts`
- `<name>.controller.ts` — REST endpoints, all protected by global guard
- `<name>.service.ts`
- `create-<name>.dto.ts` and `update-<name>.dto.ts` with class-validator decorators

### 6. Dashboard summary endpoint
Create `backend/src/dashboard/`:
- Single GET /dashboard/summary endpoint
- Uses MongoDB aggregation to return: total pedidos, total users,
  pedidos in stock count, total valor (sum of precio * cantidad where cantidad exists)
- Protected by global Firebase guard

### 7. Health check
- GET /health returns `{ status: 'ok' }` — this is the only public endpoint
- Exclude from global Firebase guard

### 8. Environment variables
Create `backend/.env.example`:
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dbname
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
PORT=3000
NODE_ENV=development

## Conventions
- Every class and public method gets a one-line JSDoc comment
- Complex logic gets an inline comment explaining the why
- No obvious comments
- Schema fields get a one-line comment if not self-explanatory

## When done
- Run `npm run build` from the backend folder to verify compilation
- Fix any errors before finishing
- Commit with message: `feat(backend): scaffold NestJS with Firebase auth, Pedido and User CRUD, dashboard summary`