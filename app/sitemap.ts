import type { MetadataRoute } from 'next'
import { getAllPageSlugs, getAllPostSlugs } from '@/lib/posts'
import { getServerURL } from '@/lib/utils'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerURL()

  try {
    const [postSlugs, pageSlugs] = await Promise.all([getAllPostSlugs(), getAllPageSlugs()])

    const staticRoutes: MetadataRoute.Sitemap = [
      { url: base, changeFrequency: 'hourly', priority: 1 },
      { url: `${base}/blog`, changeFrequency: 'hourly', priority: 0.9 },
    ]

    const postRoutes = postSlugs.map((slug) => ({
      url: `${base}/blog/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const pageRoutes = pageSlugs.map((slug) => ({
      url: `${base}/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes, ...pageRoutes]
  } catch {
    return [
      { url: base, changeFrequency: 'hourly', priority: 1 },
      { url: `${base}/blog`, changeFrequency: 'hourly', priority: 0.9 },
    ]
  }
}
