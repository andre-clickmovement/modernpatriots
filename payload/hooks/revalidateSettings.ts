import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateSettings: GlobalAfterChangeHook = ({ doc, req }) => {
  if (req.context?.disableRevalidate) return doc

  // Settings feed the root frontend layout (head/body tracking codes, nav, theme),
  // so refresh the whole layout tree to publish changes without a manual redeploy.
  revalidatePath('/', 'layout')

  return doc
}
