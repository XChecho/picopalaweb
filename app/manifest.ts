import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#111319",
    theme_color: "#111319",
    icons: [
      { src: "/images/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/logoNotBack.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
