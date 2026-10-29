import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Unsplash е само за placeholder снимките — махни го, когато сложиш истинските в /public
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
