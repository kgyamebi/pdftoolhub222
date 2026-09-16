import type { NextConfig } from "next";
import { SLUG_ALIASES } from "./src/lib/tools/aliases";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js"],
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty.ts",
    },
  },
  async redirects() {
    return Object.entries(SLUG_ALIASES).map(([source, destination]) => ({
      source: `/${source}`,
      destination: `/${destination}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
