import Link from 'next/link'
import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Post } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { PostImage } from '@/components/ui/PostImage'
import { ShareRow } from '@/components/ui/ShareRow'
import { SidebarAd } from '@/components/ui/SidebarAd'
import { InContentAd } from '@/components/ui/InContentAd'
import { AfterContentAd } from '@/components/ui/AfterContentAd'
import { RelatedAd } from '@/components/ui/RelatedAd'
import { getFeaturedImageUrl, getPostExcerpt } from '@/lib/posts'
import { getPrimaryCategoryName } from '@/lib/utils'

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
})

function RichTextWithAd({
  content,
  insertAdAfterParagraph = 3,
}: {
  content: SerializedEditorState
  insertAdAfterParagraph?: number
}) {
  const children = (content?.root?.children ?? []) as Array<{ type?: string }>

  // Find the index just after the Nth top-level paragraph so we can split the
  // article and drop an in-content ad unit in the gap.
  let paragraphsSeen = 0
  let splitIndex = -1
  for (let i = 0; i < children.length; i++) {
    if (children[i]?.type === 'paragraph') {
      paragraphsSeen++
      if (paragraphsSeen === insertAdAfterParagraph) {
        splitIndex = i + 1
        break
      }
    }
  }

  // Not enough paragraphs to split — render the article unchanged.
  if (splitIndex <= 0 || splitIndex >= children.length) {
    return (
      <div className="crg-body">
        <RichText data={content} converters={jsxConverters} />
      </div>
    )
  }

  const before: SerializedEditorState = {
    ...content,
    root: { ...content.root, children: children.slice(0, splitIndex) as never },
  }
  const after: SerializedEditorState = {
    ...content,
    root: { ...content.root, children: children.slice(splitIndex) as never },
  }

  return (
    <div className="crg-body">
      <RichText data={before} converters={jsxConverters} />
      <div className="crg-incontent-ad my-6">
        <InContentAd />
      </div>
      <RichText data={after} converters={jsxConverters} />
    </div>
  )
}

export function ArticleView({
  post,
  related,
  trending,
}: {
  post: Post
  related: Post[]
  trending: Post[]
}) {
  const excerpt = getPostExcerpt(post)

  return (
    <div className="dir-broadsheet">
      <Container className="crg-article">
        <div className="crg-article__grid">
          <article className="crg-article__main">
            <Link href="/" className="crg-back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Link>
            <Kicker className="crg-article__kicker inline-block mb-4">
              {getPrimaryCategoryName(post.categories)}
            </Kicker>
            <h1 className="crg-article__title">{post.title}</h1>
            <p className="crg-article__dek">{excerpt}</p>
            <div className="crg-article__meta">
              <ShareRow />
            </div>

            <div className="crg-article__lead mb-3">
              <PostImage
                src={getFeaturedImageUrl(post)}
                alt={post.title || ''}
                ratio="40 / 21"
                priority
              />
            </div>

            {post.content ? (
              <RichTextWithAd content={post.content as SerializedEditorState} />
            ) : null}

            <div className="crg-aftercontent-ad my-6">
              <AfterContentAd />
            </div>

            <div className="crg-below-ad mt-[calc(30px*var(--gap))]">
              <h2 className="crg-related__head">Related Stories</h2>
              <div className="crg-related">
                {related.map((rel) => (
                  <div key={rel.id}>
                    <Link href={`/blog/${rel.slug}`}>
                      <PostImage
                        src={getFeaturedImageUrl(rel)}
                        alt={rel.title || ''}
                        ratio="16 / 9"
                      />
                      <h3 className="crg-relcard__title">{rel.title}</h3>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="crg-related-ad my-6">
              <RelatedAd />
            </div>
          </article>

          <aside className="min-w-0">
            <div style={{ position: 'sticky', top: '92px' }}>
              <div className="bs-widget" style={{ marginBottom: '24px' }}>
                <div className="bs-widget__head">Trending</div>
                <ol className="bs-mostread">
                  {trending.map((item) => (
                    <li key={item.id}>
                      <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bs-widget">
                <SidebarAd />
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}
