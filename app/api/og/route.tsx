import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get("debug") === "true") {
      return new Response(`OG Route Reachable. Title: ${searchParams.get("title")}`, { status: 200 })
    }

    const title = searchParams.get("title") || "Eagle Choice"
    const price = searchParams.get("price") || ""
    const type = searchParams.get("type") || "product"
    const image = searchParams.get("image") || ""
    const badge = searchParams.get("badge") || ""

    // Fetch image and convert to base64 for robustness in Edge Runtime
    let imageData: string | null = null
    if (image && image.startsWith("http")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

        const res = await fetch(image, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        })
        
        clearTimeout(timeoutId);

        if (res.ok) {
          const buffer = await res.arrayBuffer()
          // Robust base64 conversion using Buffer (available in Vercel Edge)
          const base64 = Buffer.from(buffer).toString('base64')
          const contentType = res.headers.get("content-type") || "image/jpeg"
          imageData = `data:${contentType};base64,${base64}`
        }
      } catch (e) {
        console.error("Failed to fetch image for OG:", e)
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#0a0a0a",
            color: "white",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Main Background with Dark Gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #0a0a0a 0%, #151515 100%)",
              zIndex: -1,
            }}
          />

          {/* Left Side: Product Info */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "60px",
              justifyContent: "space-between",
              zIndex: 10,
            }}
          >
            {/* Header: Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#000",
                }}
              >
                E
              </div>
              <span style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "0.5px" }}>Eagle Choice</span>
            </div>

            {/* Middle: Title & Price */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  width: "fit-content",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accentColor }} />
                <span style={{ fontSize: "14px", fontWeight: "bold", color: accentColor, letterSpacing: "1px" }}>
                  {type.toUpperCase()}
                </span>
              </div>

              <div
                style={{
                  fontSize: title.length > 25 ? "42px" : "56px",
                  fontWeight: "900",
                  lineHeight: "1.1",
                  color: "white",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                }}
              >
                {title}
              </div>

              {badge && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", fontSize: "18px" }}>
                  <div style={{ width: "12px", height: "1px", background: "#4b5563" }} />
                  {badge}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "10px" }}>
                <span style={{ fontSize: "56px", fontWeight: "900", color: "white" }}>
                  {price.replace('GH₵', 'GH')}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#4b5563" }}>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>eaglechoice.vercel.app</span>
              <span style={{ fontSize: "16px" }}>•</span>
              <span style={{ fontSize: "16px" }}>Premium Catalog</span>
            </div>
          </div>

          {/* Right Side: Image Placeholder or Product Image */}
          <div
            style={{
              width: "480px",
              height: "100%",
              display: "flex",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Elegant Side Fade */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "120px",
                background: "linear-gradient(to right, #0a0a0a, transparent)",
                zIndex: 2,
              }}
            />

            {imageData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageData}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#151515",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "120px",
                  color: accentColor,
                  borderLeft: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {type === "service" ? "SVC" : "PRD"}
              </div>
            )}
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
