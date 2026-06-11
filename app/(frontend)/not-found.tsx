import type { Metadata } from 'next'
import type { Post } from '@/payload-types'
import { NotFoundView } from '@/components/views/NotFoundView'
import { getPublishedPosts } from '@/lib/posts'
import { buildMetadata } from '@/lib/seo'

// noindex so search engines don't index the 404 (it already returns a 404
// status); follow lets crawlers still traverse the recovery links.
export const metadata: Metadata = {
  ...buildMetadata({ title: 'Page Not Found' }),
  robots: { index: false, follow: true },
}

// Renders inside app/(frontend)/layout.tsx, so it inherits the header, footer,
// fonts and AdSense Auto Ads loader. Catches notFound() thrown by any page in
// the (frontend) group (missing posts, pages, categories, unknown slugs).
export default async function NotFound() {
  let posts: Post[] = []
  try {
    const { docs } = await getPublishedPosts(6)
    posts = docs
  } catch {
    // DB unavailable (e.g. during build) — render the 404 without the grid.
  }

  return <NotFoundView posts={posts} />
}
