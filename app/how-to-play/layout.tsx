import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How to Play",
  description: "Learn the rules of Pico & Pala: how to set your secret, read Pico and Pala clues and crack the 4-digit code in 12 turns.",
  path: "/how-to-play",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
