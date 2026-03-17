import { withPayload } from '@payloadcms/next'
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.0.0.127'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bedcave.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.bedcave.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.optimole.com',
        pathname: '/**',
      },
      // Payload CMS media (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**',
      },
      // Payload CMS media (production) — add when Payload production URL is known:
      // { protocol: 'https', hostname: 'cms.bedcave.com', pathname: '/media/**' },
    ],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

const withMDX = createMDX({
  // MDX options can be added here
});

export default withPayload(withMDX(nextConfig));
