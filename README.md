# Medicine Availability Finder

College mini project: search nearby pharmacies for a medicine, view availability/price/distance, get substitute suggestions, and submit requests. Includes a simple admin panel.

## Stack
- Frontend: React + Vite + Tailwind CSS + React Router + Leaflet
- Backend: Node.js + Express + SQLite (via `node:sqlite`, Node 22+)

## Setup
```
npm run install:all
npm run seed
npm run dev
```
- API: http://localhost:4000
- Web: http://localhost:5173

## Demo credentials
- Admin: `admin` / `admin123` (token-based, demo only)

## Notes
- Data is sample/demo data around Bengaluru. Not a real medical service.
- Requires Node.js 22+ (uses built-in `node:sqlite`).
