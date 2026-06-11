import { NextResponse } from 'next/server'
import { createAgentPost, publishScheduledPosts } from '@/agent/poster'
import { htmlToLexical } from '@/lib/lexical'

type AgentPostBody = {
  title: string
  content?: string | Record<string, unknown>
  excerpt?: string
  categories?: string[]
  tags?: string[]
  featuredImageUrl?: string
  status?: 'published' | 'draft' | 'scheduled'
  publishedAt?: string
  scheduledFor?: string
  generate?: boolean
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function validateAuth(request: Request): boolean {
  const auth = request.headers.get('authorization')
  const key = process.env.AGENT_API_KEY
  if (!key) return false
  return auth === `Bearer ${key}` || auth === `Bearer ${process.env.CRON_SECRET}`
}

async function htmlToLexicalContent(html: string) {
  return htmlToLexical(html)
}

export async function POST(request: Request) {
  if (!validateAuth(request)) return unauthorized()

  try {
    const body = (await request.json().catch(() => ({}))) as AgentPostBody

    // Cron with no body: publish scheduled + optionally generate
    if (!body.title && !body.content) {
      const scheduled = await publishScheduledPosts()
      return NextResponse.json({ ok: true, scheduledPublished: scheduled })
    }

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    let content = body.content
    if (typeof content === 'string') {
      content = await htmlToLexicalContent(content)
    }

    const post = await createAgentPost({
      title: body.title,
      content: content as Record<string, unknown>,
      excerpt: body.excerpt,
      categorySlugs: body.categories,
      tagSlugs: body.tags,
      featuredImageUrl: body.featuredImageUrl,
      status: body.status || 'published',
      publishedAt: body.publishedAt,
      scheduledFor: body.scheduledFor,
    })

    return NextResponse.json({ ok: true, post: { id: post.id, slug: post.slug } })
  } catch (error) {
    console.error('[agent/post]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  if (!validateAuth(request)) return unauthorized()
  const scheduled = await publishScheduledPosts()
  return NextResponse.json({ ok: true, scheduledPublished: scheduled })
}
