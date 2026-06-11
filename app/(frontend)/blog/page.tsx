import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { PostImage } from '@/components/ui/PostImage'
import { getPublishedPosts, getFeaturedImageUrl, getPostExcerpt } from '@/lib/posts'
import { getPrimaryCategoryName } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'

export const revalidate = 3600

export async function generateMetadata() {
  const settings = await getSettings()
  return buildMetadata({
    title: 'Blog',
    description: 'Latest news and analysis from Modern Patriots',
    path: '/blog',
    settings,
  })
}

export default async function BlogArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const { docs: posts, totalPages, page: currentPage = 1 } = await getPublishedPosts(12, page)

  return (
    <div className="dir-broadsheet">
      <Container className="py-10">
        <header className="crg-cathead">
          <div className="crg-cathead__eyebrow">Archive</div>
          <h1 className="crg-cathead__title">All Stories</h1>
        </header>

        <div className="bs-river border-t-0 mt-0">
          {posts.map((post) => (
            <article className="bs-riveritem" key={post.id}>
              <PostImage
                src={getFeaturedImageUrl(post)}
                alt={post.title || ''}
                ratio="4 / 3"
              />
              <div>
                <Kicker>{getPrimaryCategoryName(post.categories)}</Kicker>
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="bs-riveritem__title">{post.title}</h3>
                </Link>
                <p className="bs-riveritem__dek">{getPostExcerpt(post)}</p>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="flex gap-4 justify-center py-10 font-ui text-sm">
            {currentPage > 1 ? (
              <Link href={`/blog?page=${currentPage - 1}`} className="text-accent">
                ← Previous
              </Link>
            ) : null}
            <span className="text-muted">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link href={`/blog?page=${currentPage + 1}`} className="text-accent">
                Next →
              </Link>
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  )
}
