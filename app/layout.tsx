import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pico & Pala — Descifra el código",
  description:
    "El juego de deducción de números para dos jugadores. Adivina el número secreto de tu rival antes de que él adivine el tuyo.",
  applicationName: "Pico & Pala",
  authors: [{ name: "Auron Tale Games" }],
  icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
  openGraph: {
    title: "Pico & Pala",
    description: "Crack the code · Descifra el código",
    type: "website",
    images: ["/images/logo.png"],
  },
  twitter: { card: "summary", title: "Pico & Pala" },
};

export const viewport: Viewport = {
  themeColor: "#1a1c22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cairo.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
