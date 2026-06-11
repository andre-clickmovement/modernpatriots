import { BroadsheetHome } from '@/components/layout/broadsheet/HomePage'
import { getPublishedPosts } from '@/lib/posts'

export const revalidate = 3600

export default async function HomePage() {
  try {
    const { docs: posts } = await getPublishedPosts(20)
    return <BroadsheetHome posts={posts} />
  } catch {
    return <BroadsheetHome posts={[]} />
  }
}
