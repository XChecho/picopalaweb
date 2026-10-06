import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in or create your Pico & Pala account.",
  path: "/auth",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
