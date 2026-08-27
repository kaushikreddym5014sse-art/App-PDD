import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/App-PDD",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
