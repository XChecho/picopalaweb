import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets e2e builds (e.g. with a Turnstile site key) live next to the regular build.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
