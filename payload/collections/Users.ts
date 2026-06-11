import type { Access, CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn } from '../access'

const allowFirstUserOrAdmin: Access = async ({ req }) => {
  if (req.user?.role === 'admin') return true
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  return totalDocs === 0
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => Boolean(user && user.role !== 'admin'),
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    create: allowFirstUserOrAdmin,
    read: isLoggedIn,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ operation, req, data }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0 && data) {
            data.role = 'admin'
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
