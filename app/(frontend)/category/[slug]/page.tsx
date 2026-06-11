import { notFound } from 'next/navigation'
import { CategoryView } from '@/components/views/CategoryView'
import { getPostsByCategory } from '@/lib/posts'
import { getPayloadClient } from '@/lib/payload'
import { buildMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'

export const revalidate = 3600

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const payload = await getPayloadClient()
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const category = categoryResult.docs[0]
  if (!category) notFound()

  const { docs: posts } = await getPostsByCategory(slug, page)

  return (
    <CategoryView
      categoryName={category.name}
      description={category.description}
      posts={posts}
    />
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const settings = await getSettings()
  const payload = await getPayloadClient()
  const categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const category = categoryResult.docs[0]
  if (!category) return {}

  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/category/${slug}`,
    settings,
  })
}
