import { withPayload } from "@payloadcms/next/withPayload"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@konzert/database", "@konzert/types"],
}

export default withPayload(nextConfig)
