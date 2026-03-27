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
    // New robust highlight passing
    const specs = [
      searchParams.get("s1"),
      searchParams.get("s2"),
      searchParams.get("s3")
    ].filter(Boolean) as string[]

    const accentColor = type === "service" ? "#a855f7" : "#f59e0b"
    const accentBg = type === "service" ? "rgba(168, 85, 247, 0.1)" : "rgba(245, 158, 11, 0.1)"

    // Fetch image and convert to base64 for robustness in Edge Runtime
    let imageData: string | null = null
    if (image && image.startsWith("http")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

        const res = await fetch(image, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        })
        
        clearTimeout(timeoutId);

        if (res.ok) {
          const buffer = await res.arrayBuffer()
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
            backgroundColor: "#050505",
            color: "white",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* CONTENT AREA (60%) */}
          <div
            style={{
              width: "720px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "70px 60px 60px 80px",
              justifyContent: "space-between",
              zIndex: 10,
              backgroundColor: "#050505",
              position: "relative",
            }}
          >
            {/* Logo Section */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${accentColor} 0%, #000 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "white",
                }}
              >
                E
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "-1px" }}>EAGLE CHOICE</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#666", letterSpacing: "3px" }}>PREMIUM CATALOG</span>
              </div>
            </div>

            {/* Product Title & Brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: accentColor }} />
                <span style={{ fontSize: "16px", fontWeight: "900", color: accentColor, letterSpacing: "2.5px" }}>{type.toUpperCase()}</span>
              </div>
              <div
                style={{
                  fontSize: title.length > 18 ? "75px" : "90px",
                  fontWeight: "900",
                  lineHeight: "0.95",
                  letterSpacing: "-3px",
                  textShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                {title}
              </div>
              
              {/* Highlights Rendering */}
              {specs.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
                  {specs.map((spec, i) => (
                    <div 
                      key={i}
                      style={{ 
                        padding: "8px 16px", 
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#ccc"
                      }}
                    >
                      {spec}
                    </div>
                  ))}
                </div>
              ) : badge ? (
                <div style={{ fontSize: "24px", fontWeight: "600", color: "#888", marginTop: "10px" }}>{badge}</div>
              ) : null}
            </div>

            {/* Price section */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "25px", marginTop: "20px" }}>
              <div style={{ fontSize: "95px", fontWeight: "900", lineHeight: "1", letterSpacing: "-2px" }}>
                {price.replace('GH₵', 'GH')}
              </div>
              <div 
                style={{ 
                  padding: "10px 20px", 
                  backgroundColor: accentBg, 
                  borderRadius: "12px",
                  border: `1px solid ${accentColor}44`,
                  fontSize: "14px",
                  fontWeight: "900",
                  color: accentColor,
                  letterSpacing: "2px"
                }}
              >
                VERIFIED AUTHENTIC
              </div>
            </div>
          </div>

          {/* IMAGE AREA (40%) - ABSOLUTE CONTAINMENT TO PREVENT CROP */}
          <div
            style={{
              width: "480px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {imageData ? (
              <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyItems: "center", position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageData}
                  alt=""
                  style={{ 
                    maxWidth: "90%", // PREVENT OVERFLOW
                    maxHeight: "85%", // PREVENT OVERFLOW
                    objectFit: "contain",
                    margin: "auto",
                    zIndex: 2,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                  }}
                />
                
                {/* Background Shadow/Glow behind image */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at center, ${accentColor}15 0%, transparent 80%)`,
                  zIndex: 0
                }} />

                {/* THE FADE: Transition overlay from Content Area to Image Area */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "150px", // Gradient start area
                  background: "linear-gradient(to right, #050505 0%, #050505 10%, transparent 100%)",
                  zIndex: 10
                }} />
              </div>
            ) : (
              <div style={{ fontSize: "120px", fontWeight: "900", color: "#1a1a1a" }}>
                {type === "service" ? "SVC" : "PRD"}
              </div>
            )}
            
            {/* Watermark */}
            <div 
              style={{ 
                position: "absolute",
                bottom: "30px",
                right: "30px",
                fontSize: "14px",
                fontWeight: "900",
                color: "rgba(255,255,255,0.15)",
                letterSpacing: "2px",
                zIndex: 20
              }}
            >
              eaglechoice.vercel.app
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
    return new Response(`Failed to generate the image`, { status: 500 })
  }
}
