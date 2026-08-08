import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: { formats: ["image/avif", "image/webp"] },
    reactCompiler: true,
    experimental: { viewTransition: true },
};

export default nextConfig;
