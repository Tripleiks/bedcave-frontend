import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
