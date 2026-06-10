# Privacy Guard

A cybersecurity web app that detects personal data breaches using OSINT APIs, with an AI Risk Advisor, email monitoring, and a password breach checker.

## Features

- **Threat Scan** — search your email or username against 3.2 billion leaked credentials (ProxyNova COMB)
- **Password Checker** — check if a password appears in breach data using HaveIBeenPwned k-anonymity (your password is never sent anywhere)
- **Email Monitoring** — watch emails for new breaches with 24-hour scheduled re-scans and alerts
- **AI Risk Advisor** — OpenAI-powered remediation plan generated from your scan results
- **Dashboard** — overview of all scan history, risk distribution, and breach categories

## Requirements

- Node.js 20+
- PostgreSQL database
- OpenAI API key (for the AI Risk Advisor feature)

## Quick Start

### 1. Clone / unzip and install dependencies

```bash
# Install all dependencies (root + server + client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example server/.env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/privacy_guard
OPENAI_API_KEY=sk-...
PORT=3001
```

### 3. Set up the database

Create a PostgreSQL database called `privacy_guard` (or whatever you named it in DATABASE_URL), then push the schema:

```bash
cd server
npm run db:push
cd ..
```

### 4. Run the app

```bash
npm run dev
```

This starts both the API server (port 3001) and the frontend (port 5173) concurrently.

Open http://localhost:5173 in your browser.

## Project Structure

```
privacy-guard/
├── server/              Express API backend (port 3001)
│   ├── src/
│   │   ├── db/          Drizzle ORM schema + connection
│   │   ├── lib/         Scanner, scheduler, logger
│   │   └── routes/      API route handlers
│   └── drizzle.config.ts
├── client/              React + Vite frontend (port 5173)
│   └── src/
│       ├── lib/         API client hooks, schemas, utils
│       ├── components/  Layout + shadcn/ui components
│       └── pages/       Dashboard, Scan, Monitoring, Passwords, History
└── .env.example
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/scans | Run breach scan |
| GET | /api/scans/history | Recent scan history |
| POST | /api/advisor/recommend | AI security recommendations |
| GET | /api/dashboard/summary | Dashboard stats |
| GET | /api/dashboard/breach-categories | Data category breakdown |
| GET | /api/monitors | List monitored emails |
| POST | /api/monitors | Add email to monitor |
| DELETE | /api/monitors/:id | Remove a monitor |
| POST | /api/monitors/:id/scan | Trigger manual re-scan |
| GET | /api/monitors/alerts | List breach alerts |
| POST | /api/passwords/check | Check password via HIBP k-anonymity |

## Data Sources

- **Email scanning**: [ProxyNova COMB API](https://api.proxynova.com) — 3.2 billion records, free, no key required
- **Password checking**: [HaveIBeenPwned Pwned Passwords](https://haveibeenpwned.com/API/v3#PwnedPasswords) — 1 billion+ passwords, free, no key required (k-anonymity)
- **AI recommendations**: OpenAI GPT-4o-mini (requires OPENAI_API_KEY)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes (for AI) | OpenAI API key for the AI Risk Advisor |
| `PORT` | No | API server port (default: 3001) |
