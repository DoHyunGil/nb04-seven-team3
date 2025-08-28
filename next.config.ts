import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류 무시
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/groups/:groupId((?!/new).)*",
        destination: "/groups/:groupId*/records",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "sprint-be-project.s3.ap-northeast-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "nb04-seven-team3-backend.onrender.com",
      },
      {
        protocol: "http",
        hostname: "nb04-seven-team3-frontend.onrender.com",
      },
    ],
  },
};

export default nextConfig;
