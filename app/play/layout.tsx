import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Play Hub",
  description: "Pick a game mode and start a Pico & Pala duel.",
  path: "/play",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
