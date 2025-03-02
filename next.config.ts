import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Enable static exports
  basePath: process.env.NODE_ENV === 'production' ? '/thecoi' : '',  // Set the base path for GitHub Pages
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'media.be.com.vn',
      }
    ],
    unoptimized: true,
  },
};

export default nextConfig;
