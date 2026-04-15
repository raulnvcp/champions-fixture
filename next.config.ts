import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatar images
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
    ],
  },
};

export default nextConfig;
