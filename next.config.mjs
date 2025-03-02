/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/thecoi" : "", // Set the base path for GitHub Pages
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Configure images properly for Next.js 15
  images: {
    domains: ["via.placeholder.com", "media.be.com.vn"],
    unoptimized: true,
  },
};

export default nextConfig;
