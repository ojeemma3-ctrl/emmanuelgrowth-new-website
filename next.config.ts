import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Get More Reviews page moved from /build-trust to /get-more-reviews.
  async redirects() {
    return [{ source: '/build-trust', destination: '/get-more-reviews', permanent: true }];
  },
};

export default nextConfig;
