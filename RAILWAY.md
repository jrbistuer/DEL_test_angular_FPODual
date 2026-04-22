# Deploying to Railway

This guide walks you through deploying the NestJS backend to [Railway](https://railway.app).

---

## Prerequisites

- A free Railway account at [railway.app](https://railway.app)
- This GitHub repository connected to your Railway account
- A MongoDB Atlas cluster ready with a connection string
- A Firebase project with a service account key downloaded

---

## Step 1 — Create a new Railway project

1. Log in to [railway.app](https://railway.app) and click **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Authorise Railway to access your GitHub account if prompted.
4. Select this repository from the list.
5. Railway will detect the `railway.json` at the repo root and use `backend/Dockerfile` to build the image automatically.

---

## Step 2 — Set environment variables

In your Railway project, go to the **Variables** tab and add the following:

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/fundesplai` | Replace with your Atlas connection string |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account","project_id":"..."}` | Full JSON as a single-line string (see below) |
| `NODE_ENV` | `production` | Enables production optimisations |
| `FRONTEND_ORIGIN` | `https://your-angular-app.web.app` | Set this after your frontend is deployed |

> **PORT** is set automatically by Railway — do not add it manually.

### How to get `FIREBASE_SERVICE_ACCOUNT_JSON`

1. Open the [Firebase Console](https://console.firebase.google.com).
2. Go to **Project Settings** → **Service Accounts**.
3. Click **Generate new private key** and download the JSON file.
4. Open the file in a text editor, copy the entire contents and paste it as a single line into the Railway variable value field.
   - Railway accepts multi-line values pasted into the dashboard — it stores them correctly.
   - If you need a single-line version, minify the JSON (remove all newlines and extra spaces).

> The value must be a valid JSON string. No extra escaping is needed when pasting directly into the Railway dashboard.

---

## Step 3 — Trigger a deploy

Railway deploys automatically on every push to the `main` branch.

To trigger a manual deploy:
1. Go to your Railway project.
2. Click the **Deploy** tab.
3. Click **Deploy now**.

To deploy via Git push:
```bash
git push origin main
```

---

## Step 4 — Find your public URL

1. In Railway, open your project and click on the **web service**.
2. Go to the **Settings** tab → **Networking** section.
3. Click **Generate Domain** if no domain exists yet.
4. Copy the URL (e.g. `https://your-app.up.railway.app`) — this is your backend base URL.
5. Update `FRONTEND_ORIGIN` with your Angular app URL, and update your Angular environment files to point to this backend URL.

---

## Step 5 — Check logs if something fails

1. In Railway, open your project and click on the service.
2. Click the **Logs** tab to see build and runtime output.
3. Common things to look for:
   - Build errors from Docker
   - Missing environment variables (the app will throw on startup)
   - MongoDB connection failures

---

## Common issues

### `FIREBASE_SERVICE_ACCOUNT_JSON` is invalid
- Make sure the value is valid JSON. You can validate it at [jsonlint.com](https://jsonlint.com).
- Do not add extra backslashes or wrapping quotes — paste the raw JSON content.

### MongoDB connection refused
- In MongoDB Atlas, go to **Network Access** and add `0.0.0.0/0` to the IP allowlist.
- Railway uses dynamic IPs so a fixed IP allowlist will not work.

### First deploy is slow
- The first deploy builds the Docker image from scratch and can take **2–3 minutes**.
- Subsequent deploys use Docker layer caching and are faster.

### Health check fails
- The backend exposes `GET /health` which Railway polls after startup.
- If the health check times out, check the logs for startup errors (missing env vars are the most common cause).
