import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiOrigin = (process.env.ADMIN_API_ORIGIN ?? 'http://localhost:5000').replace(/\/$/, '')

    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
