import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Emit a self-contained server bundle so the Docker runtime stage ships
     only the traced dependencies instead of the full node_modules tree. */
  output: "standalone",
};

export default nextConfig;
