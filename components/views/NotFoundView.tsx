import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { PostImage } from '@/components/ui/PostImage'
import { getFeaturedImageUrl, getPostExcerpt } from '@/lib/posts'
import { DEFAULT_NAV, getPrimaryCategoryName } from '@/lib/utils'

// Shared body for both the (frontend) and global root not-found boundaries.
// Server component — receives the recent posts so each boundary can fetch them
// with its own graceful-failure handling.
export function NotFoundView({ posts }: { posts: Post[] }) {
  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <Kicker className="inline-block mb-3">Error 404</Kicker>
        <h1 className="font-head text-[clamp(32px,6vw,50px)] leading-tight mb-3">
          We couldn&apos;t find that page.
        </h1>
        <p className="font-sub text-lg text-muted mb-6">
          The page you were looking for may have moved, been removed, or never
          existed. Try one of the links below, or browse our latest reporting.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-ui font-semibold text-sm">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <Link href="/blog" className="hover:text-accent">
            Latest
          </Link>
          {DEFAULT_NAV.filter((item) => item.href.startsWith('/category/')).map(
            (item) => (
              <Link key={item.href} href={item.href} className="hover:text-accent">
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {posts.length > 0 ? (
        <div className="bs-river mt-[calc(28px*var(--gap))]">
          <div className="bs-river__head">Latest Stories</div>
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
      ) : null}
    </Container>
  )
}
