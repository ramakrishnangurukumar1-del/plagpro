# Deployment Guide

Three pieces to deploy: **frontend** (Vercel), **backend + ML service + database** (Railway).

## 1. Railway — backend, ML service, and MySQL

1. Go to [railway.app](https://railway.app) and sign up / log in (GitHub login is easiest).
2. **New Project → Deploy from GitHub repo** → select `plagpro`.
3. Railway will try to auto-detect a service from the repo root — delete that first guess, then add three services manually into the same project:

   **Service A — Database**
   - "New" → "Database" → "Add MySQL"
   - Once created, open its "Variables" tab and note `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.

   **Service B — Backend**
   - "New" → "GitHub Repo" → `plagpro` → set **Root Directory** to `backend`
   - Railway will detect the `Dockerfile` there and build it.
   - Under "Variables," add:
     ```
     DB_HOST=<MYSQLHOST from Service A>
     DB_PORT=<MYSQLPORT from Service A>
     DB_NAME=<MYSQLDATABASE from Service A>
     DB_USERNAME=<MYSQLUSER from Service A>
     DB_PASSWORD=<MYSQLPASSWORD from Service A>
     JWT_SECRET=<any long random string>
     ML_BASE_URL=<Service C's public URL, added after Service C is deployed>
     CORS_ORIGINS=<your Vercel URL, added after step 2>
     ```
   - Under "Settings" → "Networking," click "Generate Domain" to get a public URL for this service (e.g. `plagpro-backend.up.railway.app`).

   **Service C — ML service**
   - "New" → "GitHub Repo" → `plagpro` → set **Root Directory** to `ml-service`
   - Railway detects its `Dockerfile` too.
   - No environment variables needed.
   - "Settings" → "Networking" → "Generate Domain" for its own public URL.
   - Go back to Service B's variables and set `ML_BASE_URL` to this URL (e.g. `https://plagpro-ml.up.railway.app`).

   Note: the ML service downloads ~600MB of model weights on its first request — that first call will be slow (1-2 min), every one after is fast.

## 2. Vercel — frontend

1. Go to [vercel.com/new](https://vercel.com/new) and import the `plagpro` GitHub repo.
2. Framework preset: Vite (should auto-detect).
3. Add an environment variable:
   ```
   VITE_API_BASE_URL=<Service B's public URL from Railway>
   ```
4. Deploy. Vercel gives you a URL like `plagpro.vercel.app`.
5. Go back to Railway's Service B (backend) variables and set `CORS_ORIGINS` to this Vercel URL so the frontend is allowed to call the API.

## 3. Redeploy backend once more

After setting `CORS_ORIGINS` and `ML_BASE_URL` on the backend service, trigger a redeploy (Railway does this automatically when variables change, or click "Redeploy").

## Verifying it worked

Visit your Vercel URL, register an account, and upload a document — the same flow tested locally. If something fails, check each service's logs tab in Railway for the actual error.
