# Project Onyx

**Xbox achievement and game-completion dashboard**

[Live dashboard](https://onyx.thomaspercival.dev/) · [Python backend](https://github.com/tpercival01/Project-Onyx-API)

Project Onyx is a full-stack portfolio project for exploring public Xbox profiles, viewing game and achievement progress, and tracking completions. The website uses cached records from PostgreSQL so normal dashboard browsing does not depend on the availability or latency of the upstream Xbox data provider.

The dashboard includes a Gamertag lookup, profile statistics, game search and sorting, per-game achievement lists, and four completion medals. **Onyx** is awarded when a game has 100% of its recorded achievements unlocked. These are Project Onyx completion indicators, **not official Xbox rewards**.

## Technology

| Layer | Technology |
| --- | --- |
| Web application | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Server-side database access | Drizzle ORM, Neon serverless PostgreSQL driver |
| Background ingestion | Separate Python / FastAPI / Celery backend |
| Job broker and duplicate protection | Redis (backend) |
| External data | OpenXBL API (backend only) |
| Hosting | Vercel (frontend), DigitalOcean / Docker Compose (backend), Neon PostgreSQL |

## Architecture

```mermaid
flowchart LR
    U[Visitor's browser] --> N[Next.js on Vercel]
    N -->|Read cached profiles, games and achievements| D[(Neon PostgreSQL)]
    N -->|Server-side authenticated sync requests| A[FastAPI on DigitalOcean]
    A -->|Queue background tasks| R[(Redis)]
    W[Celery worker] -->|Consume queued tasks| R
    W -->|Retrieve Xbox data| X[OpenXBL]
    W -->|Validate and upsert| D
    A -->|Resolve profile and cache user| D
```

The frontend reads from PostgreSQL in **Next.js Server Components**. Its server actions send sync requests to FastAPI using the private `ONYX_SYNC_TOKEN`; the browser does not receive this credential or communicate directly with OpenXBL. FastAPI queues work for Celery, which fetches and updates the cached data asynchronously. The UI polls for the requested data when a library or achievement catalog has not yet arrived.

The backend also implements Redis-backed duplicate protection for library sync requests. A successful queue response is **not** a guarantee that ingestion has completed.

## Features

- Search for a public Xbox Gamertag and open its player dashboard.
- Browse profile totals for Gamerscore, achievements and game completion.
- Filter the library by medal tier, search game titles and sort by recent play, name, completion or Gamerscore.
- Browse individual game summaries and expandable unlocked/locked achievement collections.
- View custom completion-medal artwork throughout the profile and game pages.
- Request a library refresh and see whether a job was queued or already queued.
- View loading, delayed-sync and error states when data is unavailable.
- Use responsive layouts across phone and desktop screen sizes.

### Completion medals

Medals represent **achievement-count completion per game**, not the Gamerscore value of individual achievements.

| Medal | Completion |
| --- | --- |
| Bronze | Started; less than 50% |
| Silver | 50% to less than 80% |
| Gold | 80% to less than 100% |
| Onyx | 100% |

Medals are not assigned when achievement totals are unknown or when a game has no unlocked achievements. Unstarted games are hidden from the default library view but can be revealed with **Show all games**. Aggregated completion statistics exclude started games without known achievement totals.

## Run locally

**Prerequisites:** Node.js compatible with Next.js 16 (Node.js 20.9 or newer), npm, an accessible PostgreSQL database with the expected schema, and an available Project Onyx API for sync operations.

```bash
# Clone this repository and enter its directory
npm ci
```

Create `.env.local` in the project root (never commit it):

```dotenv
# PostgreSQL connection string for server-side Drizzle queries
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# Private shared token, matching the backend configuration
ONYX_SYNC_TOKEN=REPLACE_WITH_YOUR_PRIVATE_TOKEN

# API endpoint used by Gamertag lookup
NEXT_PUBLIC_API_URL=https://api.onyx.thomaspercival.dev
```

Start the development server:

```bash
npm run dev
```

Open <http://localhost:3000>. To validate a production build:

```bash
npm run build
```

**Existing database required:** The application expects the `users`, `games` and `achievements` tables described in [`src/lib/schema.ts`](src/lib/schema.ts). Games use the composite primary key `(id, user_xuid)` because the same title can belong to multiple profiles. A fully tested from-empty-database migration/bootstrap workflow is not yet provided. Do **not** run `drizzle-kit push` against the production Neon database without reviewing the proposed schema changes and taking a backup.

**Local API configuration limitation:** `NEXT_PUBLIC_API_URL` currently controls the Gamertag search request. Other server actions still use the production API URL directly. Running a completely isolated local frontend + local backend therefore requires updating those action URLs first. Until then, avoid using real refresh/sync controls during isolated local development.

## Production setup

The frontend is deployed to Vercel and connects to the existing Neon database. Configure `DATABASE_URL`, `ONYX_SYNC_TOKEN`, and `NEXT_PUBLIC_API_URL` in the Vercel project's appropriate environments, then deploy the Next.js application. Keep `ONYX_SYNC_TOKEN` server-side: don't rename it to a `NEXT_PUBLIC_` variable.

The API and worker are deployed separately on DigitalOcean using Docker Compose, Redis and an HTTPS reverse proxy. The frontend repository does not provision that infrastructure. See the [backend repository's README](https://github.com/tpercival01/Project-Onyx-API) for its deployment requirements and current operational limitations.

## Data and operational limitations

- Xbox data is fetched through **OpenXBL**, so upstream response quality, rate limits and service availability affect how quickly cached data is refreshed.
- Some library responses omit achievement totals. The backend can obtain verified totals from per-game catalogs; the UI excludes unknown totals from completion calculations instead of treating them as zero-percent complete.
- Cached data can be older than the current Xbox account state. A queued refresh may take time; neither the frontend nor Redis lock alone provides a full job-status history.
- Library sync deduplication is implemented in the backend; per-game achievement sync is not protected by the same library lock.
- The application is designed around public Xbox profile data and is not affiliated with Microsoft or Xbox.

## Portfolio engineering focus

Project Onyx is intended to demonstrate a production-oriented, decoupled web architecture: cache-first server rendering, typed frontend code, authenticated server actions, asynchronous background ingestion, relational database modelling, PostgreSQL upserts, rate-limited external API integration and Docker-based backend deployment. The emphasis is reliability, maintainability and a clear technical explanation rather than additional gamification or monetisation features.

## Repositories

- **Frontend:** https://github.com/tpercival01/Project-Onyx
- **Backend:** https://github.com/tpercival01/Project-Onyx-API
- **Live site:** https://onyx.thomaspercival.dev/
