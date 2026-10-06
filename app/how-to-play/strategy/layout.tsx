import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Advanced Strategy",
  description: "Win more Pico & Pala duels: the best opening, how to use every clue, consistent guesses and a full worked example solved in five turns.",
  path: "/how-to-play/strategy",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
