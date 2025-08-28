import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Allow e2e/CI builds to proceed even if there are lint warnings/errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["react", "react-dom"]
  },
  transpilePackages: ['@shared', '@education/shared', '@lovable/expertfolio-ui', '@lovable/expertfolio-adapters'],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@lovable/expertfolio-ui': path.resolve(__dirname, '../../packages/expertfolio-ui/src'),
      // Pin to server-safe adapters entry (avoids hooks/msw re-exports on the root index)
      '@lovable/expertfolio-adapters$': path.resolve(__dirname, '../../packages/expertfolio-adapters/src/adapters/index.ts'),
      // Ignore msw in production bundles
      msw: false,
      'msw/node': false
    };
    return config;
  },
  output: 'standalone',
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), interest-cohort=()" },
        { key: "Strict-Transport-Security", value: process.env.NODE_ENV === 'production' ? "max-age=15552000; includeSubDomains" : "max-age=0" }
      ]
    }
  ]
};

export default nextConfig;


