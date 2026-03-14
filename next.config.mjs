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
    ],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

const withMDX = createMDX({
  // MDX options can be added here
});

export default withMDX(nextConfig);
