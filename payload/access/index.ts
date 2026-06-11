import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isPublishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    status: {
      equals: 'published',
    },
  }
}
