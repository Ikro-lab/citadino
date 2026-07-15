import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff6a00",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        C
      </div>
    ),
    { width: 192, height: 192 }
  );
}
