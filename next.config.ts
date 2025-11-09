import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kpopgamesgo.com",
      },
    ],
  },
};

export default nextConfig;
