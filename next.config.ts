import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import wpRedirects from './lib/wp-redirects.json'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/media/**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      ...wpRedirects,
    ]
  },
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    // Payload always registers the Vercel Blob client upload handler in the admin
    // import map (even with clientUploads disabled). That `'use client'` module
    // imports the `@payloadcms/plugin-cloud-storage/utilities` barrel, which also
    // re-exports the server-only `resolveSignedURLKey` — dragging the entire
    // `payload` server package (pino, undici, node: builtins) into the browser
    // bundle and breaking the build. The barrel's only client use is `getFileKey`,
    // called inside the upload handler — dead code here since client uploads are
    // disabled. Stub the barrel (and undici) out of the browser bundle.
    if (!isServer) {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@payloadcms/plugin-cloud-storage/utilities$': false,
        undici: false,
      }
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
