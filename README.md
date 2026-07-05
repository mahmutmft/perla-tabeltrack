# Perla TableTrack

Mobile-first webapp for waiters to track table orders, delivery status, and cash payments. Data lives in Supabase (Postgres), so the waiter's phone and the main PC always see the same tables.

## Stack
- `api/` — Vercel serverless functions (Express app) using `@supabase/supabase-js` with the service_role key, JWT auth
- `src/` — React + Vite frontend (mobile-first)
- `supabase/schema.sql` — the database schema

## One-time setup

1. **Database**: open your Supabase project's SQL Editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `users`, `categories`, `products`, `tables`, and `order_items` tables with Row Level Security enabled (no public policies — only the service_role key, used server-side, can access them).

2. **Environment variables**: copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL` — your project URL (Project Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` key (Project Settings > API). **Never** expose this in frontend code or prefix it with `VITE_` — it bypasses all database security.
   - `JWT_SECRET` — any long random string, used to sign this app's own login tokens (unrelated to Supabase's own auth).

## Running locally

```bash
npm install
npm run dev
```

This starts the API on `http://localhost:4000` and the web app on `http://localhost:5173` (proxies `/api` to the API). Open the web URL on a phone or resize your browser to a mobile viewport.

First run: the login screen offers to create the first **admin** account (name + 4-digit PIN) since no users exist yet. From the admin account, go to **Admin** to add categories, products, and waiter accounts (name + 4-digit PIN each).

## Deploying to Vercel

1. Push this repo to GitHub (already the case if you cloned it from your own repo).
2. In Vercel, "Add New Project" and import the repo — no custom Root Directory or build settings needed, Vercel auto-detects the Vite app and the `api/` functions.
3. Under Project Settings > Environment Variables, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET` (same values as your local `.env`).
4. Deploy. The frontend and API are served from the same domain, so no CORS config is needed.

## Core flow
- **Home**: "Add Table" or "See Existing"
- **Add Table**: name the table (duplicates allowed) → add products via search or by category
- **Existing Tables**: tap a table to open it, mark items delivered, add more items
- **Pay**: cash only — shows the total, can also just display the total to the customer without closing out, then confirm to close the table
