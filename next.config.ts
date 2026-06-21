import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling these — they must resolve from node_modules at runtime
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jsonwebtoken"],
};

export default nextConfig;
