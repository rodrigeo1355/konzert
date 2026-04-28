import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@konzert/database", "@konzert/types", "@konzert/emails"],
  serverExternalPackages: ["argon2", "jose"],
}

export default withPayload(nextConfig)
