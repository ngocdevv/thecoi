/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static exports
  basePath: process.env.NODE_ENV === "production" ? "/thecoi" : "", // Set the base path for GitHub Pages
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true, // Ignore ESLint errors during builds
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true, // Ignore TypeScript errors during builds
  },
  // Enable build cache for faster rebuilds
  experimental: {
    // Enable optimizations
    optimizePackageImports: ["@heroicons/react", "@headlessui/react"],
  },
  // Configure output caching
  distDir: process.env.BUILD_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "media.be.com.vn",
      },
    ],
    unoptimized: true, // Disable image optimization
  },
};

export default nextConfig;
