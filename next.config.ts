import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pino/pino-pretty rely on dynamic requires that bundlers choke on; keep them
  // as runtime Node modules.
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
};

export default nextConfig;
