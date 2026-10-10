import type { NextConfig } from "next";

// The site is exported as plain static files (HTML/JS/CSS) so it can be hosted on GitHub Pages
// (or any static host). All data access happens in the browser against Supabase.
// NEXT_PUBLIC_BASE_PATH is set by the deploy workflow, e.g. "/my-repo" for project pages, "" for a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
