#!/usr/bin/env tsx
/**
 * Ensure nav categories exist and assign posts by keyword rules.
 * Usage: pnpm recategorize
 */
import type { Payload } from 'payload'
import { SECTION_CATEGORIES, getPostSearchText, matchSectionSlug } from '../lib/categories'
import { getPayloadClient } from '../lib/payload'

async function upsertCategories(payload: Payload) {
  const idBySlug = new Map<string, number>()

  for (const section of SECTION_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: section.slug } },
      limit: 1,
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'categories',
        id: existing.docs[0].id,
        data: {
          name: section.name,
          description: section.description,
        },
        context: { disableRevalidate: true },
      })
      idBySlug.set(section.slug, existing.docs[0].id)
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
    idBySlug.set(section.slug, created.id)
  }

  return idBySlug
}

async function main() {
  const payload = await getPayloadClient()
  const idBySlug = await upsertCategories(payload)
  const slugById = new Map<number, string>()
  for (const [slug, id] of idBySlug.entries()) slugById.set(id, slug)

  const newsId = idBySlug.get('news')
  if (!newsId) throw new Error('News category missing after upsert')

  const posts = await payload.find({
    collection: 'posts',
    limit: 1000,
    depth: 0,
  })

  const counts: Record<string, number> = {
    updated: 0,
    skipped: 0,
    opinion: 0,
    election: 0,
    politics: 0,
    world: 0,
    newsOnly: 0,
  }

  for (const post of posts.docs) {
    const matchedSlug = matchSectionSlug(
      getPostSearchText(post as { title?: string | null; excerpt?: string | null; content?: unknown }),
    )
    const categoryIds = new Set<number>()
    const existingSlugs = new Set<string>()

    categoryIds.add(newsId)

    for (const cat of post.categories || []) {
      const catId = typeof cat === 'object' ? cat.id : cat
      const slug = slugById.get(catId)
      if (slug) {
        existingSlugs.add(slug)
        categoryIds.add(catId)
      }
    }

    if (existingSlugs.has('featured')) {
      const featuredId = idBySlug.get('featured')
      if (featuredId) categoryIds.add(featuredId)
    }

    if (matchedSlug) {
      const sectionId = idBySlug.get(matchedSlug)
      if (sectionId) categoryIds.add(sectionId)
      counts[matchedSlug] = (counts[matchedSlug] || 0) + 1
    } else {
      counts.newsOnly++
    }

    const nextSlugs = new Set(
      [...categoryIds]
        .map((id) => slugById.get(id))
        .filter(Boolean) as string[],
    )

    const addedSection = matchedSlug && !existingSlugs.has(matchedSlug)
    const unchanged =
      nextSlugs.size === existingSlugs.size &&
      [...nextSlugs].every((slug) => existingSlugs.has(slug))

    if (unchanged && !addedSection) {
      counts.skipped++
      continue
    }

    await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        categories: [...categoryIds],
      },
      context: { disableRevalidate: true },
    })
    counts.updated++
  }

  console.log('Recategorize complete:', counts)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
