import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Arena",
  description: "Pico & Pala duel in progress.",
  path: "/arena",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
