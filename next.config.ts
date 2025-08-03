import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  experimental: {
    // 支持大文件上传
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

export default nextConfig;
