import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 5 attachments at 5MB each on the create-task action,
      // plus overhead for multipart boundaries and other form fields.
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
