import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir imágenes de Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pexhurygyzhhcdyvhlxs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
