import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Pico & Pala processes personal data under Colombian Law 1581 of 2012, and how to exercise your rights.",
  path: "/privacy",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
