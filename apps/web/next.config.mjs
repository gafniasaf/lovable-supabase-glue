import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    externalDir: true,
    typedRoutes: true,
    optimizePackageImports: ['react', 'react-dom'],
  },
  transpilePackages: ['@education/shared'],
  output: 'standalone',
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: "geolocation=(), microphone=(), camera=(), interest-cohort=()" },
        { key: 'Strict-Transport-Security', value: process.env.NODE_ENV === 'production' ? 'max-age=15552000; includeSubDomains' : 'max-age=0' },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@education/shared': path.resolve(__dirname, '../../packages/shared/index.js'),
    };
    return config;
  },
};

export default nextConfig;


