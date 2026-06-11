import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'
import { isAdminOrEditor, isPublishedOrLoggedIn } from '../access'
import { revalidatePage, revalidatePageDelete } from '../hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  access: {
    create: isAdminOrEditor,
    read: isPublishedOrLoggedIn,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({ fieldToUse: 'title' }),
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'hero',
          labels: { singular: 'Hero', plural: 'Heroes' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'subheading', type: 'textarea' },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          slug: 'richText',
          labels: { singular: 'Rich Text', plural: 'Rich Text Blocks' },
          fields: [
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
          ],
        },
        {
          slug: 'newsletter',
          labels: { singular: 'Newsletter', plural: 'Newsletter Blocks' },
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Get the headlines that matter, every morning.' },
            { name: 'compact', type: 'checkbox', defaultValue: false },
          ],
        },
        {
          slug: 'adSlot',
          labels: { singular: 'Ad Slot', plural: 'Ad Slots' },
          fields: [
            {
              name: 'variant',
              type: 'select',
              options: [
                { label: 'Leaderboard', value: 'leaderboard' },
                { label: 'Box', value: 'box' },
                { label: 'Inline', value: 'inline' },
                { label: 'Half Page', value: 'halfpage' },
              ],
              defaultValue: 'box',
            },
          ],
        },
      ],
    },
    {
      name: 'wpId',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageDelete],
  },
}
