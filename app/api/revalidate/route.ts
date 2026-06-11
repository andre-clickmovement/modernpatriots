import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const secret = process.env.REVALIDATION_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const path = body?.path as string | undefined

  if (path) {
    revalidatePath(path)
  } else {
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml')
  }

  return NextResponse.json({ revalidated: true, path: path || 'all' })
}
