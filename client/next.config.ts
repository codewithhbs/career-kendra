import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 🔥 This disables type errors during build
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol:"https",
        hostname:"i.ibb.co"
      },
        {
        protocol:"https",
        hostname:"www.aptohr.com"
      },
     {
        protocol: "http",
        hostname: "localhost",
        port: "9012",
        pathname: "/uploads/**",
      },
        {
        protocol:"http",
        hostname:"localhost"
      }
    ],
  },
};

export default nextConfig;
