#!/usr/bin/env tsx
/**
 * Parse WordPress WXR export → Payload-compatible JSON files.
 * Usage: pnpm wp-export ./wordpress-export.xml
 */
import fs from 'fs'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: pnpm wp-export <path-to-wordpress-export.xml>')
  process.exit(1)
}

const xml = fs.readFileSync(inputPath, 'utf-8')
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) =>
    ['item', 'category', 'wp:postmeta', 'wp:comment', 'wp:tag'].includes(name),
})

const parsed = parser.parse(xml)
const channel = parsed?.rss?.channel
const items = channel?.item || []

type WpItem = Record<string, unknown>

function text(val: unknown): string {
  if (val == null) return ''
  if (typeof val === 'object' && val !== null && '#text' in val) {
    return String((val as { '#text': string })['#text'])
  }
  return String(val)
}

function getMeta(item: WpItem, key: string): string {
  const metas = (item['wp:postmeta'] as WpItem[]) || []
  for (const meta of metas) {
    if (text(meta['wp:meta_key']) === key) return text(meta['wp:meta_value'])
  }
  return ''
}

const posts: unknown[] = []
const pages: unknown[] = []
const categoriesMap = new Map<string, { name: string; slug: string }>()
const tagsMap = new Map<string, { name: string; slug: string }>()
const mediaManifest: unknown[] = []

for (const raw of items as WpItem[]) {
  const postType = text(raw['wp:post_type'])
  const status = text(raw['wp:status'])
  const title = text(raw.title)
  const slug = text(raw['wp:post_name']) || title.toLowerCase().replace(/\s+/g, '-')
  const content = text(raw['content:encoded'])
  const excerpt = text(raw['excerpt:encoded'])
  const publishedAt = text(raw['wp:post_date_gmt']) || text(raw['wp:post_date'])
  const wpId = Number(text(raw['wp:post_id']))
  const author = text(raw['dc:creator'])

  const itemCategories: string[] = []
  const itemTags: string[] = []

  const cats = raw.category
  const catList = Array.isArray(cats) ? cats : cats ? [cats] : []

  for (const cat of catList) {
    const domain = typeof cat === 'object' && cat !== null && '@_domain' in cat
      ? String((cat as { '@_domain': string })['@_domain'])
      : ''
    const name = text(cat)
    const nicename =
      typeof cat === 'object' && cat !== null && '@_nicename' in cat
        ? String((cat as { '@_nicename': string })['@_nicename'])
        : name.toLowerCase().replace(/\s+/g, '-')

    if (domain === 'category') {
      categoriesMap.set(nicename, { name, slug: nicename })
      itemCategories.push(nicename)
    } else if (domain === 'post_tag') {
      tagsMap.set(nicename, { name, slug: nicename })
      itemTags.push(nicename)
    }
  }

  if (postType === 'attachment') {
    const url = text(raw['wp:attachment_url']) || text(raw.link)
    mediaManifest.push({
      wpId,
      title,
      url,
      slug,
    })
    continue
  }

  if (postType === 'post') {
    posts.push({
      title,
      slug,
      content,
      excerpt,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      status: status === 'publish' ? 'published' : 'draft',
      wpId,
      author,
      categories: itemCategories,
      tags: itemTags,
      featuredImageWpId: getMeta(raw, '_thumbnail_id') || null,
    })
  }

  if (postType === 'page') {
    pages.push({
      title,
      slug,
      content,
      status: status === 'publish' ? 'published' : 'draft',
      wpId,
    })
  }
}

const outDir = path.resolve('migration-data')
fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(posts, null, 2))
fs.writeFileSync(path.join(outDir, 'pages.json'), JSON.stringify(pages, null, 2))
fs.writeFileSync(
  path.join(outDir, 'categories.json'),
  JSON.stringify([...categoriesMap.values()], null, 2),
)
fs.writeFileSync(path.join(outDir, 'tags.json'), JSON.stringify([...tagsMap.values()], null, 2))
fs.writeFileSync(
  path.join(outDir, 'media-manifest.json'),
  JSON.stringify(mediaManifest, null, 2),
)

// WordPress posts lived at /{slug}; new site uses /blog/{slug}
const reservedSlugs = new Set([
  'blog',
  'category',
  'admin',
  'api',
  'dev',
  'sitemap.xml',
  'robots.txt',
])
const wpRedirects = posts
  .filter((p) => typeof (p as { slug?: string }).slug === 'string')
  .filter((p) => !reservedSlugs.has((p as { slug: string }).slug))
  .map((p) => ({
    source: `/${(p as { slug: string }).slug}`,
    destination: `/blog/${(p as { slug: string }).slug}`,
    permanent: true,
  }))

const redirectsPath = path.resolve('lib/wp-redirects.json')
fs.writeFileSync(redirectsPath, JSON.stringify(wpRedirects, null, 2))

console.log('Export complete → migration-data/')
console.log(`  posts: ${posts.length}`)
console.log(`  pages: ${pages.length}`)
console.log(`  categories: ${categoriesMap.size}`)
console.log(`  tags: ${tagsMap.size}`)
console.log(`  media: ${mediaManifest.length}`)
console.log(`  redirects: ${wpRedirects.length} → lib/wp-redirects.json`)
