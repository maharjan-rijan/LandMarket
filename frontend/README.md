# LandMarket – Frontend

React + Vite + Tailwind CSS v4 + Headless UI + React Icons. Frontend only: all data is mock data and auth is stored in localStorage.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Try it

1. `/register` – sign up as buyer, seller or both (no server, saved in localStorage)
2. `/dashboard` – buyer dashboard; use the Buying / Selling switch if you are a seller
3. Reset everything: run `localStorage.clear()` in the browser console

## Structure

- `src/data/mock.js` – all fake data in one place
- `src/context/AuthContext.jsx` – mock auth (replace with API later)
- `src/components/` – ui, layout, auth, land, dashboard
- `src/pages/` – Home, Login, Register, dashboards
