# CivicNeeds

An AI-powered community problem reporting and intelligence platform. Citizens report local
issues (potholes, broken streetlights, illegal dumping, flooding, etc.), and authorities triage
them with AI-assisted classification, priority scoring, and duplicate detection.

## Stack

- **Frontend**: React (Vite) + TypeScript, Tailwind CSS, Framer Motion, Leaflet
- **Backend**: FastAPI, SQLAlchemy + Alembic
- **Database**: PostgreSQL
- **AI**: Google Gemini (`gemini-1.5-flash`) via `google-generativeai`
- **Auth**: JWT, roles `citizen` / `authority`

## Project layout

```
backend/    FastAPI app, SQLAlchemy models, Alembic migrations
frontend/   Vite + React + TypeScript app
docker-compose.yml
```

## Getting a free Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in and click "Create API key". The free tier is sufficient for development.
3. Copy the key into `backend/.env` as `GEMINI_API_KEY`.

## Environment variables

Copy the example files and fill them in — neither is committed to git:

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**backend/.env**

| Variable                      | Description                                              |
| ------------------------------ | --------------------------------------------------------- |
| `DATABASE_URL`                | Postgres connection string (docker-compose overrides this)|
| `GEMINI_API_KEY`              | Your free-tier Gemini API key                              |
| `JWT_SECRET`                  | Random secret used to sign JWTs                            |
| `JWT_ALGORITHM`               | Defaults to `HS256`                                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Defaults to `1440` (24h)                                   |
| `GEMINI_MODEL`                | Defaults to `gemini-1.5-flash`                              |
| `CORS_ORIGINS`                | Comma-separated allowed origins for the frontend           |

**frontend/.env**

| Variable              | Description                              |
| ---------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL`   | Base URL of the backend API (default `http://localhost:8000`) |

## Running with Docker Compose

This runs Postgres, the backend (with migrations applied automatically on start), and the
frontend dev server together:

```
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Postgres: localhost:5432 (user/password/db: `civicneeds`)

## Running locally without Docker

**Backend**

```
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```
cd frontend
npm install
npm run dev
```

## Database migrations

An initial migration (`backend/alembic/versions/0001_initial.py`) creates the `users`, `reports`,
and `report_images` tables. To create a new migration after changing models:

```
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## Deploying the backend to Render

`render.yaml` at the repo root is a Render "Blueprint" that provisions a free Postgres database
and a Docker web service for the backend together:

1. Push this repo to GitHub.
2. In the Render dashboard: **New > Blueprint**, connect the repo, and Render will read
   `render.yaml` automatically.
3. When prompted, paste your `GEMINI_API_KEY` (it's marked `sync: false` in the blueprint so
   Render asks for it interactively rather than storing it in the repo). `JWT_SECRET` and
   `DATABASE_URL` are generated/wired automatically.
4. Once deployed, Render gives you a URL like `https://civicneeds-backend.onrender.com`. Set that
   as `VITE_API_BASE_URL` in `frontend/.env` to point the local frontend at the hosted backend, and
   add the frontend's own origin (e.g. `http://localhost:5173`) to the backend's `CORS_ORIGINS` env
   var in the Render dashboard if it isn't already there.

Note: Render's free web service tier spins down after inactivity, so the first request after a
period of idleness can take up to ~30-60 seconds while it wakes back up.

## Gemini free-tier rate limits — read before load testing

The free tier of the Gemini API (as used by `gemini-1.5-flash`) is limited to a small number of
requests per minute per project (historically around 15 RPM, plus a daily cap — check current
limits on the Google AI Studio dashboard, as they change). Each report submission can trigger
**up to two** Gemini calls:

1. One call to classify category + priority (`services/ai.py:classify_report`) — always made.
2. One call to check for duplicates (`services/ai.py:find_duplicates`) — only made if there is at
   least one existing OPEN report within 100m (pre-filtered in Postgres via a bounding box +
   haversine check before any AI call happens, and batched into a single call covering all nearby
   candidates rather than one call per candidate).

In practice this means normal, spread-out usage (a handful of reports per minute) stays well
within the free tier. It becomes a problem under **bursty submission** — e.g. a demo, a load
test, or a real event that produces many reports in the same small area within the same minute —
because each of those reports still needs its own classification call, and any of them with
nearby open reports needs a duplicate-check call on top of that. If you hit rate limits:

- Space out test submissions, or
- Queue report creation and process AI calls in the background with backoff/retry, or
- Upgrade the Gemini project to a paid tier for higher throughput.

The classification and duplicate-check calls are defensive: any Gemini error (including a rate
limit error) is caught and the report still saves, falling back to `category=other`,
`priority=medium`, and no duplicate flag rather than failing the request.

## Notes

- Photo upload wiring in the report form currently previews the selected image client-side;
  connecting it to real object storage (S3/GCS/local disk) and populating `image_urls` on submit
  is left as the next integration step.
- The public community map filters by status/category client-side against `GET /reports`; a
  bounding-box query param set (`min_lat`, `max_lat`, `min_lng`, `max_lng`) is already supported
  server-side for viewport-based loading as the dataset grows.
