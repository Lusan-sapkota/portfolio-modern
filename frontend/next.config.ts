import type { NextConfig } from "next";

const ADMIN_ROUTE = process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: `${ADMIN_ROUTE}/:path*`, destination: "/admin/:path*" },
      { source: `${ADMIN_ROUTE}`, destination: "/admin" },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/", permanent: false },
      { source: "/admin/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
