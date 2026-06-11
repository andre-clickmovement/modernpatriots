'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SearchOverlay } from '@/components/ui/SearchOverlay'

type NavItem = { label: string; href: string }

export function BroadsheetHeader({
  siteName,
  tagline,
  nav,
}: {
  siteName: string
  tagline: string
  nav: NavItem[]
}) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="dir-broadsheet__header">
        <div className="bs-ribbon">
          <div className="crg-wrap bs-ribbon__in">
            <span className="bs-ribbon__date">{today}</span>
            <div className="bs-ribbon__right">
              <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Search
              </button>
              <Link href="/about">Sign In</Link>
            </div>
          </div>
        </div>

        <div className="crg-wrap">
          <div className="bs-masthead">
            <div className="bs-masthead__rule">
              <span className="bs-masthead__star">★ ★ ★</span>
            </div>
            <Link href="/">
              <h1 className="bs-masthead__name">{siteName}</h1>
            </Link>
            <div className="bs-masthead__tag">{tagline}</div>
          </div>
        </div>

        <nav className="bs-nav">
          <div className="crg-wrap bs-nav__in">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'is-active' : ''}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} siteName={siteName} />
    </>
  )
}
