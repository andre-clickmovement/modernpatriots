import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'
import { revalidateSettings } from '../hooks/revalidateSettings'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateSettings],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'siteName', type: 'text', required: true, defaultValue: 'Modern Patriots' },
            { name: 'siteUrl', type: 'text', required: true, defaultValue: 'http://localhost:3000' },
            { name: 'siteDescription', type: 'textarea' },
            { name: 'tagline', type: 'text', defaultValue: 'Independent Reporting · Est. 2020' },
            { name: 'mark', type: 'text', defaultValue: 'MP' },
            { name: 'markAccentIndex', type: 'number', defaultValue: 1 },
            { name: 'footerAccentWord', type: 'number', defaultValue: 2 },
          ],
        },
        {
          label: 'Theme',
          fields: [
            {
              name: 'layoutDirection',
              type: 'select',
              options: [
                { label: 'Broadsheet', value: 'broadsheet' },
                { label: 'Modern', value: 'modern' },
              ],
              defaultValue: 'broadsheet',
            },
            {
              name: 'fontPair',
              type: 'select',
              options: [
                { label: 'Traditional', value: 'traditional' },
                { label: 'Editorial Slab', value: 'slab' },
                { label: 'Modern Sans', value: 'modern' },
              ],
              defaultValue: 'traditional',
            },
            { name: 'accentColor', type: 'text', defaultValue: '#b4151f' },
            { name: 'readSize', type: 'number', defaultValue: 19 },
            {
              name: 'density',
              type: 'select',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Regular', value: 'regular' },
                { label: 'Comfy', value: 'comfy' },
              ],
              defaultValue: 'regular',
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'headerNav',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
            {
              name: 'footerNav',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Social & SEO',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                { name: 'platform', type: 'text' },
                { name: 'url', type: 'text' },
              ],
            },
            { name: 'defaultMetaTitle', type: 'text' },
            { name: 'defaultMetaDescription', type: 'textarea' },
            { name: 'adSenseClientId', type: 'text' },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'headCode',
              type: 'textarea',
              label: 'Header code',
              admin: {
                description:
                  'Raw HTML/JS injected into the site <head> on every page (e.g. Google Analytics, Google Tag Manager, Meta Pixel). Paste the full snippet including <script> tags.',
              },
            },
            {
              name: 'bodyCode',
              type: 'textarea',
              label: 'Body code',
              admin: {
                description:
                  'Raw HTML injected at the start of <body> on every page (e.g. GTM <noscript>, chat widgets). Paste the full snippet including any tags.',
              },
            },
          ],
        },
      ],
    },
  ],
}
