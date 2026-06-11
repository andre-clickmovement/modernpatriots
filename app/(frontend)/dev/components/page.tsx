import { Container } from '@/components/ui/Container'
import { Kicker } from '@/components/ui/Kicker'
import { AdSlot } from '@/components/ui/AdSlot'
import { Newsletter } from '@/components/ui/Newsletter'
import { ShareRow } from '@/components/ui/ShareRow'

export default function DevComponentsPage() {
  return (
    <Container className="py-16 space-y-12">
      <section>
        <Kicker>Design System</Kicker>
        <h1 className="font-head text-4xl text-navy mt-2">Component Preview</h1>
      </section>
      <section className="grid md:grid-cols-2 gap-8">
        <AdSlot variant="leaderboard" />
        <AdSlot variant="box" />
      </section>
      <section className="max-w-md">
        <Newsletter />
      </section>
      <section>
        <ShareRow />
      </section>
    </Container>
  )
}
