import type { NextConfig } from 'next';

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  // Keep verification builds separate when a local dev server is running.
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  output: 'standalone',
  outputFileTracingIncludes: { '/*': ['./data/**/*'] },
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },

  async redirects() {
    const routes = [
      {
        source: '/restauranthome',
        destination: '/demo/panel_demo',
        permanent: true,
      },
      {
        source: '/menu',
        destination: '/demo/kuchnia_demo',
        permanent: true,
      },
      {
        source: '/staff',
        destination: '/demo/personel_demo',
        permanent: true,
      },
      {
        source: '/magazyn',
        destination: '/demo/magazyn_demo',
        permanent: true,
      },
      {
        source: '/inventory',
        destination: '/demo/magazyn_demo',
        permanent: true,
      },
      {
        source: '/home/zapasy',
        destination: '/home/magazyn',
        permanent: true,
      },
    ];
    return routes.flatMap(route => [
      route,
      ...(['pl', 'ru'] as const).map(locale => ({
        ...route,
        source: '/' + locale + route.source,
        destination: '/' + locale + route.destination,
      })),
    ]);
  },
};

export default nextConfig;
