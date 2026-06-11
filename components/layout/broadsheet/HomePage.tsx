import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { Newsletter } from '@/components/ui/Newsletter'
import { PostImage } from '@/components/ui/PostImage'
import { getFeaturedImageUrl, getPostExcerpt } from '@/lib/posts'
import { getPrimaryCategoryName } from '@/lib/utils'

function PostLink({
  post,
  children,
  className,
}: {
  post: Post
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link href={`/blog/${post.slug}`} className={className}>
      {children}
    </Link>
  )
}

export function BroadsheetHome({ posts }: { posts: Post[] }) {
  const [lead, ...rest] = posts
  const secondary = rest.slice(0, 2)
  const river = rest.slice(2, 7)
  const mostRead = posts.slice(0, 5)

  if (!lead) {
    return (
      <Container className="py-20 text-center text-muted">
        <p>No published posts yet. Add content in the admin panel.</p>
      </Container>
    )
  }

  return (
    <div className="dir-broadsheet">
      <Container className="bs-front">
        <div className="bs-main">
          <article className="bs-lead">
            <Kicker className="bs-lead__kicker inline-block mb-3">
              {getPrimaryCategoryName(lead.categories)}
            </Kicker>
            <PostLink post={lead}>
              <h2 className="bs-lead__title">{lead.title}</h2>
            </PostLink>
            <div className="bs-lead__img my-1.5 mb-4">
              <PostImage
                src={getFeaturedImageUrl(lead)}
                alt={lead.title || ''}
                ratio="40 / 21"
              />
            </div>
            <p className="bs-lead__dek">{getPostExcerpt(lead)}</p>
          </article>

          <div className="bs-sec">
            {secondary.map((post) => (
              <article className="bs-story min-w-0" key={post.id}>
                <div className="bs-story__img mb-[11px]">
                  <PostImage
                    src={getFeaturedImageUrl(post)}
                    alt={post.title || ''}
                    ratio="3 / 2"
                  />
                </div>
                <Kicker className="bs-story__kicker inline-block mb-2">
                  {getPrimaryCategoryName(post.categories)}
                </Kicker>
                <PostLink post={post}>
                  <h3 className="bs-story__title">{post.title}</h3>
                </PostLink>
                <p className="bs-story__dek">{getPostExcerpt(post)}</p>
              </article>
            ))}
          </div>

          <div className="bs-river">
            <div className="bs-river__head">More Stories</div>
            {river.map((post) => (
              <article className="bs-riveritem" key={post.id}>
                <PostImage
                  src={getFeaturedImageUrl(post)}
                  alt={post.title || ''}
                  ratio="4 / 3"
                />
                <div>
                  <Kicker>{getPrimaryCategoryName(post.categories)}</Kicker>
                  <PostLink post={post}>
                    <h3 className="bs-riveritem__title">{post.title}</h3>
                  </PostLink>
                  <p className="bs-riveritem__dek">{getPostExcerpt(post)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="bs-aside">
          <div className="bs-widget">
            <div className="bs-widget__head">Most Read</div>
            <ol className="bs-mostread">
              {mostRead.map((post) => (
                <li key={post.id}>
                  <PostLink post={post}>{post.title}</PostLink>
                </li>
              ))}
            </ol>
          </div>
          <div className="bs-widget">
            <Newsletter compact />
          </div>
        </aside>
      </Container>
    </div>
  )
}
