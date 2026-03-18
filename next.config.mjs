import { withPayload } from '@payloadcms/next/withPayload'
import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // Vercel Blob Storage (production media)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      // YouTube thumbnails
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

const withMDX = createMDX({
  // MDX options can be added here
});

export default withPayload(withMDX(nextConfig));
