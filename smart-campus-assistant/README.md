# AI-Powered Smart Campus Assistant

A full-stack web application that helps college students manage academics, identify skill gaps, track placement readiness, find jobs, and get answers from an AI chatbot.

> **Stage 1 complete** — Project scaffold, database connection, and health endpoint.
> Modules (Academic, Skills, Learning Path, Placement, Jobs, Chatbot) are added in Stages 2–10.

---

## What's inside

```
smart-campus-assistant/
├── client/          ← Next.js 14 frontend (TypeScript + Tailwind CSS + Recharts)
├── server/          ← Express.js backend  (TypeScript + Sequelize + PostgreSQL)
├── scripts/         ← Helper scripts (DB setup, verification)
├── .env.example     ← Reference for all environment variables
└── README.md        ← You are here
```

---

## Prerequisites

Install these before you start. Each link goes to the official download page.

| Tool | Minimum version | Check if installed |
|---|---|---|
| [Node.js](https://nodejs.org/en/download) | 20 LTS | `node -v` |
| [npm](https://www.npmjs.com/) | 9 (comes with Node) | `npm -v` |
| [PostgreSQL](https://www.postgresql.org/download/windows/) | 14+ | See below |
| [Git](https://git-scm.com/download/win) | any | `git -v` |

**Check PostgreSQL is running on Windows:**
1. Press `Win + R`, type `services.msc`, press Enter
2. Look for `postgresql-x64-18` (or similar) — it should say **Running**
3. If it says Stopped, right-click → Start

---

## One-time setup

### 1. Clone or open the project

If you got the project as a folder, skip this step.
If you want to use Git:

```powershell
git clone <your-repo-url>
cd smart-campus-assistant
```

### 2. Install all dependencies

Run each command in a PowerShell or Command Prompt window.

```powershell
# Root (installs 'concurrently' so both servers start with one command)
cd smart-campus-assistant
npm install

# Backend server
cd server
npm install
cd ..

# Frontend client
cd client
npm install
cd ..
```

> **Why so many packages?** Next.js alone is ~300 MB. This is normal — `node_modules`
> is never committed to Git (it's in `.gitignore`).

### 3. Create the PostgreSQL database

Open **PowerShell** and run:

```powershell
# Replace 'yourpassword' with your actual PostgreSQL password
$env:PGPASSWORD = "yourpassword"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE smart_campus;"
```

You should see:
```
CREATE DATABASE
```

If you see `database "smart_campus" already exists`, that's fine — it's already there.

> **Can't remember your PostgreSQL password?**
> When you installed PostgreSQL, the installer asked you to set a password for the
> `postgres` superuser. That's the password to use here. If you've forgotten it,
> search for "reset postgres password windows" — the official docs walk you through it.

### 4. Configure environment variables

**Backend** — the file that holds your secrets (never committed to Git):

```powershell
# The file already exists at server/.env
# Open it and change one line:
notepad smart-campus-assistant\server\.env
```

Find this line and replace the placeholder with your real password:
```
DB_PASSWORD=your_actual_local_password   ← change this
```

The rest of the file is already configured correctly for local development.

**Frontend** — already configured, nothing to change:

```
client/.env.local contains:
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Build the server (one-time)

```powershell
cd smart-campus-assistant\server
npm run build
cd ..\..
```

You should see no output — that means zero errors. A `dist/` folder is created.

---

## Running the application

You need **two terminal windows** open at the same time.

### Terminal 1 — Backend server (port 4000)

```powershell
cd smart-campus-assistant\server
npm run dev
```

Expected output:
```
[DB] PostgreSQL connection established successfully.
[Server] Running in development mode
[Server] Listening on http://localhost:4000
[Server] Health check → http://localhost:4000/api/health
```

If you see `password authentication failed`, double-check `DB_PASSWORD` in `server/.env`.
If you see `database "smart_campus" does not exist`, run Step 3 above.

### Terminal 2 — Frontend (port 3000)

```powershell
cd smart-campus-assistant\client
npm run dev
```

Expected output:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
- Ready in Xs
```

### Open in your browser

Go to **http://localhost:3000**

You will see the Stage 1 status page showing:
- API Server: Running
- PostgreSQL: connected
- Environment: development

---

## Verify everything is working

### Option A — Browser (easiest)

1. Open http://localhost:3000 — you should see green status indicators
2. Open http://localhost:4000/api/health — you should see JSON like:

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-10-26T05:30:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

### Option B — PowerShell verification script

With the backend server running in Terminal 1:

```powershell
cd smart-campus-assistant
powershell -ExecutionPolicy Bypass -File scripts\test-stage1.ps1
```

This script:
1. Reads your DB credentials from `server/.env`
2. Creates the `smart_campus` database if it doesn't exist
3. Starts the server temporarily
4. Calls `GET /api/health` and checks the response
5. Prints PASS or FAIL with details

---

## Stopping the servers

In each terminal window, press **Ctrl + C**.

---

## Project scripts reference

Run these from the `smart-campus-assistant/` root:

| Command | What it does |
|---|---|
| `npm run dev` | Start both frontend and backend together |
| `npm run dev:server` | Start backend only (port 4000) |
| `npm run dev:client` | Start frontend only (port 3000) |
| `npm run build:server` | Compile server TypeScript to `dist/` |
| `npm run build:client` | Build Next.js for production |

Run these from `smart-campus-assistant/server/`:

| Command | What it does |
|---|---|
| `npm run dev` | Start backend with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start compiled backend (production) |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:seed` | Load demo seed data |

---

## Environment variables explained

### server/.env (never commit this file)

| Variable | Example value | Required | Purpose |
|---|---|---|---|
| `PORT` | `4000` | No | Port the Express server listens on |
| `NODE_ENV` | `development` | No | Controls logging and error detail |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_NAME` | `smart_campus` | Yes | Database name |
| `DB_USER` | `postgres` | Yes | PostgreSQL username |
| `DB_PASSWORD` | your password | Yes | PostgreSQL password |
| `JWT_SECRET` | long random string | Yes | Signs authentication tokens |
| `OPENAI_API_KEY` | `sk-...` | No | LLM API key (chatbot falls back without it) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | No | Works with OpenAI, Groq, Ollama, etc. |
| `LLM_MODEL` | `gpt-4o-mini` | No | Which model to use |

### client/.env.local (safe — no secrets)

| Variable | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Where the frontend sends API requests |

> **Security note:** Any variable starting with `NEXT_PUBLIC_` is visible in your
> browser. Never put database passwords or API keys there.

---

## Common errors and fixes

### `password authentication failed for user "postgres"`
→ Open `server/.env` and fix the `DB_PASSWORD` value.

### `database "smart_campus" does not exist`
→ Run the CREATE DATABASE command in Step 3.

### `Cannot find module` or `Module not found`
→ You haven't installed dependencies. Run `npm install` in the folder that's failing.

### Port 3000 or 4000 already in use
→ Another process is using that port. Either stop it, or:
- Change `PORT=4001` in `server/.env` and update `NEXT_PUBLIC_API_URL=http://localhost:4001` in `client/.env.local`

### `ENOENT: no such file or directory, open '.env'`
→ You're running the server from the wrong folder. `cd` into `server/` first.

### Next.js page shows "Failed to reach backend"
→ The backend server isn't running. Open Terminal 1 and run `npm run dev` in `server/`.

---

## Security reminders

- `server/.env` is in `.gitignore` — it will **never** be committed to Git automatically
- The `.env.example` files contain **placeholders only** — safe to commit
- JWT tokens are signed on the server with `JWT_SECRET` — never expose this in the frontend
- The `NEXT_PUBLIC_API_URL` is the only value intentionally visible in the browser

---

## What's coming in Stage 2

- User registration and login (bcrypt password hashing + JWT)
- Protected route middleware on the backend
- Auth guard on the frontend dashboard
- Login and register pages with form validation

---

## Tech stack summary

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Next.js (App Router) | 14.2.5 |
| Frontend language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x (v3 upgrade planned) |
| Backend framework | Express.js | 4.x |
| Backend language | TypeScript | 5.x |
| Database | PostgreSQL | 18 |
| ORM | Sequelize | 6.x |
| Auth | JWT + bcrypt | — |
| Dev runner | ts-node-dev | 2.x |
| Process manager | concurrently | 8.x |
