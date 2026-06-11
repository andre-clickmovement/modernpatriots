import type { Metadata } from 'next'
import Script from 'next/script'
import { Libre_Caslon_Display, Libre_Franklin, Source_Serif_4 } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { BroadsheetHeader } from '@/components/layout/broadsheet/Header'
import { getNavItems, getSettings } from '@/lib/settings'
import { DEFAULT_NAV, getThemeStyle } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'
import '../globals.css'

// Google AdSense publisher ID (public; appears on every page). Drives Auto Ads.
// Overridable via env without a code change.
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1722256094173037'

// Google Analytics 4 measurement ID (public). Overridable via env.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-6QCQJB2FBJ'

const libreCaslon = Libre_Caslon_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-libre-caslon',
})

const libreFranklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-libre-franklin',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
})

export async function generateMetadata(): Promise<Metadata> {
  // AdSense verifies domain ownership via this meta tag; without it Auto Ads
  // commonly serve nothing. Reuse the same client ID as the loader script and
  // emit it site-wide so every route inherits it.
  const adsense = { 'google-adsense-account': ADSENSE_CLIENT }
  try {
    const settings = await getSettings()
    return { ...buildMetadata({ settings }), other: adsense }
  } catch {
    return { ...buildMetadata({}), other: adsense }
  }
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let settings = null
  let nav = DEFAULT_NAV

  try {
    settings = await getSettings()
    nav = getNavItems(settings)
  } catch {
    // DB unavailable during build — use defaults
  }

  const themeStyle = getThemeStyle(settings)

  return (
    <html
      lang="en"
      className={`${libreCaslon.variable} ${libreFranklin.variable} ${sourceSerif.variable}`}
    >
      <body>
        {/* Google AdSense Auto Ads loader — loaded via next/script so it never
            fights React's <head> management. Auto Ads handles ad placement at
            the page level; enable it in the AdSense dashboard. */}
        <Script
          id="adsense-auto-ads"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          id="ga-gtag-src"
          async
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script id="ga-gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {/*
          Tracking snippets (GA/GTM/Meta Pixel/AdSense) are injected as
          server-rendered raw HTML at the top of <body>. They MUST NOT be put
          in a manual <head> element here: rendering <head> in an App Router
          root layout fights React's own head management, which on hydration
          creates a duplicate <head> and drops the managed stylesheet <link>,
          leaving the whole site unstyled. Server-rendered <script> tags in the
          body still execute on initial load, so tracking keeps working.
        */}
        {settings?.headCode ? (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settings.headCode }} />
        ) : null}
        {settings?.bodyCode ? (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settings.bodyCode }} />
        ) : null}
        <div
          id="crg-root"
          className="dir-broadsheet"
          data-density={settings?.density || 'regular'}
          style={themeStyle}
        >
          <BroadsheetHeader
            siteName={settings?.siteName || 'Modern Patriots'}
            tagline={settings?.tagline || 'Independent Reporting · Est. 2020'}
            nav={nav}
          />
          <main>{children}</main>
          <Footer settings={settings} nav={nav} />
        </div>
      </body>
    </html>
  )
}
