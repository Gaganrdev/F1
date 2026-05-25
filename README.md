# F1 Dashboard

A Next.js dashboard for Formula 1 data, including:
- race weekend schedule
- latest session results
- driver and constructor standings
- track map
- F1 news feed

## Tech Stack

- Next.js (App Router) + TypeScript
- React + Tailwind CSS
- Python scripts using FastF1
- Jolpica (Ergast-compatible) and Motorsport.com RSS APIs

## Prerequisites

- Node.js 20+
- npm
- Python 3.10+ with `venv`

## Local Setup

1. Install Node dependencies:
   ```bash
   npm ci
   ```

2. Create and prepare the Python virtual environment used by API routes:
   ```bash
   python3 -m venv python_scripts/venv
   ./python_scripts/venv/bin/pip install -r python_scripts/requirements.txt
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open:
   - http://localhost:3000

## Available Scripts

- `npm run dev` — start development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run ESLint

## API Routes

- `/api/schedule` — upcoming/current race weekend schedule
- `/api/session` — latest session results
- `/api/standings?type=drivers|constructors` — championship standings
- `/api/track` — track coordinates for map rendering
- `/api/news` — latest F1 news

## Docker

Build and run:

```bash
docker build -t f1-dashboard .
docker run --rm -p 3000:3000 f1-dashboard
```

## Notes

- The app caches API responses in memory to reduce external requests.
- Python routes expect the virtual environment at `python_scripts/venv`.
- On restricted networks, `npm run build` can fail if Google Fonts cannot be fetched.
