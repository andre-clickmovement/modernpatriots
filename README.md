# Conservative Research Group — Next.js + Payload CMS

Modern stack migration from WordPress: Next.js 15, Payload CMS 3, PostgreSQL, Vercel.

## Quick Start

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run dev server
pnpm dev
```

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

## First-Time Setup

1. Visit `/admin` and create your admin user, OR run dev seed:

```bash
pnpm tsx scripts/seed-dev.ts
```

Default dev admin (if using seed-dev): `admin@crg.local` / `admin123`

## WordPress Migration

```bash
# Export from WordPress admin → Tools → Export → All Content
pnpm wp-export ./wordpress-export.xml

# Import into Payload
pnpm seed
```

## AI Agent

```bash
curl -X POST http://localhost:3000/api/agent/post \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"<p>Hello</p>","status":"published"}'
```

Daily cron is configured in `vercel.json` (requires Vercel Pro).

## Deployment (Vercel)

1. Push to GitHub and connect Vercel
2. Set environment variables from `.env.example`
3. Use Neon PostgreSQL pooled connection string for `DATABASE_URI`
4. First deploy runs Payload migrations automatically
5. Run `pnpm seed` against production (or import locally)
6. Configure custom domain and DNS

See [wordpress-migration-PRD.md](./wordpress-migration-PRD.md) for full acceptance criteria.

## Project Structure

```
app/(frontend)/     Public Broadsheet site
app/(payload)/      Payload admin + REST API
payload/            CMS collections & globals
components/         UI and layout components
scripts/            WP migration & seed utilities
agent/              AI posting helpers
```
