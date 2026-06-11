'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type SearchResult = {
  slug: string
  title: string
  kicker: string
}

export function SearchOverlay({
  open,
  onClose,
  siteName,
}: {
  open: boolean
  onClose: () => void
  siteName: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [popular, setPopular] = useState<SearchResult[]>([])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    fetch('/api/search?q=')
      .then((r) => r.json())
      .then((data) => setPopular(data.results || []))
      .catch(() => setPopular([]))
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results || []))
        .catch(() => setResults([]))
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  if (!open) return null

  const list = query.trim() ? results : popular

  return (
    <div className="crg-search" onMouseDown={onClose}>
      <div className="crg-search__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="crg-search__row">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            placeholder={`Search ${siteName}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            Esc
          </button>
        </div>
        <div className="crg-search__hint">{query.trim() ? 'Results' : 'Popular'}</div>
        <ul className="crg-search__list">
          {list.map((item) => (
            <li key={item.slug}>
              <Link href={`/blog/${item.slug}`} onClick={onClose}>
                <span className="crg-search__cat">{item.kicker}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
