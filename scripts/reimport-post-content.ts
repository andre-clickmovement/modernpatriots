#!/usr/bin/env tsx
/**
 * Re-convert WordPress HTML from migration-data/posts.json and update post content in Payload.
 * Usage: pnpm reimport-content
 *
 * Prerequisites:
 *   pnpm wp-export ./wp-posts/conservativeresearchgroup.WordPress.2026-06-02.xml
 */
import fs from 'fs'
import path from 'path'
import { getPayloadClient } from '../lib/payload'
import { htmlToLexical } from '../lib/lexical'

const dataDir = path.resolve('migration-data')
const postsFile = path.join(dataDir, 'posts.json')

type PostJson = {
  title: string
  slug: string
  content: string
  wpId: number
}

async function main() {
  if (!fs.existsSync(postsFile)) {
    console.error(`Missing ${postsFile}. Run: pnpm wp-export <path-to-wordpress-export.xml>`)
    process.exit(1)
  }

  const posts = JSON.parse(fs.readFileSync(postsFile, 'utf-8')) as PostJson[]
  const payload = await getPayloadClient()

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const post of posts) {
    try {
      const existing = await payload.find({
        collection: 'posts',
        where: { wpId: { equals: post.wpId } },
        limit: 1,
      })

      const doc = existing.docs[0]
      if (!doc) {
        skipped++
        continue
      }

      const lexical = await htmlToLexical(post.content || '<p></p>')

      await payload.update({
        collection: 'posts',
        id: doc.id,
        data: { content: lexical },
        context: { disableRevalidate: true },
      })

      updated++
      if (updated % 50 === 0) {
        console.log(`Updated ${updated} posts...`)
      }
    } catch (err) {
      errors++
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`wpId=${post.wpId} slug=${post.slug}: ${msg}`)
    }
  }

  console.log('Reimport complete:', { updated, skipped, errors, total: posts.length })
  console.log('Restart dev server or redeploy to refresh cached pages.')
  process.exit(errors > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
