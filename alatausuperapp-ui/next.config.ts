import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
