import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = body?.email

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  // Stub: log intent until ESP integration
  console.log('[newsletter] subscription request:', email)

  return NextResponse.json({ ok: true })
}
