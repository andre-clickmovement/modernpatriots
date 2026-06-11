import type { Page, Post } from '@/payload-types'
import { getPayloadClient } from './payload'

export const POSTS_PER_PAGE = 12

export async function getPublishedPosts(limit = 20, page = 1) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    page,
    depth: 2,
  })
  return { ...result, docs: result.docs as Post[] }
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Post) || null
}

export async function searchPosts(query: string, limit = 10) {
  const payload = await getPayloadClient()

  if (!query.trim()) {
    const result = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      depth: 1,
    })
    return { ...result, docs: result.docs as Post[] }
  }

  const result = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      or: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
      ],
    },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return { ...result, docs: result.docs as Post[] }
}

export async function getPostsByCategory(slug: string, page = 1) {
  const payload = await getPayloadClient()

  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const category = categoryResult.docs[0]
  if (!category) {
    return { docs: [], totalPages: 0, page: 1, totalDocs: 0 }
  }

  const result = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      categories: { contains: category.id },
    },
    sort: '-publishedAt',
    limit: POSTS_PER_PAGE,
    page,
    depth: 2,
  })
  return { ...result, docs: result.docs as Post[] }
}

export async function getRelatedPosts(post: Post, limit = 3) {
  const payload = await getPayloadClient()
  const categoryIds = (post.categories || [])
    .map((c) => (typeof c === 'object' ? c.id : c))
    .filter(Boolean)

  if (!categoryIds.length) {
    const result = await payload.find({
      collection: 'posts',
      where: {
        status: { equals: 'published' },
        id: { not_equals: post.id },
      },
      sort: '-publishedAt',
      limit,
      depth: 1,
    })
    return result.docs as Post[]
  }

  const result = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      id: { not_equals: post.id },
      categories: { in: categoryIds },
    },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return result.docs as Post[]
}

export async function getAllPostSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })
  return result.docs.map((doc) => doc.slug).filter(Boolean) as string[]
}

export async function getAllPageSlugs() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { status: { equals: 'published' } },
    limit: 100,
    depth: 0,
    select: { slug: true },
  })
  return result.docs.map((doc) => doc.slug).filter(Boolean) as string[]
}

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })
  return (result.docs[0] as Page) || null
}

export function getPostExcerpt(post: Post): string {
  return post.excerpt || ''
}

export function getAuthorName(post: Post): string {
  const author = post.author
  if (typeof author === 'object' && author) {
    return author.name || author.email || 'Modern Patriots'
  }
  return 'Modern Patriots'
}

export function getFeaturedImageUrl(post: Post): string | null {
  const img = post.featuredImage
  if (typeof img === 'object' && img?.url) return img.url
  return null
}
