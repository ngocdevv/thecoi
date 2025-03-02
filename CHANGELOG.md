# Changelog

## [Unreleased]

### Added

- Static export configuration for Next.js 15
- Build cache configuration for faster rebuilds
- New build scripts: `build:cached` and `clean-cache`
- Server component layouts with `generateStaticParams` for dynamic routes:
  - `/products/[id]`
  - `/orders/edit/[id]`
  - `/restaurant/[id]`
- Updated documentation in README.md with static export configuration details

### Changed

- Updated Next.js configuration in `next.config.mjs`
- Optimized package imports for `@heroicons/react` and `@headlessui/react`
- Fixed ESLint configuration to ignore errors during builds

### Fixed

- Resolved issue with dynamic routes in static export by adding `generateStaticParams`
- Fixed configuration warnings in Next.js build
- Improved build performance with proper caching
- Fixed type errors in dynamic route components by using proper interface definitions for params props
  - Updated `/products/[id]/page.tsx`
  - Updated `/orders/edit/[id]/page.tsx`
  - Updated `/restaurant/[id]/page.tsx`
