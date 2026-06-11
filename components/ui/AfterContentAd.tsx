'use client'

import { useEffect } from 'react'

const ADSENSE_CLIENT = 'ca-pub-1722256094173037'

// CRG After-Content (Responsive) ad unit. The adsbygoogle.js loader is added
// once, globally, in app/(frontend)/layout.tsx — here we only render the <ins>
// slot and push it onto the queue after mount so the script can fill it.
export function AfterContentAd() {
  useEffect(() => {
    try {
      ;((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({})
    } catch {
      // Ad blockers or a not-yet-loaded script will throw; safe to ignore.
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot="7251269988"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
