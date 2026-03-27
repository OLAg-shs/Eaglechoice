import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get("title") || "Eagle Choice"
  const price = searchParams.get("price") || ""
  const type = searchParams.get("type") || "product" // "product" | "service"
  const image = searchParams.get("image") || ""
  const badge = searchParams.get("badge") || ""

  const accentColor = type === "service" ? "#a855f7" : "#f59e0b"
  const typeLabel = type === "service" ? "SERVICE" : "PRODUCT"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #111111 40%, #1a1200 100%)",
          display: "flex",
          flexDirection: "row",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold glow accent */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />

        {/* Left: Text Content */}
        <div
          style={{
            flex: 1,
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Brand header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              E
            </div>
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "22px", letterSpacing: "0.5px" }}>
              Eagle Choice
            </span>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Type badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}44`,
                borderRadius: "999px",
                padding: "6px 14px",
                width: "fit-content",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: accentColor,
                }}
              />
              <span style={{ color: accentColor, fontSize: "13px", fontWeight: "700", letterSpacing: "1.5px" }}>
                {typeLabel}
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                color: "#ffffff",
                fontSize: title.length > 30 ? "38px" : "48px",
                fontWeight: "800",
                lineHeight: "1.1",
                maxWidth: "550px",
              }}
            >
              {title}
            </div>

            {/* Badge (assigned agent or brand) */}
            {badge && (
              <div style={{ color: "#9ca3af", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#22c55e", fontSize: "14px" }}>✓</span>
                {badge}
              </div>
            )}

            {/* Price */}
            {price && (
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ color: accentColor, fontSize: "18px", fontWeight: "600" }}>Starting from</span>
                <span style={{ color: "#fff", fontSize: "40px", fontWeight: "900", letterSpacing: "-1px" }}>
                  {price}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4b5563", fontSize: "15px" }}>eaglechoice.vercel.app</span>
            <span style={{ color: "#374151", fontSize: "15px" }}>•</span>
            <span style={{ color: "#4b5563", fontSize: "15px" }}>Premium Quality. Trusted Agents.</span>
          </div>
        </div>

        {/* Right: Product Image */}
        {image ? (
          <div
            style={{
              width: "420px",
              height: "630px",
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            {/* Gradient overlay on left edge */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "120px",
                height: "100%",
                background: "linear-gradient(to right, #0a0a0a, transparent)",
                zIndex: 2,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          // Placeholder if no image
          <div
            style={{
              width: "420px",
              height: "630px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${accentColor}11, transparent)`,
              borderLeft: `1px solid ${accentColor}22`,
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "30px",
                background: `${accentColor}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "60px",
              }}
            >
              {type === "service" ? "📋" : "📦"}
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
