# Architecture

How this site is built and structured. Companion to [DUPLICATION.md](DUPLICATION.md), which is the step-by-step runbook for cloning it to a new brand.

The short version: this is a **Next.js (App Router) + Payload CMS + PostgreSQL** site with a newspaper-style "Broadsheet" design system. Nearly all branding — name, colors, fonts, spacing, nav, tracking — is driven by a single Payload **Settings** global and applied through CSS custom properties, so most "duplication" is configuration rather than code.

---

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | `15.4.11` |
| UI runtime | React / React DOM | `^19.1.0` |
| Language | TypeScript | `^5.8.3` |
| CMS | Payload CMS | `^3.49.1` (resolves to 3.85.x) |
| Database | PostgreSQL via `@payloadcms/db-postgres` | `^3.49.1` |
| Rich text | `@payloadcms/richtext-lexical` (Lexical) | `^3.49.1` |
| Media storage | `@payloadcms/storage-vercel-blob` (optional) | `^3.49.1` |
| Admin UI / Next glue | `@payloadcms/ui`, `@payloadcms/next` | `^3.49.1` |
| Styling | Tailwind CSS 3 (CSS-variable theme) | `^3.4.17` |
| Images | `sharp` | `^0.34.2` |
| AI (optional) | `@anthropic-ai/sdk` | `^0.39.0` |
| Migration helpers | `fast-xml-parser`, `jsdom` (WordPress import) | — |
| Package manager | **pnpm** (`packageManager: pnpm@10.34.1`) | lockfile: `pnpm-lock.yaml` |
| Node | `engines.node` | `>=20.9.0` |

Use **pnpm** — it is the only committed lockfile. (Next may print a "multiple lockfiles" warning if a stray `package-lock.json` exists in a parent/home directory; it is not in this repo.)

### npm scripts ([package.json](package.json))

- `dev` — Next dev server (frontend + Payload admin at `/admin`).
- `build` — runs `payload migrate` (auto-confirmed) → `payload generate:importmap` → `next build`.
- `start` — Next production server.
- `devsafe` — wipe `.next` and run dev.
- `generate:types` — regenerate [payload-types.ts](payload-types.ts) from collections.
- `seed` / `seed:dev` — seed production / demo content.
- `wp-export` / `reimport-content` / `recategorize` — WordPress migration + maintenance utilities in [scripts/](scripts/).

---

## Configuration files

- **[next.config.ts](next.config.ts)** — wraps config in `withPayload(...)`. Allows all HTTPS image hosts (`remotePatterns: hostname **`) plus local `/media`. Adds permanent 301s: WordPress date URLs `/:year/:month/:slug` → `/blog/:slug`, plus the list in [lib/wp-redirects.json](lib/wp-redirects.json). Webpack aliases stub `@payloadcms/plugin-cloud-storage/utilities` and `undici` out of the browser bundle (prevents server packages leaking client-side).
- **[tailwind.config.ts](tailwind.config.ts)** — color and font tokens are **aliases to CSS variables** (`navy → var(--navy)`, `accent → var(--accent)`, `font-head → var(--font-head)`, …). `maxWidth.crg = 1180px`. `darkMode: 'class'`. No plugins.
- **[tsconfig.json](tsconfig.json)** — path aliases `@/*` → repo root and `@payload-config` → [payload.config.ts](payload.config.ts).
- **[vercel.json](vercel.json)** — `framework: nextjs`, build/install via pnpm, and a daily **cron** hitting `/api/agent/post` at `0 8 * * *` (UTC). Cron requires a Vercel Pro plan.
- **[postcss.config.mjs](postcss.config.mjs)** — Tailwind + Autoprefixer.
- **[docker-compose.yml](docker-compose.yml)** — local PostgreSQL 16 (db `crg`, user/pass `postgres`, port 5432) for development.
- **`.npmrc`** — hoists `@payloadcms/*` (`shamefully-hoist`) for Payload compatibility.

---

## Environment variables

Source template: [.env.example](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URI` | ✅ | PostgreSQL connection string (Neon/Supabase pooled string in prod). |
| `PAYLOAD_SECRET` | ✅ | Payload encryption secret (32+ random chars). |
| `NEXT_PUBLIC_SERVER_URL` | ✅ | Public site URL; used for canonical/OG URLs and Payload `serverURL`. |
| `BLOB_READ_WRITE_TOKEN` | ⬜ | Vercel Blob token. If absent, media uploads use the local `/media` folder. |
| `ANTHROPIC_API_KEY` | ⬜ | Claude key; only for on-device content generation via the agent endpoint. |
| `AGENT_API_KEY` | ⬜ | Bearer auth for `/api/agent/post`. |
| `REVALIDATION_SECRET` | ⬜ | Bearer auth for `/api/revalidate`. |
| `CRON_SECRET` | ⬜ | Bearer auth Vercel Cron sends to the agent endpoint. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | ⬜ | AdSense publisher ID. **Not in `.env.example`**; read by the layout with a hardcoded fallback. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⬜ | GA4 measurement ID. Same — read by the layout with a hardcoded fallback. |

---

## App Router structure (`app/`)

Two route groups own two apps in one Next project:

- **`(frontend)`** — the public site. Because there is **no `app/layout.tsx`**, [app/(frontend)/layout.tsx](app/(frontend)/layout.tsx) is the de-facto root layout: it renders `<html>`/`<body>`, loads fonts and the AdSense/GA scripts, applies the theme to `#crg-root`, and wraps everything in the header + footer.
- **`(payload)`** — the CMS. Admin UI at `/admin` ([app/(payload)/admin/[[...segments]]/page.tsx](app/(payload)/admin/[[...segments]]/page.tsx)) and the Payload REST/GraphQL API at `/api/[...slug]`.

### Frontend routes

| Route | File | Renders / data |
| --- | --- | --- |
| `/` | [app/(frontend)/page.tsx](app/(frontend)/page.tsx) | `BroadsheetHome`; `getPublishedPosts(20)`. |
| `/blog` | [app/(frontend)/blog/page.tsx](app/(frontend)/blog/page.tsx) | Paginated river; `getPublishedPosts(12, page)`. |
| `/blog/[slug]` | [app/(frontend)/blog/[slug]/page.tsx](app/(frontend)/blog/[slug]/page.tsx) | `ArticleView`; post + related + trending. |
| `/category/[slug]` | [app/(frontend)/category/[slug]/page.tsx](app/(frontend)/category/[slug]/page.tsx) | `CategoryView`; `getPostsByCategory`. |
| `/[...slug]` | [app/(frontend)/[...slug]/page.tsx](app/(frontend)/[...slug]/page.tsx) | **Catch-all.** Renders a flat Page for single-segment slugs; any unmatched path falls through to `notFound()`. |
| 404 | [app/(frontend)/not-found.tsx](app/(frontend)/not-found.tsx) | Branded 404 (`NotFoundView`) with recovery nav + 6 latest posts; `noindex`. |
| `/dev/components` | [app/(frontend)/dev/components/page.tsx](app/(frontend)/dev/components/page.tsx) | Component preview/gallery. |

Pages use ISR (`export const revalidate = 3600`).

### SEO + API routes

- **[app/sitemap.ts](app/sitemap.ts)** — dynamic `sitemap.xml` (home, `/blog`, all post + page slugs); revalidates hourly.
- **[app/robots.ts](app/robots.ts)** — allows all, disallows `/admin/` and `/api/`.
- **`POST /api/newsletter`** ([route](app/api/newsletter/route.ts)) — stub; logs the email. Wire to an ESP here.
- **`GET /api/search`** ([route](app/api/search/route.ts)) — `?q=`; title/excerpt search; powers `SearchOverlay`.
- **`POST /api/revalidate`** ([route](app/api/revalidate/route.ts)) — Bearer `REVALIDATION_SECRET`; on-demand ISR.
- **`/api/agent/post`** ([route](app/api/agent/post/route.ts)) — Bearer `AGENT_API_KEY`/`CRON_SECRET`; creates posts (HTML→Lexical via [lib/lexical.ts](lib/lexical.ts)) and publishes scheduled posts. Driven by the Vercel cron.

---

## Components (`components/`)

- **`layout/`** — [Footer.tsx](components/layout/Footer.tsx), [broadsheet/Header.tsx](components/layout/broadsheet/Header.tsx), [broadsheet/HomePage.tsx](components/layout/broadsheet/HomePage.tsx).
- **`ui/`** — building blocks: [Container](components/ui/Container.tsx), [Kicker](components/ui/Kicker.tsx), [PostImage](components/ui/PostImage.tsx), [Newsletter](components/ui/Newsletter.tsx), [SearchOverlay](components/ui/SearchOverlay.tsx), [ShareRow](components/ui/ShareRow.tsx), [AdSlot](components/ui/AdSlot.tsx) (placeholder), and the four live ad units — [SidebarAd](components/ui/SidebarAd.tsx), [InContentAd](components/ui/InContentAd.tsx), [AfterContentAd](components/ui/AfterContentAd.tsx), [RelatedAd](components/ui/RelatedAd.tsx).
- **`views/`** — page bodies: [ArticleView](components/views/ArticleView.tsx), [CategoryView](components/views/CategoryView.tsx), [PageBlocks](components/views/PageBlocks.tsx), [NotFoundView](components/views/NotFoundView.tsx).

## Data + theming helpers (`lib/`)

- **[lib/payload.ts](lib/payload.ts)** — `getPayloadClient()`.
- **[lib/posts.ts](lib/posts.ts)** — `getPublishedPosts`, `getPostBySlug`, `getPostsByCategory`, `getRelatedPosts`, `searchPosts`, `getAllPostSlugs`, `getAllPageSlugs`, `getPageBySlug`, plus `getFeaturedImageUrl` / `getPostExcerpt`.
- **[lib/settings.ts](lib/settings.ts)** — `getSettings`, `getNavItems`, `getFooterNav`.
- **[lib/utils.ts](lib/utils.ts)** — `getServerURL`, `getThemeStyle`, `FONT_PAIRS`, `DENSITY`, `DEFAULT_NAV`, `getPrimaryCategoryName`, `formatDate`, `estimateReadMins`.
- **[lib/seo.ts](lib/seo.ts)** — `buildMetadata`, `postMetadata`, `pageMetadata`.
- **[lib/categories.ts](lib/categories.ts)** — section list + keyword rules for auto-categorization.

---

## Payload data model

Config: [payload.config.ts](payload.config.ts) — Postgres adapter, Lexical editor, `sharp`, Vercel Blob storage **only when `BLOB_READ_WRITE_TOKEN` is set**, types emitted to `payload-types.ts`, admin title suffix "- CRG Admin".

### Collections ([payload/collections/](payload/collections/))

- **Users** — roles `admin` / `editor`; API-key auth; first user is auto-promoted to admin. Access helpers in [payload/access/index.ts](payload/access/index.ts) (`isAdmin`, `isAdminOrEditor`, `isLoggedIn`, `isPublishedOrLoggedIn`).
- **Posts** — `title`, `slug`, Lexical `content`, `excerpt`, `featuredImage`→media, `categories`/`tags` relations, `author`, `status` (draft/published/scheduled), `publishedAt`/`scheduledFor`, `aiGenerated`, `wpId`, and an `seo` group (`metaTitle`/`metaDescription`). `afterChange`/`afterDelete` hooks revalidate `/`, `/blog`, `/blog/{slug}`, `/sitemap.xml`.
- **Pages** — `title`, `slug`, `status`, and a `layout` **blocks** field: `hero`, `richText`, `newsletter`, `adSlot`. Hooks revalidate `/{slug}` + `/sitemap.xml`.
- **Categories** and **Tags** — `name`, `slug` (+ `description` on categories); public read.
- **Media** — uploads with required `alt`; Vercel Blob or local `/media`.

### Global: Settings ([payload/globals/Settings.ts](payload/globals/Settings.ts))

The white-label control panel — tabbed: **General** (siteName, siteUrl, siteDescription, tagline, mark, markAccentIndex, footerAccentWord), **Theme** (layoutDirection, fontPair, accentColor, readSize, density), **Navigation** (headerNav, footerNav arrays), **Social & SEO** (socialLinks, defaultMetaTitle/Description, adSenseClientId), **Tracking** (headCode, bodyCode raw-HTML injection). `afterChange` revalidates the layout so changes propagate without a redeploy.

---

## Theming / white-label system

This is the heart of duplication. Two layers:

1. **Static palette + defaults** live in `:root` of [app/globals.css](app/globals.css): `--navy`, `--navy-2`, `--red`, `--ink`, `--muted`, `--paper`/`--paper-2`/`--paper-3`, `--rule`/`--rule-strong`, default fonts, `--read: 19px`, `--gap: 1`. A `.dark` block defines a dark palette (not yet exposed in Settings).
2. **Per-site overrides** come from Settings → [`getThemeStyle()`](lib/utils.ts) → an inline `style` on `#crg-root` in the layout, setting `--accent` (accentColor), `--read` (readSize px), `--gap` (density: compact 0.72 / regular 1 / comfy 1.32), and `--font-head|sub|body|ui` (from `FONT_PAIRS[fontPair]`).

Every component styles itself with these variables (Tailwind tokens like `text-accent`, `font-head`, or `calc(...* var(--gap))`). **Change Settings → the whole site re-themes on the next render**, no code change. Class-name conventions: `bs-*` = Broadsheet layout primitives (masthead, nav, lead, river, widgets); `crg-*` = CRG UI (article, footer, ads, search, category headers). Fonts: Libre Caslon Display (headlines), Source Serif 4 (body), Libre Franklin (UI) — loaded in the layout via `next/font/google`.

---

## Rendering & caching

Static-first with ISR: pages set `revalidate = 3600`. Content edits in Payload trigger `revalidatePath` via collection hooks ([payload/hooks/](payload/hooks/): `revalidatePost`, `revalidatePage`, `revalidateSettings`). External systems can force revalidation via `POST /api/revalidate`. Schema changes are tracked as TypeScript migrations in [migrations/](migrations/) and applied by `payload migrate` at the start of every `build`.
