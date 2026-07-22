import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoPath = path.join(process.cwd(), "public", "logo-mark.png");
  const logoBase64 = readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#05060d",
          backgroundImage:
            "linear-gradient(to right, #1b2138 1px, transparent 1px), linear-gradient(to bottom, #1b2138 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={48} height={48} alt="" />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#eef1f8" }}>liji-table</div>
        </div>

        <div style={{ display: "flex", marginTop: 48, fontSize: 64, fontWeight: 700, color: "#eef1f8", lineHeight: 1.1 }}>
          One table engine.
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: "#4fd6ff" }}>
          Every framework.
        </div>

        <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "#8b93a7", maxWidth: 820 }}>
          Headless core · React · Angular · prebuilt UI — ~12kB, MIT licensed.
        </div>
      </div>
    ),
    { ...size }
  );
}
