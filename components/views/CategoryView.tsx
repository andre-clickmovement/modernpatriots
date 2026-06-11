import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { PostImage } from '@/components/ui/PostImage'
import { getFeaturedImageUrl, getPostExcerpt } from '@/lib/posts'
import { getPrimaryCategoryName } from '@/lib/utils'

export function CategoryView({
  categoryName,
  description,
  posts,
}: {
  categoryName: string
  description?: string | null
  posts: Post[]
}) {
  return (
    <div className="dir-broadsheet">
      <Container>
        <header className="crg-cathead">
          <div className="crg-cathead__eyebrow">Section</div>
          <h1 className="crg-cathead__title">{categoryName}</h1>
          {description ? <p className="crg-cathead__sub">{description}</p> : null}
        </header>

        <div className="bs-river border-t-0 mt-0">
          {posts.length === 0 ? (
            <p className="py-12 text-center text-muted">
              No stories in this section yet. Check back soon.
            </p>
          ) : null}
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
      </Container>
    </div>
  )
}
