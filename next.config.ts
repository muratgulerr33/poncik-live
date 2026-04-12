import type { NextConfig } from "next";

function readAllowedDevOrigins() {
  const rawValue = process.env.DEV_ALLOWED_ORIGINS;

  if (!rawValue) {
    return undefined;
  }

  const origins = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : undefined;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: readAllowedDevOrigins()
};

export default nextConfig;
