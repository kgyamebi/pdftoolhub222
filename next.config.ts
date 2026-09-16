import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js"],
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty.ts",
    },
  },
};

export default nextConfig;
