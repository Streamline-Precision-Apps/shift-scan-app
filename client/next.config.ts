import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === "true";

const nextConfig: NextConfig = {
  ...(isMobile ? { output: "export" as const } : {}),
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

const withNextIntl = createNextIntlPlugin("./i18n.ts");
const combinedConfig = withNextIntl(nextConfig);

module.exports = combinedConfig;
