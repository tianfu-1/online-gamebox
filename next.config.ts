import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.kpopgamesgo.com",
      },
    ],
  },
};

export default nextConfig;
