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

    // Robust colors inspired by the site's UI
    const accentColor = "#f59e0b" // Orange/Amber
    const priceColor = "#f59e0b"

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
            flexDirection: "column",
            backgroundColor: "#fcfcfc", // Very clean off-white
            fontFamily: "sans-serif",
            padding: "30px",
            position: "relative",
          }}
        >
          {/* Main Card Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              backgroundColor: "white",
              borderRadius: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
              border: "1px solid #eeeeee",
              overflow: "hidden",
            }}
          >
            {/* Header: Site Name */}
            <div style={{
              padding: "20px 40px",
              borderBottom: "1px solid #f5f5f5",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "900",
                color: "white"
              }}>E</div>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "#111", letterSpacing: "-1px" }}>Eagle Choice</span>
            </div>

            {/* Image Area (Large) */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "40px",
              position: "relative",
            }}>
              {imageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageData}
                  alt=""
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "100%", 
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ fontSize: "100px", fontWeight: "900", color: "#f0f0f0" }}>
                  {type.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content Footer (Title & Price) */}
            <div style={{
              padding: "40px 50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              background: "linear-gradient(to top, #ffffff, #fafafa)",
              borderTop: "1px solid #f5f5f5"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "60%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                   <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: accentColor }} />
                   <span style={{ fontSize: "14px", fontWeight: "800", color: "#888", letterSpacing: "2px" }}>{type.toUpperCase()}</span>
                </div>
                <div style={{ 
                  fontSize: title.length > 20 ? "48px" : "64px", 
                  fontWeight: "900", 
                  color: "#111", 
                  lineHeight: "1",
                  letterSpacing: "-2px"
                }}>
                  {title}
                </div>
                {specs.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    {specs.map((spec, i) => (
                      <div key={i} style={{ 
                        fontSize: "18px", 
                        color: "#666", 
                        fontWeight: "600",
                        padding: "4px 12px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px"
                      }}>{spec}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <div style={{ 
                  fontSize: "56px", 
                  fontWeight: "900", 
                  color: priceColor,
                  lineHeight: "1",
                  letterSpacing: "-1px"
                }}>
                  {price.replace('GH₵', 'GH')}
                </div>
                <div style={{
                  padding: "6px 14px",
                  backgroundColor: "#ecfdf5",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "900",
                  color: "#10b981", // Green for stock
                  letterSpacing: "1px"
                }}>VERIFIED LISTING</div>
              </div>
            </div>
          </div>
          
          {/* Footer Watermark */}
          <div style={{
            position: "absolute",
            bottom: "45px",
            right: "80px",
            fontSize: "12px",
            color: "rgba(0,0,0,0.2)",
            fontWeight: "bold",
            letterSpacing: "1px"
          }}>eaglechoice.vercel.app</div>
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
