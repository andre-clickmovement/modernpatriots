# Duplication Runbook

How to stand up a **new branded site** from this codebase. For the system overview and file map, see [ARCHITECTURE.md](ARCHITECTURE.md).

The site is a white-label template: brand identity is driven by the Payload **Settings** global and applied through CSS variables, so a clone is mostly **configuration + content**, with a small number of hardcoded values to change per site (see [White-label gaps](#white-label-gaps-edit-per-site)).

---

## 1. Provision infrastructure

For each new site:

- **Repo** — fork/copy this repository (or use it as a template repo).
- **Database** — a PostgreSQL instance. Production: Neon or Supabase (use the pooled connection string). Local: `docker compose up` (Postgres 16, db `crg`, per [docker-compose.yml](docker-compose.yml)).
- **Vercel project** — import the repo (framework auto-detects as Next.js).
- **Vercel Blob store** — create one to host media in production (optional locally).

---

## 2. Environment variables

Copy the template and fill it in:

```bash
cp .env.example .env.local
```

Set, at minimum (see the full table in [ARCHITECTURE.md](ARCHITECTURE.md#environment-variables)):

- `DATABASE_URI` — the new database connection string.
- `PAYLOAD_SECRET` — a **fresh** 32+ char random string (never reuse across sites).
- `NEXT_PUBLIC_SERVER_URL` — the new site's public URL (e.g. `https://www.example.com`).
- `BLOB_READ_WRITE_TOKEN` — from the new Blob store (omit locally to use `/media`).
- `REVALIDATION_SECRET`, `AGENT_API_KEY`, `CRON_SECRET` — fresh per-site secrets.
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` — the new site's AdSense publisher ID and GA4 ID. **Add these explicitly** (they're not in `.env.example`) so the hardcoded fallbacks never apply.

Set the same variables in the Vercel project (Production + Preview).

---

## 3. First run

```bash
pnpm install
pnpm build      # runs `payload migrate` to create the schema, then builds
pnpm dev        # or: pnpm start  (production)
```

Then:

1. Visit `/admin` and create the first user — it is **auto-promoted to admin**.
2. (Optional) Seed content: `pnpm seed` (production seed) or `pnpm seed:dev` (demo data).

---

## 4. Re-brand via Settings (no code)

In `/admin` → **Settings**, set the new brand. Everything here re-themes the live site on save (the layout is revalidated automatically):

| Tab | Fields | Effect |
| --- | --- | --- |
| **General** | `siteName`, `tagline`, `mark`, `siteDescription`, `markAccentIndex`, `footerAccentWord` | Masthead, header, footer brand text. |
| **Theme** | `accentColor`, `fontPair` (traditional/slab/modern), `readSize`, `density` (compact/regular/comfy) | Sets `--accent`, `--font-*`, `--read`, `--gap` CSS variables → restyles the whole site. |
| **Navigation** | `headerNav`, `footerNav` (label + href arrays) | Header/footer menus. Empty → falls back to `DEFAULT_NAV`. |
| **Social & SEO** | `socialLinks`, `defaultMetaTitle`, `defaultMetaDescription` | Footer social links + metadata fallbacks (`buildMetadata`). |
| **Tracking** | `headCode`, `bodyCode` | Raw HTML/JS injected site-wide (GA/GTM/Meta Pixel/etc.). |

Create your **Categories** to match `headerNav` hrefs (e.g. a nav link `/category/news` needs a category with slug `news`). The site's section defaults live in [lib/categories.ts](lib/categories.ts).

---

## White-label gaps (edit per site)

These are **not yet** Settings/env-driven and must be changed in code for each clone. (Making them fully config-driven is a recommended future task — out of scope here.)

1. **AdSense ad-slot IDs** — hardcoded in the four ad components. Replace each `data-ad-slot` with the new account's slot IDs, and set `NEXT_PUBLIC_ADSENSE_CLIENT_ID`:
   - [components/ui/SidebarAd.tsx](components/ui/SidebarAd.tsx) — slot `5794718082`
   - [components/ui/InContentAd.tsx](components/ui/InContentAd.tsx) — slot `9574180992`
   - [components/ui/AfterContentAd.tsx](components/ui/AfterContentAd.tsx) — slot `7251269988`
   - [components/ui/RelatedAd.tsx](components/ui/RelatedAd.tsx) — slot `8547626314` (multiplex)
   - Publisher fallback `ca-pub-1722256094173037` appears in each; prefer setting the env var.
2. **GA / AdSense fallback IDs** in [app/(frontend)/layout.tsx](app/(frontend)/layout.tsx) — `G-6QCQJB2FBJ` and `ca-pub-1722256094173037` are used only if the `NEXT_PUBLIC_*` envs are unset. Set the envs and you can ignore the literals.
3. **Unused `Settings.adSenseClientId`** — the field exists in Settings but the layout currently reads the env/fallback, **not** this field. Don't rely on it until it's wired up.
4. **Default/cosmetic branding** (only shows when Settings is empty, but worth a pass):
   - `DEFAULT_NAV` and the `"Conservative Research Group"` / `"CRG"` / tagline literals in the layout, [Header](components/layout/broadsheet/Header.tsx), and [Footer](components/layout/Footer.tsx).
   - The footer's default company links and the header **"Sign In"** target (`/about`) are hardcoded.
   - CSS uses `crg-*` class names, the `#crg-root` id, and brand-named palette variables (`--navy`, `--red`) in [app/globals.css](app/globals.css). These are cosmetic — per-site colors come from `accentColor`, but rename/retune the static palette if the new brand needs a different base.
5. **Admin title** — `"- CRG Admin"` suffix in [payload.config.ts](payload.config.ts).

---

## 5. Content migration (optional, WordPress)

If importing from WordPress:

1. `pnpm wp-export` — convert a WordPress XML export to JSON ([scripts/wp-export-to-json.ts](scripts/wp-export-to-json.ts)).
2. `pnpm reimport-content` — import post content (HTML → Lexical).
3. `pnpm recategorize` — apply section keyword rules.

Posts/Pages/Media keep a `wpId` for idempotent re-imports. Old WordPress date URLs (`/YYYY/MM/slug`) 301 to `/blog/slug` via [next.config.ts](next.config.ts); add any one-off redirects to [lib/wp-redirects.json](lib/wp-redirects.json).

---

## 6. Deploy

- Push to the Vercel-linked repo. Vercel uses `pnpm install` / `pnpm build` per [vercel.json](vercel.json).
- Set all environment variables in Vercel (Production + Preview).
- The daily content cron (`/api/agent/post`) needs a **Pro** plan; remove the `crons` block in [vercel.json](vercel.json) if unused.
- Point the domain and confirm `NEXT_PUBLIC_SERVER_URL` matches the production domain exactly (drives canonical URLs and the sitemap).

---

## Quick clone checklist

- [ ] New repo, database, Vercel project, Blob store provisioned
- [ ] `.env.local` filled (fresh `PAYLOAD_SECRET` + secrets; correct `NEXT_PUBLIC_SERVER_URL`)
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + `NEXT_PUBLIC_GA_MEASUREMENT_ID` set
- [ ] `pnpm install && pnpm build` (migrations ran)
- [ ] First admin user created at `/admin`
- [ ] Settings filled: General / Theme / Navigation / Social & SEO / Tracking
- [ ] Categories created to match nav hrefs
- [ ] Ad-slot IDs swapped in the four ad components
- [ ] Default brand literals reviewed (layout/Header/Footer, admin title)
- [ ] Content seeded or migrated
- [ ] Env vars set in Vercel; domain pointed; `NEXT_PUBLIC_SERVER_URL` matches
