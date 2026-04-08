import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para deploy otimizado em produção (Docker/Coolify)
  output: "standalone",
};

export default nextConfig;

