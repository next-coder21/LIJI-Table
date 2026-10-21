import type { NextConfig } from "next";
import path from "node:path";

// Deployed as a static export under https://lijishwilson.in/liji-table/ (served
// by nginx `alias`, no Node process behind it) - so every internal link/asset
// must be prefixed with /liji-table, and next/image's optimization API (which
// needs a running server) has to be disabled in favor of unoptimized <img>.
const BASE_PATH = "/liji-table";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: `${BASE_PATH}/`,
  images: {
    unoptimized: true,
  },
  // next/image with unoptimized:true renders a plain <img src="..."> and does NOT
  // auto-prefix a hardcoded public/ path with basePath (that prefixing is normally
  // tied to the /_next/image optimization route, which is disabled here) - so
  // components read this at runtime to prefix src="/foo.png" themselves.
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
