

**PRODUCT REQUIREMENTS DOCUMENT**

**WordPress to Modern Stack Migration**

Next.js · Payload CMS · Vercel · AI Content Agent

Version 1.0  ·  June 2026

| Status | Ready for Engineering |
| :---- | :---- |
| **Author** | Product Owner |
| **Reviewers** | Engineering Lead, Design Lead |
| **Target Stack** | Next.js 14+, Payload CMS 3, PostgreSQL, Vercel |
| **Deployment** | GitHub → Vercel (CI/CD) |
| **Est. Build Time** | 6–8 weeks (solo dev with Claude Code) |

# **1\. Overview & Goals**

This document defines the requirements for migrating an existing WordPress website to a fully custom, self-hosted modern web stack. The new platform uses Next.js for the frontend, Payload CMS as the headless backend, PostgreSQL for data storage, and Vercel for hosting via GitHub CI/CD. A key requirement is the ability for an AI agent to publish content automatically on a daily schedule through the CMS API.

## **1.1 Primary Goals**

* Replace WordPress with a modern, performant stack the team fully controls

* Preserve all existing content (posts, pages, media, taxonomy) during migration

* Implement a Claude Design-based front-end with no dependency on WP themes

* Provide a WordPress-like admin panel (Payload CMS) for human editors

* Enable an AI/automation agent to post new content daily via REST API

* Deploy via GitHub push to Vercel with zero-downtime deployments

## **1.2 Out of Scope**

* Multi-site management (single site only for this phase)

* E-commerce / WooCommerce functionality

* Migration of WordPress plugins (replace with custom code or npm packages)

* Native mobile apps

# **2\. Tech Stack**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| Frontend | Next.js 14+ (App Router) | React framework, SSR/SSG, routing |
| Styling | Tailwind CSS | Utility-first CSS from Claude Design |
| CMS / Backend | Payload CMS 3.x | Headless CMS, admin UI, REST \+ GraphQL API |
| Database | PostgreSQL (Neon or Supabase) | Serverless-compatible, free tier available |
| ORM | Payload built-in (Drizzle) | Schema migrations, query layer |
| Auth | Payload built-in auth | Admin users, editor roles, API keys |
| Media Storage | Vercel Blob or Cloudinary | Image uploads, CDN delivery |
| Hosting | Vercel | Serverless, edge network, preview deploys |
| CI/CD | GitHub → Vercel | Auto-deploy on push to main |
| AI Agent | Cron \+ Anthropic API / n8n | Scheduled daily content posting |
| Package Manager | pnpm | Monorepo-friendly, fast installs |

# **3\. Repository Structure**

The project lives in a single monorepo. Payload CMS is co-located inside the Next.js app using the recommended local API pattern, so both frontend and backend deploy as one Vercel project.

my-site/

├── app/                        \# Next.js App Router

│   ├── (frontend)/             \# Public-facing pages

│   │   ├── page.tsx             \# Homepage

│   │   ├── blog/\[slug\]/page.tsx \# Blog post template

│   │   └── \[...slug\]/page.tsx   \# Dynamic pages

│   ├── (payload)/              \# Payload admin panel

│   │   └── admin/\[\[...segments\]\]/page.tsx

│   └── api/                    \# API routes

│       ├── \[...slug\]/route.ts   \# Payload REST handler

│       └── agent/post/route.ts  \# AI agent endpoint

├── payload/                    \# Payload CMS config

│   ├── payload.config.ts       \# Main config file

│   ├── collections/            \# Content type definitions

│   │   ├── Posts.ts

│   │   ├── Pages.ts

│   │   ├── Media.ts

│   │   └── Users.ts

│   └── globals/                \# Site settings, nav

│       └── Settings.ts

├── scripts/                    \# Migration \+ utility scripts

│   ├── wp-export-to-json.ts    \# WP XML → JSON converter

│   └── seed-payload.ts         \# JSON → Payload import

├── agent/                      \# AI content agent

│   ├── index.ts                \# Cron entry point

│   └── poster.ts               \# Payload API posting logic

├── public/                     \# Static assets

├── .env.local                  \# Local secrets

├── .env.example                \# Documented env vars

├── payload.config.ts           \# (re-export for Next.js)

├── next.config.ts

├── tailwind.config.ts

└── package.json

# **4\. Payload CMS Content Model**

The following collections mirror the WordPress content model while adding the fields needed for AI-generated content attribution and scheduling.

## **4.1 Posts Collection**

| Field | Type | Notes |
| :---- | :---- | :---- |
| title | text (required) | Post headline |
| slug | text (auto) | URL-safe, generated from title |
| content | richText (Lexical) | Body content, supports blocks |
| excerpt | textarea | Short summary for cards / SEO |
| featuredImage | upload (Media) | Hero image relationship |
| categories | relationship (many) | Post taxonomy |
| tags | relationship (many) | Post tags |
| author | relationship (Users) | Human or AI agent user |
| status | select | draft | published | scheduled |
| publishedAt | date | Publish timestamp, used for ordering |
| scheduledFor | date | Future publish date (agent use) |
| aiGenerated | checkbox | Flag for AI-authored content |
| seo.metaTitle | text | Override for SEO title |
| seo.metaDescription | textarea | Override for SEO description |
| wpId | number | Original WP post ID for migration reference |

## **4.2 Pages Collection**

Matches Posts with slug-based routing. Includes a layout field (array of content blocks) to support flexible page layouts from the Claude Design system.

## **4.3 Media Collection**

Payload built-in upload collection. Configure with Vercel Blob (or Cloudinary) as the storage adapter. Import all WordPress media files during migration.

## **4.4 Categories & Tags Collections**

Simple name \+ slug collections. Pre-populate from WordPress taxonomy during migration.

## **4.5 Users Collection**

Payload built-in auth. Create two user roles:

* admin — full access to all collections and settings

* editor — create/edit/publish Posts and Pages, no access to Users or system settings

Create a dedicated service user for the AI agent (role: editor) and generate an API key for it. The agent never uses password auth.

## **4.6 Site Settings Global**

Payload Global (singleton) for site-wide settings:

* siteName, siteUrl, siteDescription

* Navigation menus (header, footer) as relationship arrays

* Social links

* Default SEO fallbacks

# **5\. Frontend Requirements**

## **5.1 Design Implementation**

The visual design is provided as a Claude Design mockup. The frontend developer (Claude Code) must:

1. Convert all Claude Design components to React/Tailwind components in the Next.js App Router structure

2. Match the mockup exactly: typography, spacing, color palette, hover states

3. Implement the design system as a /components/ui/ library (Button, Card, Badge, Nav, Footer, etc.)

4. All components must be dark mode compatible using Tailwind dark: variants

## **5.2 Page Routes**

| Route | File | Data Source |
| :---- | :---- | :---- |
| / | app/(frontend)/page.tsx | Payload: latest posts \+ site settings |
| /blog | app/(frontend)/blog/page.tsx | Payload: paginated posts list |
| /blog/\[slug\] | app/(frontend)/blog/\[slug\]/page.tsx | Payload: single post by slug |
| /\[slug\] | app/(frontend)/\[slug\]/page.tsx | Payload: page by slug |
| /category/\[slug\] | app/(frontend)/category/\[slug\]/page.tsx | Payload: posts filtered by category |
| /admin/\* | Payload admin panel | Built-in, auth-gated |

## **5.3 Data Fetching Strategy**

* Use Payload Local API (no HTTP) inside Next.js server components for fast, type-safe data access

* Use generateStaticParams for blog posts and pages (ISR with revalidate: 3600\)

* Revalidate on-demand via Payload afterChange hook → next.revalidatePath()

* Client components only where interactivity is required (search, mobile nav)

## **5.4 SEO Requirements**

* generateMetadata function on every page using post/page SEO fields

* Fallback to site-level defaults from Settings global

* OpenGraph and Twitter card tags on all pages

* robots.txt and sitemap.xml generated dynamically from Payload data

* Canonical URLs on all pages

## **5.5 Performance Targets**

* Lighthouse Performance score ≥ 90 on mobile

* Core Web Vitals: LCP \< 2.5s, CLS \< 0.1, FID \< 100ms

* All images served via next/image with proper sizing and lazy loading

* No render-blocking scripts

# **6\. AI Content Agent**

## **6.1 Architecture**

The agent is a TypeScript module that runs on a daily cron schedule. It generates content (or receives pre-written content from an external flow), then posts it to Payload CMS via the REST API using a service account API key.

| Implementation note The agent can be triggered two ways: (1) Vercel Cron Jobs (built-in, zero infrastructure) or (2) an external orchestrator like n8n, Make, or a GitHub Actions cron. Option 1 is recommended to start. Use option 2 if the content generation pipeline becomes complex. |
| :---- |

## **6.2 Agent API Endpoint**

Create a protected Next.js API route that the agent calls to create posts:

POST /api/agent/post

Authorization: Bearer \<AGENT\_API\_KEY\>

Content-Type: application/json

{

  "title": "string (required)",

  "content": "string (Lexical JSON or plain HTML)",

  "excerpt": "string",

  "categories": \["slug-1", "slug-2"\],

  "tags": \["tag-1"\],

  "featuredImageUrl": "https://... (optional, auto-imported)",

  "status": "published" | "draft",

  "publishedAt": "ISO 8601 datetime (optional, defaults to now)"

}

## **6.3 Agent Authentication**

* The agent authenticates with a Payload API key (not username/password)

* Store the key in Vercel environment variable: AGENT\_API\_KEY

* The API route validates the Bearer token before processing

* The agent user has the editor role — it cannot delete posts or modify users

## **6.4 Content Generation Options**

The agent endpoint is agnostic about how content is generated. Three supported flows:

| Flow | Description | When to Use |
| :---- | :---- | :---- |
| On-device generation | Agent calls Claude API, generates post, POSTs to /api/agent/post | Simple use cases, single topic |
| External pipeline | n8n / Make generates content and hits the endpoint via webhook | Complex multi-step workflows |
| Pre-written queue | Admin queues posts in Payload with status=scheduled, cron publishes at scheduledFor time | Editorial calendar control |

## **6.5 Vercel Cron Configuration**

Add to vercel.json to trigger the agent daily at 8am UTC:

{

  "crons": \[{

    "path": "/api/agent/post",

    "schedule": "0 8 \* \* \*"

  }\]

}

# **7\. WordPress Migration**

## **7.1 Export Steps**

5. In WordPress admin: Tools → Export → All Content → download .xml (WXR format)

6. Export media library: use WP CLI (wp media export) or download via FTP/cPanel

7. Note all category and tag slugs for mapping

## **7.2 Migration Script (scripts/wp-export-to-json.ts)**

Build a Node.js script that parses the WXR XML and outputs Payload-compatible JSON:

* Parse \<item\> elements with post\_type \= post and page

* Map WP post fields to Payload Posts collection fields (see field mapping table below)

* Convert post\_content (HTML) to Payload Lexical JSON using a HTML-to-Lexical converter

* Download all attachment URLs to /public/wp-media/ for Payload import

* Output: posts.json, pages.json, categories.json, tags.json, media-manifest.json

## **7.3 Field Mapping**

| WordPress Field | Payload Field | Notes |
| :---- | :---- | :---- |
| post\_title | title | Direct map |
| post\_name | slug | Direct map |
| post\_content | content | HTML → Lexical JSON conversion |
| post\_excerpt | excerpt | Direct map |
| post\_date | publishedAt | Parse to ISO 8601 |
| post\_status | status | publish → published, draft → draft |
| \_thumbnail\_id | featuredImage | Resolve to Payload Media ID post-import |
| category | categories | Create Categories, then relationship |
| tag | tags | Create Tags, then relationship |
| post\_author | author | Map to admin user |
| ID | wpId | Store for debugging / redirect mapping |

## **7.4 Import Script (scripts/seed-payload.ts)**

8. Connect to Payload using the local API (no HTTP)

9. Import Media first (upload files, store returned IDs)

10. Import Categories and Tags

11. Import Pages

12. Import Posts (resolve featuredImage and taxonomy relationships using stored IDs)

13. Verify counts: console.log totals for each collection

## **7.5 URL Redirects**

WordPress typically uses /year/month/slug/ or just /slug/ URL structures. Ensure 301 redirects are set in next.config.ts for any URL structure changes to preserve SEO:

// next.config.ts

async redirects() {

  return \[

    { source: "/:year/:month/:slug", destination: "/blog/:slug", permanent: true }

  \]

}

# **8\. Environment Variables**

All secrets must be set in both .env.local (local dev) and Vercel project settings (production).

| Variable | Required | Description |
| :---- | :---- | :---- |
| DATABASE\_URI | Yes | Postgres connection string (Neon/Supabase) |
| PAYLOAD\_SECRET | Yes | Random 32+ char string, encrypts sessions |
| NEXT\_PUBLIC\_SERVER\_URL | Yes | Full URL of the deployed site |
| AGENT\_API\_KEY | Yes | Secret key for AI agent endpoint auth |
| BLOB\_READ\_WRITE\_TOKEN | If using Vercel Blob | Vercel Blob storage token |
| CLOUDINARY\_URL | If using Cloudinary | Alternative media storage |
| ANTHROPIC\_API\_KEY | If agent generates content | Claude API key for content generation |
| REVALIDATION\_SECRET | Yes | Shared secret for on-demand ISR revalidation |

# **9\. Deployment & CI/CD**

## **9.1 GitHub Repository Setup**

14. Create a new private GitHub repository

15. Initialize with the project scaffold (see Section 3\)

16. Create branches: main (production), develop (staging), feature/\* (features)

17. Configure branch protection on main: require PR \+ passing checks

## **9.2 Vercel Project Setup**

18. Connect Vercel to the GitHub repository

19. Set root directory to / (monorepo root)

20. Build command: pnpm build

21. Output directory: .next

22. Add all environment variables from Section 8

23. Configure custom domain and add DNS records

24. Enable Vercel Cron Jobs (Pro plan required for custom schedules)

## **9.3 Database Setup**

25. Create a Neon or Supabase project

26. Copy the connection string to DATABASE\_URI

27. Run pnpm payload migrate on first deploy (Payload auto-creates schema)

28. Enable connection pooling for serverless (Neon does this by default)

| Important: serverless DB connections Vercel serverless functions have cold starts. Use Neon's built-in connection pooling or PgBouncer with Supabase. Set connection pool size to 1–5 per function to avoid exhausting connections. |
| :---- |

## **9.4 Deployment Checklist**

* Environment variables set in Vercel

* DATABASE\_URI points to production database

* Run migration script (seed-payload.ts) to import WordPress content

* Verify post and page counts in Payload admin

* Test all page routes render correctly

* Test agent endpoint with a manual POST request

* Verify Vercel Cron is scheduled and shows next run time

* Configure custom domain in Vercel

* Update DNS to point to Vercel

* Verify SSL certificate is active

* Test 301 redirects from old WordPress URLs

* Run Lighthouse audit on homepage and a blog post

# **10\. Build Phases for Claude Code**

Hand these phases to Claude Code in order. Complete and verify each phase before starting the next.

| \# | Phase | Deliverables | Est. |
| :---- | :---- | :---- | :---- |
| 1 | Project scaffold | Next.js \+ Payload CMS installed, repo initialized, env vars wired, local dev running | 2h |
| 2 | Payload collections | All collections defined (Posts, Pages, Media, Categories, Tags, Users, Settings) | 3h |
| 3 | Frontend shell | Layout, Nav, Footer components from Claude Design; homepage and blog list page | 1 day |
| 4 | Blog post template | Single post page, rich text rendering, SEO metadata, featured image | 4h |
| 5 | Dynamic pages | Page collection rendering, flexible content blocks, \[...slug\] route | 4h |
| 6 | WordPress migration | Export parser, field mapping script, import script, media upload | 1 day |
| 7 | AI agent endpoint | POST /api/agent/post, auth, Payload write, test with curl | 3h |
| 8 | Cron setup | vercel.json cron, agent daily flow, environment tested end-to-end | 2h |
| 9 | SEO & sitemap | generateMetadata, robots.txt, sitemap.xml, OG tags | 2h |
| 10 | Deploy & DNS | Vercel deploy, custom domain, SSL, redirect rules, final QA | 3h |

# **11\. Acceptance Criteria**

## **Content & Migration**

* All WordPress posts and pages are accessible at their correct URLs

* All media renders correctly (images, attachments)

* Categories and tags are preserved and functional

* 301 redirects work for any changed URL patterns

## **Admin Panel**

* Admin user can log in to /admin

* Editor can create, edit, and publish posts without accessing system settings

* Media uploads work and images appear in posts

* Rich text editor renders content correctly on the frontend

## **AI Agent**

* POST /api/agent/post with a valid API key creates a published post

* POST with an invalid key returns 401

* A post created by the agent appears on the frontend within 60 seconds (ISR revalidation)

* Vercel Cron shows a successful run in the deployment logs

## **Frontend**

* Homepage, blog list, single post, and static pages all render without errors

* Design matches Claude Design mockup on desktop and mobile

* Lighthouse Performance ≥ 90 on mobile for homepage and a blog post

* All pages have correct meta titles, descriptions, and OG tags

* Sitemap returns all published posts and pages

## **Deployment**

* git push to main triggers an automatic Vercel deployment

* Preview deployments are created for PRs

* Custom domain resolves with valid SSL

# **Appendix A: Useful Commands**

\# Install dependencies

pnpm install

\# Run local dev (Next.js \+ Payload together)

pnpm dev

\# Run WordPress export converter

pnpm tsx scripts/wp-export-to-json.ts ./wordpress-export.xml

\# Seed Payload with converted content

pnpm tsx scripts/seed-payload.ts

\# Test the agent endpoint locally

curl \-X POST http://localhost:3000/api/agent/post \\

  \-H "Authorization: Bearer $AGENT\_API\_KEY" \\

  \-H "Content-Type: application/json" \\

  \-d '{"title":"Test Post","content":"\<p\>Hello\</p\>","status":"published"}'

\# Generate production build

pnpm build

# **Appendix B: Key Dependencies**

| Package | Version | Purpose |
| :---- | :---- | :---- |
| next | ^14.x | React framework |
| payload | ^3.x | Headless CMS |
| @payloadcms/db-postgres | ^3.x | Postgres adapter for Payload |
| @payloadcms/richtext-lexical | ^3.x | Rich text editor |
| @payloadcms/storage-vercel-blob | ^3.x | Media storage |
| tailwindcss | ^3.x | Utility CSS |
| fast-xml-parser | ^4.x | WXR / XML parsing for migration |
| @anthropic-ai/sdk | ^0.x | Claude API for agent content generation |

End of Document · PRD v1.0 · June 2026