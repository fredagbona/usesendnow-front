import type { NextConfig } from "next"
import { landingBrand } from "./lib/brand"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog",
        destination: landingBrand.blogUrl,
        permanent: true,
      },
    ]
  },
}

export default nextConfig
