import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/:path*`,
      },
    ];
  },
  transpilePackages: [
    "deck.gl",
    "@deck.gl/core",
    "@deck.gl/layers",
    "@deck.gl/react",
    "@deck.gl/geo-layers",
    "@deck.gl/aggregation-layers",
    "react-map-gl",
  ],
};

export default nextConfig;
