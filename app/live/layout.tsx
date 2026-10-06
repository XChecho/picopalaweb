import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Live Matches",
  description: "Watch Pico & Pala duels as they happen. Spectator mode is coming soon.",
  path: "/live",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
