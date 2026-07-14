import type { NextConfig } from "next";
import pwa from "next-pwa";
import { runtimeCaching } from "next-pwa/cache";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  experimental: { serverActions: { allowedOrigins: ["localhost:3000"] } },
};

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
};

export default pwa(pwaConfig)(nextConfig);
