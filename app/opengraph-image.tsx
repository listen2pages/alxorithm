import { ImageResponse } from "next/og";
export const alt =
  "alxorithm — sales, kitchen, inventory and staff in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#faf7f2",
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 70,
        color: "#3f2716",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "72%" }}>
        <div style={{ fontSize: 25, color: "#19613e", fontWeight: 700 }}>
          {" alxorithm "}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -3,
            marginTop: 55,
          }}
        >
          <span>{"Fewer spreadsheets."}</span>
          <span style={{ color: "#19613e" }}>{"More control."}</span>
        </div>
        <div style={{ fontSize: 23, marginTop: 35, color: "#756b60" }}>
          {" Sales · Kitchen · Inventory · Staff "}</div>
        <div style={{ fontSize: 18, marginTop: 35 }}>
          {" Hospitality management software "}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 90,
          display: "flex",
          alignItems: "flex-end",
          gap: 13,
          height: 230,
        }}
      >
        {[70, 105, 90, 145, 170, 220].map((h, i) => (
          <div
            key={i}
            style={{
              width: 35,
              height: h,
              borderRadius: "8px 8px 0 0",
              background: i === 5 ? "#19613e" : "#b87333",
              opacity: 0.5 + i * 0.1,
            }}
          />
        ))}
      </div>
    </div>,
    size,
  );
}
