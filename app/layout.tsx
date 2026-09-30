import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import "./globals.css";

const DESCRIPTION =
  "The high-stakes tactical 1v1 number deduction mind-sport. Decode your opponent's 4-digit secret cipher with Pico and Pala strikes before they crack yours.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pico & Pala — 1v1 Number Deduction Game",
  description: DESCRIPTION,
  applicationName: "Pico & Pala",
  authors: [{ name: "Auron Tale Games" }],
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
  openGraph: {
    title: "Pico & Pala — 1v1 Number Deduction Game",
    description: DESCRIPTION,
    type: "website",
    images: ["/images/logo.png"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#111319",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Public+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#111319] text-[#e2e2ea] font-['Cairo',sans-serif] antialiased selection:bg-[#ff479b] selection:text-white">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
