import { notFound } from 'next/navigation'
import { PageBlocks } from '@/components/views/PageBlocks'
import { getPageBySlug } from '@/lib/posts'
import { pageMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'

export const revalidate = 3600
export const dynamicParams = true

const RESERVED = new Set(['blog', 'category', 'admin', 'api', 'dev'])

// Catch-all so any unmatched path — single- or multi-segment — resolves here
// and falls through to notFound(), which renders the branded 404 (with full
// site chrome) at app/(frontend)/not-found.tsx. Pages are flat (single slug),
// so multi-segment paths are always 404s.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  if (slug.length !== 1 || RESERVED.has(slug[0])) return {}
  const [page, settings] = await Promise.all([getPageBySlug(slug[0]), getSettings()])
  if (!page) return {}
  return pageMetadata(page, settings)
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  if (slug.length !== 1 || RESERVED.has(slug[0])) notFound()

  const page = await getPageBySlug(slug[0])
  if (!page) notFound()

  return <PageBlocks page={page} />
}
