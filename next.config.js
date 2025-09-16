/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.jsdelivr.net', 'logo.clearbit.com'],
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://yield-desk.com',
  },
}

module.exports = nextConfig
