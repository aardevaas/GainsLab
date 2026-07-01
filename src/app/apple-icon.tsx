import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#090D15",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "38px",
        }}
      >
        <div
          style={{
            color: "#FF8000",
            fontSize: 116,
            fontWeight: 800,
            fontFamily: "sans-serif",
            letterSpacing: "-4px",
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size },
  );
}
