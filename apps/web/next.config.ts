import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/service-worker/app-worker.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision }]
});

const nextConfig: NextConfig = {
  // ignore pg-native and cloudflare:sockets
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/
      })
    );

    return config;
  },
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.scdn.co"
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com"
      }
    ]
  }
};

export default withSerwist(nextConfig);
