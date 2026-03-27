import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const title = searchParams.get("title") || "Eagle Choice"
    const price = searchParams.get("price") || ""
    const type = searchParams.get("type") || "product"
    const image = searchParams.get("image") || ""
    const badge = searchParams.get("badge") || ""

    const accentColor = type === "service" ? "rgba(168, 85, 247, 1)" : "rgba(245, 158, 11, 1)"
    const accentBg = type === "service" ? "rgba(168, 85, 247, 0.1)" : "rgba(245, 158, 11, 0.1)"

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "white",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Background Gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "linear-gradient(to bottom right, #111, #000)",
              zIndex: -1,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #333",
              backgroundColor: "#111",
            }}
          >
            {/* Left Column: Info */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "60px",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <div 
                  style={{
                    backgroundColor: accentColor,
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {type.toUpperCase()}
                </div>
              </div>

              <h1 style={{ fontSize: "64px", fontWeight: "bold", marginBottom: "10px", color: "white" }}>
                {title}
              </h1>
              
              {badge && (
                <div style={{ fontSize: "20px", color: "#888", marginBottom: "20px" }}>
                  {badge}
                </div>
              )}

              <div style={{ fontSize: "48px", fontWeight: "bold", color: accentColor }}>
                {price}
              </div>
            </div>

            {/* Right Column: Image */}
            <div
              style={{
                width: "450px",
                height: "100%",
                display: "flex",
                backgroundColor: "#000",
              }}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", fontSize: "100px" }}>
                  E
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(`OG Image Error: ${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
