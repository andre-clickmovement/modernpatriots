import { getPayloadClient } from './payload'
import type { Setting } from '@/payload-types'
import { DEFAULT_NAV } from './utils'

export async function getSettings(): Promise<Setting> {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'settings' })
}

export function getNavItems(settings: Setting | null | undefined) {
  if (settings?.headerNav?.length) {
    return settings.headerNav.map((item) => ({
      label: item.label || '',
      href: item.href || '/',
    }))
  }
  return DEFAULT_NAV
}

export function getFooterNav(settings: Setting | null | undefined) {
  if (settings?.footerNav?.length) {
    return settings.footerNav
  }
  return DEFAULT_NAV.filter((item) => item.label !== 'About')
}
