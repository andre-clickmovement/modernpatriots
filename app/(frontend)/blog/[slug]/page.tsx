import { notFound } from 'next/navigation'
import { ArticleView } from '@/components/views/ArticleView'
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from '@/lib/posts'
import { postMetadata } from '@/lib/seo'
import { getSettings } from '@/lib/settings'

export const revalidate = 3600
export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSettings()])
  if (!post) return {}
  return postMetadata(post, settings)
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [related, trendingResult] = await Promise.all([
    getRelatedPosts(post, 3),
    getPublishedPosts(5),
  ])

  const trending = trendingResult.docs.filter((p) => p.id !== post.id).slice(0, 5)

  return <ArticleView post={post} related={related} trending={trending} />
}
