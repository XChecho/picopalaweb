import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets e2e builds (e.g. with a Turnstile site key) live next to the regular build.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Imagen Docker: bundle autocontenido (`server.js`). Solo se activa en el Dockerfile para no afectar CI/e2e.
  output: process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
