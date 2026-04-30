import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@usesendnow/ui", "@usesendnow/types"],
};

export default nextConfig;
