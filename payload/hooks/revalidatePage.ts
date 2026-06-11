import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  if (doc.slug) {
    revalidatePath(`/${doc.slug}`)
  }

  revalidatePath('/sitemap.xml')
  return doc
}

export const revalidatePageDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  if (doc.slug) {
    revalidatePath(`/${doc.slug}`)
  }

  return doc
}
