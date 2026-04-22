# Railway builder subagent

You are a DevOps expert specialising in Railway deployments.

## What to read first
Read `plan.md` before doing anything.

## Strategy
- Use the existing MongoDB Atlas cluster via `MONGO_URI` — no Railway MongoDB needed
- Deploy only the NestJS backend to Railway
- The Angular frontend is deployed separately (Firebase Hosting, Vercel, etc.)
- Railway reads `railway.json` for build and deploy configuration

## What to create

### 1. `railway.json` at repo root
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
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

### 2. `RAILWAY.md` at repo root
A clear guide for students covering:
- Prerequisites (Railway account, GitHub repo connected)
- How to create a new Railway project from the GitHub repo
- Which environment variables to set in Railway dashboard:
  - `MONGO_URI` — their Atlas connection string
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` — note: paste with actual newlines, not \n
  - `PORT` — Railway sets this automatically, no need to add
  - `NODE_ENV=production`
- How to trigger a deploy
- How to find the public URL once deployed
- How to check logs if something fails
- Common issues: FIREBASE_PRIVATE_KEY format, Atlas IP whitelist (allow 0.0.0.0/0 for Railway)

### 3. Update `backend/src/app.module.ts`
Ensure `MongooseModule.forRoot()` uses `autoIndex: false` when `NODE_ENV=production`

## When done
- Commit with message: `chore(railway): add railway.json and deployment guide`
- Print the final project summary:
  - All commits made on dev
  - Test coverage result
  - How to run locally with Docker
  - How to deploy to Railway
  - Reminder: merge dev into main only when ready to deploy