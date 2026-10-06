import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Pico & Pala — 1v1 number deduction game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: "linear-gradient(135deg, #111319 0%, #1d1424 60%, #3a1230 100%)",
          color: "#e2e2ea",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={380} height={380} style={{ borderRadius: 56 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 600 }}>
          <div style={{ fontSize: 92, fontWeight: 800, color: "#ffffff", letterSpacing: -2 }}>Pico & Pala</div>
          <div style={{ fontSize: 38, color: "#ffb0ca", lineHeight: 1.25 }}>
            The 1v1 number deduction game
          </div>
          <div style={{ fontSize: 26, color: "#a98891" }}>Crack the 4-digit code before they crack yours</div>
        </div>
      </div>
    ),
    size,
  );
}
