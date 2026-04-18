/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
};

module.exports = nextConfig;
