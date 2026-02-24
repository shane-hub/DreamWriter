import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/huobao/:path*',
        destination: 'http://localhost:5678/api/v1/:path*' // Proxy to Huobao backend
      }
    ];
  },
};

export default nextConfig;
