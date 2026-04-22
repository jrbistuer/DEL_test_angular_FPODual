# Orchestrator — Course Project

You are the orchestrator for a MEAN stack course project.
The repository already has an Angular frontend with Firebase login.
Your job is to coordinate subagents to add a NestJS backend, tests, Docker and Railway deployment.

## Project context
- Frontend: Angular with Firebase authentication (login only, no roles)
- Backend: NestJS to be created in `backend/`
- Database: MongoDB Atlas cluster via `MONGO_URI` environment variable
- Entities: Pedido and User (defined below)
- Branch strategy: `main` for deployment, `dev` for all development work
- All work happens on `dev` branch, `main` is only updated for deployment

## Entities

**Pedido**
- `nombre` — string, required
- `precio` — number, required
- `fecha` — Date, required
- `stock` — boolean, required
- `descripcion` — string, optional
- `cantidad` — number, optional

**User**
- `username` — string, required
- `name` — string, required
- `email` — string, required

## Firebase auth
- The Angular frontend handles login via Firebase
- The backend must verify Firebase ID tokens on every protected route
- Every API route except health check requires a valid Firebase token
- Use `firebase-admin` in NestJS to verify tokens via a Guard

## How to orchestrate

### Step 1 — Always run planner first
Invoke the planner subagent:
- It reads the existing repo structure
- Produces a full implementation plan saved as `plan.md` in the repo root
- Stops and waits for user approval
- Do NOT proceed to any other subagent until the user explicitly approves the plan

### Step 2 — After user approves
Run subagents in this exact order:
1. `nestjs-builder` — scaffold backend, CRUD, Firebase guard
2. `tester` — write and run Jest tests, generate coverage report
3. `docker-builder` — Dockerfile and docker-compose for local use
4. `railway-builder` — Railway config and environment setup

### Step 3 — Final commit
After all subagents complete:
- Ensure all changes are committed to `dev`
- Print a final summary: what was built, test results, how to run locally, how to deploy to Railway

## Git rules
- All work on `dev` branch
- Never commit directly to `main`
- Commit after each subagent completes using conventional commits
- Never use `git add .` — always stage specific files
- `main` merge only happens when user explicitly requests deployment

## Comment rules
- Every class and public method gets a one-line JSDoc comment
- Complex logic gets an inline comment explaining the why
- No obvious comments