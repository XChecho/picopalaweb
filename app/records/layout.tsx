import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Records",
  description: "Your Pico & Pala match history, win streaks and statistics against the AI.",
  path: "/records",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
