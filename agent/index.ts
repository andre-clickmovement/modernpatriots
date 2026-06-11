/**
 * Cron entry point — can be invoked via `pnpm tsx agent/index.ts`
 * or through Vercel Cron hitting GET /api/agent/post
 */
import { publishScheduledPosts } from './poster'

async function main() {
  const count = await publishScheduledPosts()
  console.log(`Published ${count} scheduled post(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
