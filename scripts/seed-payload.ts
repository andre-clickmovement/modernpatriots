#!/usr/bin/env tsx
/**
 * Import migration-data JSON into Payload CMS.
 * Usage: pnpm seed
 */
import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '../lib/payload'
import { SECTION_CATEGORIES } from '../lib/categories'
import { htmlToLexical } from '../lib/lexical'

const dataDir = path.resolve('migration-data')

function readJson<T>(filename: string): T {
  const file = path.join(dataDir, filename)
  if (!fs.existsSync(file)) {
    console.warn(`Skipping ${filename} — file not found`)
    return [] as T
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
}

type CategoryJson = { name: string; slug: string }
type TagJson = { name: string; slug: string }
type MediaJson = { wpId: number; title: string; url: string; slug: string }
type PostJson = {
  title: string
  slug: string
  content: string
  excerpt?: string
  publishedAt?: string
  status: 'published' | 'draft'
  wpId: number
  author?: string
  categories?: string[]
  tags?: string[]
  featuredImageWpId?: string | null
}
type PageJson = {
  title: string
  slug: string
  content: string
  status: 'published' | 'draft'
  wpId: number
}

async function downloadMedia(url: string, wpId: number): Promise<{ buffer: Buffer; mimetype: string; name: string }> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  const mimetype = response.headers.get(`content-type`) || `application/octet-stream`
  const urlName = decodeURIComponent((url.split(`/`).pop() || ``).split(`?`)[0].split(`#`)[0])
  const extMatch = urlName.match(/\.([a-zA-Z0-9]{2,5})$/)
  const ext = extMatch ? extMatch[1] : (mimetype.split(`/`)[1]?.split(`;`)[0]?.replace(`jpeg`, `jpg`) || `jpg`)
  const name = `media-${wpId}.${ext}`
  return { buffer, mimetype, name }
}

async function main() {
  if (!fs.existsSync(dataDir)) {
    console.error('migration-data/ not found. Run pnpm wp-export first.')
    process.exit(1)
  }

  const payload = await getPayloadClient()

  const categoryIdBySlug = new Map<string, number>()
  const tagIdBySlug = new Map<string, number>()
  const mediaIdByWpId = new Map<number, number>()

  // Ensure default admin exists for author fallback
  let adminUser = (await payload.find({ collection: 'users', limit: 1 })).docs[0]

  // Categories
  const categories = readJson<CategoryJson[]>('categories.json')
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      categoryIdBySlug.set(cat.slug, existing.docs[0].id)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: { name: cat.name, slug: cat.slug },
      context: { disableRevalidate: true },
    })
    categoryIdBySlug.set(cat.slug, created.id)
  }


  // Ensure all nav section categories exist (WP export may only include news/featured)
  for (const section of SECTION_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: section.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      categoryIdBySlug.set(section.slug, existing.docs[0].id)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: {
        name: section.name,
        slug: section.slug,
        description: section.description,
      },
      context: { disableRevalidate: true },
    })
    categoryIdBySlug.set(section.slug, created.id)
  }

  // Tags
  const tags = readJson<TagJson[]>('tags.json')
  for (const tag of tags) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      tagIdBySlug.set(tag.slug, existing.docs[0].id)
      continue
    }
    const created = await payload.create({
      collection: 'tags',
      data: { name: tag.name, slug: tag.slug },
      context: { disableRevalidate: true },
    })
    tagIdBySlug.set(tag.slug, created.id)
  }

// Media (parallel + resumable)
  const mediaItems = readJson<MediaJson[]>('media-manifest.json').filter((m) => m.url)
  const MEDIA_CONCURRENCY = 8
  let mediaDone = 0
  async function importMedia(item: MediaJson) {
    const existing = await payload.find({
      collection: 'media',
      where: { wpId: { equals: item.wpId } },
      limit: 1,
    })
    if (existing.docs[0]) {
      mediaIdByWpId.set(item.wpId, existing.docs[0].id)
    } else {
      try {
        const { buffer, mimetype, name } = await downloadMedia(item.url, item.wpId)
        const created = await payload.create({
          collection: 'media',
          data: { alt: item.title || name, wpId: item.wpId },
          file: { data: buffer, mimetype, name, size: buffer.length },
          context: { disableRevalidate: true },
        })
        mediaIdByWpId.set(item.wpId, created.id)
      } catch (err) {
        console.warn(`Media skip wpId=${item.wpId}:`, err instanceof Error ? err.message : err)
      }
    }
    mediaDone++
    if (mediaDone % 25 === 0) console.log(`  media: ${mediaDone}/${mediaItems.length}`)
  }
  for (let i = 0; i < mediaItems.length; i += MEDIA_CONCURRENCY) {
    await Promise.all(mediaItems.slice(i, i + MEDIA_CONCURRENCY).map(importMedia))
  }
  console.log(`  media complete: ${mediaDone}/${mediaItems.length}`)

  // Pages
  const pages = readJson<PageJson[]>('pages.json')
  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { wpId: { equals: page.wpId } },
      limit: 1,
    })
    if (existing.docs[0]) continue

    const lexical = await htmlToLexical(page.content || '<p></p>')

    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        status: page.status,
        wpId: page.wpId,
        layout: [{ blockType: 'richText', content: lexical }],
      },
      context: { disableRevalidate: true },
    })
  }

  // Posts
  const posts = readJson<PostJson[]>('posts.json')
  for (const post of posts) {
    const existing = await payload.find({
      collection: 'posts',
      where: { wpId: { equals: post.wpId } },
      limit: 1,
    })
    if (existing.docs[0]) continue

    const lexical = await htmlToLexical(post.content || '<p></p>')
    const featuredWpId = post.featuredImageWpId ? Number(post.featuredImageWpId) : null

    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        content: lexical,
        excerpt: post.excerpt,
        status: post.status,
        publishedAt: post.publishedAt,
        wpId: post.wpId,
        author: adminUser?.id,
        categories: (post.categories || [])
          .map((s) => categoryIdBySlug.get(s))
          .filter(Boolean) as number[],
        tags: (post.tags || [])
          .map((s) => tagIdBySlug.get(s))
          .filter(Boolean) as number[],
        featuredImage: featuredWpId ? mediaIdByWpId.get(featuredWpId) : undefined,
      },
      context: { disableRevalidate: true },
    })
  }

  const counts = {
    categories: (await payload.find({ collection: 'categories', limit: 0 })).totalDocs,
    tags: (await payload.find({ collection: 'tags', limit: 0 })).totalDocs,
    media: (await payload.find({ collection: 'media', limit: 0 })).totalDocs,
    pages: (await payload.find({ collection: 'pages', limit: 0 })).totalDocs,
    posts: (await payload.find({ collection: 'posts', limit: 0 })).totalDocs,
  }

  console.log('Seed complete:', counts)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
