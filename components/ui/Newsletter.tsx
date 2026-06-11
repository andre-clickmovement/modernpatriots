'use client'

import { useState } from 'react'

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`crg-news${compact ? ' crg-news--compact' : ''}`}>
      <div className="crg-news__eyebrow">Daily Briefing</div>
      <h3 className="crg-news__title">Get the headlines that matter, every morning.</h3>
      {!compact && (
        <p className="crg-news__sub">
          Join our mailing list for a free daily digest of the day&apos;s top stories.
        </p>
      )}
      {done ? (
        <div className="crg-news__done">✓ You&apos;re subscribed. Check your inbox.</div>
      ) : (
        <form className="crg-news__form" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? '…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}
