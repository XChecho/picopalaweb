import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Auron Tale Games" }],
  creator: "Auron Tale Games",
  publisher: "Auron Tale Games",
  keywords: ["Pico y Pala", "number game", "deduction game", "1v1", "brain game", "juego de deducción", "juego de números"],
  alternates: { canonical: "/" },
  // The transparent logo reads best on browser tabs; iOS needs an opaque background.
  icons: {
    icon: [{ url: "/images/logoNotBack.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/images/logoNotBack.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    locale: "en_US",
    alternateLocale: ["es_CO", "pt_BR"],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
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
