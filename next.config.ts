import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para desenvolvimento com pouca memória
  experimental: {
    // Diminui overhead de hot reload
    optimizeCss: false,
  },
  // Configuração para Turbopack (Next.js 16+)
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true, // evita parada por erro TS
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
