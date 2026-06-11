import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePost: CollectionAfterChangeHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')

  if (doc.slug) {
    revalidatePath(`/blog/${doc.slug}`)
  }

  return doc
}

export const revalidatePostDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  revalidatePath('/')
  revalidatePath('/blog')

  if (doc.slug) {
    revalidatePath(`/blog/${doc.slug}`)
  }

  return doc
}
