import type { Metadata } from 'next'
import type { Page, Post, Setting } from '@/payload-types'
import { getServerURL } from './utils'

type SEOInput = {
  title?: string | null
  description?: string | null
  path?: string
  image?: string | null
  settings?: Setting | null
}

export function buildMetadata({
  title,
  description,
  path = '',
  image,
  settings,
}: SEOInput): Metadata {
  const siteName = settings?.siteName || 'Modern Patriots'
  const metaTitle = title || settings?.defaultMetaTitle || siteName
  const metaDescription =
    description || settings?.defaultMetaDescription || settings?.siteDescription || ''
  const url = `${getServerURL()}${path}`
  const ogImage = image || `${getServerURL()}/og-default.svg`

  return {
    title: metaTitle.includes(siteName) ? metaTitle : `${metaTitle} | ${siteName}`,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
  }
}

export function postMetadata(post: Post, settings?: Setting | null): Metadata {
  return buildMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    settings,
  })
}

export function pageMetadata(page: Page, settings?: Setting | null): Metadata {
  return buildMetadata({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
    path: `/${page.slug}`,
    settings,
  })
}
