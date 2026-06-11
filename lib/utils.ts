import type { CSSProperties } from 'react'
import type { Setting } from '@/payload-types'

export function getServerURL(): string {
  // Strip any trailing slash so callers can safely concatenate `${getServerURL()}/path`
  // without producing a double slash (e.g. og:image URLs).
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function estimateReadMins(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function getPrimaryCategoryName(
  categories: Array<{ name?: string | null } | string | number> | null | undefined,
): string {
  if (!categories?.length) return 'News'
  const first = categories[0]
  if (typeof first === 'object' && first && 'name' in first && first.name) {
    return first.name
  }
  return 'News'
}

export const FONT_PAIRS = {
  traditional: {
    head: '"Libre Caslon Display", Georgia, serif',
    sub: '"Source Serif 4", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    ui: '"Libre Franklin", system-ui, sans-serif',
  },
  slab: {
    head: '"Zilla Slab", Georgia, serif',
    sub: '"Source Serif 4", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    ui: '"Public Sans", system-ui, sans-serif',
  },
  modern: {
    head: '"Libre Franklin", system-ui, sans-serif',
    sub: '"Lora", Georgia, serif',
    body: '"Lora", Georgia, serif',
    ui: '"Public Sans", system-ui, sans-serif',
  },
} as const

export const DENSITY = {
  compact: 0.72,
  regular: 1,
  comfy: 1.32,
} as const

export function getThemeStyle(settings: Setting | null | undefined): CSSProperties {
  const pair = FONT_PAIRS[settings?.fontPair as keyof typeof FONT_PAIRS] || FONT_PAIRS.traditional
  const density = settings?.density as keyof typeof DENSITY | undefined

  return {
    '--font-head': pair.head,
    '--font-sub': pair.sub,
    '--font-body': pair.body,
    '--font-ui': pair.ui,
    '--accent': settings?.accentColor || '#b4151f',
    '--read': `${settings?.readSize || 19}px`,
    '--gap': String(DENSITY[density || 'regular'] || 1),
  } as CSSProperties
}

export const DEFAULT_NAV = [
  { label: 'Featured', href: '/' },
  { label: 'News', href: '/category/news' },
  { label: 'Politics', href: '/category/politics' },
  { label: 'World', href: '/category/world' },
  { label: 'Election', href: '/category/election' },
  { label: 'Opinion', href: '/category/opinion' },
  { label: 'About', href: '/about' },
]
