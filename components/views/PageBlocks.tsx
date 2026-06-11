import {
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Page } from '@/payload-types'
import { Container } from '@/components/ui/Container'
import { Newsletter } from '@/components/ui/Newsletter'
import { PostImage } from '@/components/ui/PostImage'

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
})

export function PageBlocks({ page }: { page: Page }) {
  const blocks = page.layout || []

  return (
    <div className="dir-broadsheet py-10">
      <Container className="max-w-[720px]">
        <h1 className="font-head font-bold text-navy text-4xl mb-8">{page.title}</h1>
        {blocks.map((block, i) => {
          if (block.blockType === 'hero') {
            return (
              <section key={i} className="mb-10">
                {block.image && typeof block.image === 'object' && block.image.url ? (
                  <PostImage src={block.image.url} alt={block.heading || ''} ratio="40 / 21" />
                ) : null}
                <h2 className="font-head font-bold text-3xl text-navy mt-6">{block.heading}</h2>
                {block.subheading ? (
                  <p className="font-sub text-lg text-muted mt-3">{block.subheading}</p>
                ) : null}
              </section>
            )
          }
          if (block.blockType === 'richText' && block.content) {
            return (
              <div key={i} className="crg-body mb-10">
                <RichText
                  data={block.content as SerializedEditorState}
                  converters={jsxConverters}
                />
              </div>
            )
          }
          if (block.blockType === 'newsletter') {
            return (
              <div key={i} className="mb-10">
                <Newsletter compact={block.compact || false} />
              </div>
            )
          }
          if (block.blockType === 'adSlot') {
            // Ads are served via Google AdSense Auto Ads (page-level placement),
            // so editor-inserted ad blocks render nothing here.
            return null
          }
          return null
        })}
      </Container>
    </div>
  )
}
