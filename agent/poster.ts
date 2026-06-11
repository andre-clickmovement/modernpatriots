import type { RequiredDataFromCollectionSlug } from 'payload'
import { getPayloadClient } from '@/lib/payload'

type CreatePostInput = {
  title: string
  content: Record<string, unknown>
  excerpt?: string
  categorySlugs?: string[]
  tagSlugs?: string[]
  featuredImageUrl?: string
  status?: 'published' | 'draft' | 'scheduled'
  publishedAt?: string
  scheduledFor?: string
}

async function resolveSlugs(collection: 'categories' | 'tags', slugs?: string[]) {
  if (!slugs?.length) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection,
    where: { slug: { in: slugs } },
    limit: slugs.length,
  })
  return result.docs.map((doc) => doc.id)
}

async function getAgentUserId() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'users',
    where: { email: { equals: 'agent@mp.local' } },
    limit: 1,
  })
  return result.docs[0]?.id
}

async function importFeaturedImage(url: string, alt: string) {
  const payload = await getPayloadClient()
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${url}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const filename = url.split('/').pop() || 'featured.jpg'

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      mimetype: response.headers.get('content-type') || 'image/jpeg',
      name: filename,
      size: buffer.length,
    },
  })

  return media.id
}

export async function createAgentPost(input: CreatePostInput) {
  const payload = await getPayloadClient()
  const authorId = await getAgentUserId()

  const [categoryIds, tagIds] = await Promise.all([
    resolveSlugs('categories', input.categorySlugs),
    resolveSlugs('tags', input.tagSlugs),
  ])

  let featuredImageId: number | undefined
  if (input.featuredImageUrl) {
    featuredImageId = await importFeaturedImage(input.featuredImageUrl, input.title)
  }

  const post = await payload.create({
    collection: 'posts',
    // `slug` is auto-generated from `title` by slugField at runtime, so it is
    // intentionally omitted here; cast to satisfy the create() data type.
    data: {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      categories: categoryIds,
      tags: tagIds,
      featuredImage: featuredImageId,
      author: authorId,
      status: input.status || 'published',
      publishedAt: input.publishedAt || new Date().toISOString(),
      scheduledFor: input.scheduledFor,
      aiGenerated: true,
    } as RequiredDataFromCollectionSlug<'posts'>,
    context: { disableRevalidate: false },
  })

  return post
}

export async function publishScheduledPosts() {
  const payload = await getPayloadClient()
  const now = new Date().toISOString()

  const scheduled = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'scheduled' },
      scheduledFor: { less_than_equal: now },
    },
    limit: 50,
  })

  let count = 0
  for (const post of scheduled.docs) {
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        status: 'published',
        publishedAt: post.scheduledFor || now,
      },
    })
    count++
  }

  return count
}
