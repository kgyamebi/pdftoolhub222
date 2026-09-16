import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#b4532a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fffaf4",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        H
      </div>
    ),
    size,
  );
}
