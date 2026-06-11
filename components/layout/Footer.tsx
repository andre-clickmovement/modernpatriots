import Link from 'next/link'
import type { Setting } from '@/payload-types'
import { getFooterNav } from '@/lib/settings'

type NavItem = { label: string; href: string }

export function Footer({
  settings,
  nav,
}: {
  settings: Setting | null
  nav: NavItem[]
}) {
  const siteName = settings?.siteName || 'Modern Patriots'
  const accentWord = settings?.footerAccentWord ?? 2
  const words = siteName.split(' ')
  const footerNav = getFooterNav(settings)

  return (
    <footer className="crg-footer">
      <div className="crg-wrap crg-footer__top">
        <div>
          <p className="crg-footer__brand">
            {words.map((word, i) => (
              <span key={i}>
                {i > 0 ? ' ' : ''}
                {i === accentWord ? <span>{word}</span> : word}
              </span>
            ))}
          </p>
          <p className="crg-footer__blurb">
            {settings?.siteDescription ||
              'Independent reporting on the stories shaping the nation. Researched, written, and published daily.'}
          </p>
        </div>
        <div className="crg-footer__col">
          <h4>Sections</h4>
          <ul>
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href || '/'}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="crg-footer__col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/subscribe">Subscribe</Link></li>
          </ul>
        </div>
        <div className="crg-footer__col">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-of-use">Terms of Use</Link></li>
          </ul>
        </div>
      </div>
      <div className="crg-wrap crg-footer__bar">
        <span>© {new Date().getFullYear()} {siteName}. All Rights Reserved.</span>
        <span>Made for readers, not algorithms.</span>
      </div>
    </footer>
  )
}
