import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions",
  description: "Terms and conditions of use of Pico & Pala.",
  path: "/terms",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
