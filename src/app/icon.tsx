import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            color: "#FF8000",
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "sans-serif",
            letterSpacing: "-1px",
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size },
  );
}
