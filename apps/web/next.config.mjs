import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // OpenStreetMap tiles — NetworkFirst with 7-day cache
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
        networkTimeoutSeconds: 5,
      },
    },
    // API /bathrooms — NetworkFirst with 5-min cache for offline fallback
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/bathrooms'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-bathrooms',
        expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 3,
      },
    },
    // Cloudflare R2 images — StaleWhileRevalidate with 1-hour cache
    {
      urlPattern: /\.r2\.dev\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'r2-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 },
      },
    },
    // Google Fonts stylesheets — CacheFirst, 365 days
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Google Fonts files — CacheFirst, 365 days
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Next.js static assets — CacheFirst, 30 days
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default withPWA(nextConfig)
