# Running the stack locally with Docker

This guide explains how to run the NestJS backend and a local MongoDB instance using Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your machine.

---

## Steps

### Step 1 — Configure environment variables

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder value for `FIREBASE_SERVICE_ACCOUNT_JSON` with the JSON content of your Firebase service account key file (obtained from the Firebase console under **Project Settings > Service Accounts > Generate new private key**).

Example:

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
```

---

### Step 2 — Build and start the stack

From the **repo root**, run:

```bash
docker compose up --build
```

This command will:
1. Build the NestJS backend image using the multi-stage `backend/Dockerfile`.
2. Pull the `mongo:7` image if not already available.
3. Start both the `backend` and `mongo` containers.

The first build takes a few minutes. Subsequent runs reuse cached layers and are much faster.

---

### Step 3 — Access the API

Once the stack is running, the API is available at:

```
http://localhost:3000
```

---

### Step 4 — Verify the health check

Open a terminal or browser and run:

```
GET http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok" }
```

If you see this response, the backend is up and connected.

---

### Step 5 — Stop the stack

To stop all containers, press `Ctrl+C` in the terminal where compose is running, or from another terminal run:

```bash
docker compose down
```

To also remove the persisted MongoDB data volume:

```bash
docker compose down -v
```

---

## Note for production

The local stack uses a container-based MongoDB instance (`mongo:7`) for convenience.
For production (Railway or any cloud environment), replace `MONGO_URI` in your environment variables with your **MongoDB Atlas** connection string and remove or ignore the `mongo` service in `docker-compose.yml`.
