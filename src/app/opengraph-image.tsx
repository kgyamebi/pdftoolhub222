import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f6f3ec",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "#1c2430",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#b4532a" }}>PDF Tools Hub</div>
        <div style={{ fontSize: 64, fontWeight: 650, marginTop: 18, maxWidth: 900 }}>{APP_TAGLINE}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#5c6570" }}>Convert · Compress · Organize · Protect</div>
      </div>
    ),
    size,
  );
}
