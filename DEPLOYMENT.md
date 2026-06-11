# Deployment checklist — see README.md and wordpress-migration-PRD.md Section 9.4

## Vercel Environment Variables

Set all variables from `.env.example` in the Vercel project settings.

## Database Migrations

On first deploy (or after schema changes):

```bash
pnpm payload migrate:create initial   # once, generates migrations/
pnpm payload migrate                  # applies to Neon
```

Migrations run automatically on Vercel via `pnpm build` (migrate runs before `next build`).

## Fix Vercel 404 (NOT_FOUND)

If you see `404: NOT_FOUND` with a Vercel error ID (not your site's styled 404 page):

1. **Vercel Dashboard → Project → Settings → General → Framework Preset** must be **Next.js** (not "Other")
2. **Root Directory** must be empty / `.` (repo root where `package.json` lives)
3. **Build Command:** `pnpm build` | **Install Command:** `pnpm install`
4. Open the latest deployment → confirm status is **Ready** (not Error/Canceled)
5. Click **Visit** on that deployment — use the `*.vercel.app` URL first before custom domain
6. For custom domains: Settings → Domains → confirm "Valid Configuration"

## Pre-Launch

- [ ] DATABASE_URI points to production Neon (pooled)
- [ ] PAYLOAD_SECRET is a unique 32+ char string
- [ ] AGENT_API_KEY and REVALIDATION_SECRET set
- [ ] BLOB_READ_WRITE_TOKEN set for media storage
- [ ] Custom domain configured with SSL
- [ ] WordPress content imported via `pnpm seed`
- [ ] 301 redirects verified (see next.config.ts)
- [ ] Vercel Cron enabled (Pro plan)
- [ ] Lighthouse ≥ 90 on homepage and blog post

## DNS

Point your domain A/CNAME records to Vercel per their dashboard instructions.

## Post-Launch QA

Run through PRD Section 11 acceptance criteria:
- All routes render
- Admin login works
- Agent endpoint auth works
- Sitemap lists all content
- Old WP URLs redirect correctly
