import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para desenvolvimento com pouca memória
  experimental: {
    // Diminui overhead de hot reload
    optimizeCss: false,
  },
  // Configura webpack para usar menos memória
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Reduz threads em desenvolvimento
      config.parallelism = 1;
      // Limita cache do webpack
      config.cache = false;
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true, // evita parada por erro TS
  },
  eslint: {
    ignoreDuringBuilds: true, // não roda lint no build
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d4lgxe9bm8juw.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
