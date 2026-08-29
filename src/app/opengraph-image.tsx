import { ImageResponse } from "next/og";

export const alt = "Launch48: 48 hours, $149, 3 revisions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 72px",
        background: "#f4f4f0",
        color: "#11110f",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1.8px" }}>Launch48</span>
        <span
          style={{
            display: "flex",
            padding: "15px 24px",
            borderRadius: 999,
            background: "#b8f34a",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Start for $149
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 750, lineHeight: 0.94, letterSpacing: "-6px" }}>
        <span>Your website.</span>
        <span>Live in 48 hours.</span>
      </div>
      <div style={{ display: "flex", gap: 44, fontSize: 25, fontWeight: 600 }}>
        <span>48 hours</span>
        <span>$149</span>
        <span>3 revisions</span>
      </div>
    </div>,
    size,
  );
}
