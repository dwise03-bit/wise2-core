import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "/petals-and-potions",
  images: { unoptimized: true },
  async headers() {
    return [{ source: "/petals-and-potions/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }] }];
  },
};

export default nextConfig;
