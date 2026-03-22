import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent webpack from bundling @react-pdf/renderer server-side.
  // It uses native Node.js modules that break when bundled — it must be
  // loaded directly from node_modules at runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
