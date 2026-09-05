import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet d'importer framer-motion correctement
  transpilePackages: [],
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
