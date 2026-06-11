import { NextResponse } from 'next/server'
import { searchPosts } from '@/lib/posts'
import { getPrimaryCategoryName } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''

  const { docs } = q
    ? await searchPosts(q, 10)
    : await searchPosts('', 5)

  const results = docs.map((post) => ({
    slug: post.slug,
    title: post.title,
    kicker: getPrimaryCategoryName(post.categories),
  }))

  return NextResponse.json({ results })
}
