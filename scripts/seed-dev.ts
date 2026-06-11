#!/usr/bin/env tsx
/**
 * Seed default settings, categories, and sample posts for local development.
 * Usage: pnpm tsx scripts/seed-dev.ts
 */
import { getPayloadClient } from '../lib/payload'
import { SECTION_CATEGORIES } from '../lib/categories'
import { htmlToLexical } from '../lib/lexical'

const SAMPLE_POSTS = [
  {
    title: 'Controversial Australian Olympic Breaker Rachael Gunn Announces Shocking Retirement',
    slug: 'rachael-gunn-retirement',
    excerpt:
      'The 37-year-old academic, mocked online for an unconventional Olympic routine, says she will step away from competition within months.',
    category: 'News',
    body: `<p>Rachael Gunn, a breaker from Australia, told a Sydney radio station that she plans to retire within three months.</p><p>The 37-year-old Sydney University lecturer failed to score in all three of her round-robin battles, drawing a wave of commentary across social media.</p>`,
  },
  {
    title: 'Trump Supporters Sing How Great Thou Art in Emotional Celebration After Election Victory',
    slug: 'trump-supporters-hymn',
    excerpt:
      'A spontaneous hymn swept through the crowd as supporters gathered to mark the President-elect\'s win.',
    category: 'Election',
    body: `<p>After Donald Trump's historic election victory, supporters sang "How Great Thou Art" together in celebration.</p><p>The moment captured the emotional intensity of an election night that many supporters had described as a long shot only weeks earlier.</p>`,
  },
  {
    title: 'San Francisco Mayoral Candidate Hit with $108K Ethics Fine Just Before Election',
    slug: 'sf-mayor-ethics-fine',
    excerpt:
      'An ethics commission investigation found the former mayor funded efforts in violation of city rules.',
    category: 'Politics',
    body: `<p>The San Francisco Chronicle reported the fine first, just one day before the election. A former mayoral candidate was fined more than $100,000 for an ethics violation.</p>`,
  },
]

async function main() {
  const payload = await getPayloadClient()

  // Settings
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Conservative Research Group',
      siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      siteDescription:
        'Independent reporting on the stories shaping the nation. Researched, written, and published daily.',
      tagline: 'Independent Reporting · Est. 2020',
      accentColor: '#b4151f',
      fontPair: 'traditional',
      readSize: 19,
      density: 'regular',
      layoutDirection: 'broadsheet',
      headerNav: [
        { label: 'Featured', href: '/' },
        { label: 'News', href: '/category/news' },
        { label: 'Politics', href: '/category/politics' },
        { label: 'World', href: '/category/world' },
        { label: 'Election', href: '/category/election' },
        { label: 'Opinion', href: '/category/opinion' },
        { label: 'About', href: '/about' },
      ],
    },
  })

  const categorySlugs: Record<string, number> = {}
  for (const section of SECTION_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: section.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      categorySlugs[section.name] = existing.docs[0].id
    } else {
      const cat = await payload.create({
        collection: 'categories',
        data: {
          name: section.name,
          slug: section.slug,
          description: section.description,
        },
        context: { disableRevalidate: true },
      })
      categorySlugs[section.name] = cat.id
    }
  }

  let admin = (
    await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@crg.local' } },
      limit: 1,
    })
  ).docs[0]

  if (!admin) {
    admin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@crg.local',
        password: 'admin123',
        name: 'Conservative Research Group',
        role: 'admin',
      },
    })
  }

  // Agent user
  const agentExists = await payload.find({
    collection: 'users',
    where: { email: { equals: 'agent@crg.local' } },
    limit: 1,
  })
  if (!agentExists.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'agent@crg.local',
        password: 'agent-dev-only',
        name: 'AI Agent',
        role: 'editor',
      },
    })
  }

  for (const sample of SAMPLE_POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: sample.slug } },
      limit: 1,
    })
    if (existing.docs[0]) continue

    const lexical = await htmlToLexical(sample.body)

    await payload.create({
      collection: 'posts',
      data: {
        title: sample.title,
        slug: sample.slug,
        excerpt: sample.excerpt,
        content: lexical,
        status: 'published',
        publishedAt: new Date().toISOString(),
        author: admin.id,
        categories: [categorySlugs[sample.category]],
      },
      context: { disableRevalidate: true },
    })
  }

  console.log('Dev seed complete. Admin: admin@crg.local / admin123')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
