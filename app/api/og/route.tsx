import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get("debug") === "true") {
      return new Response(`OG Route Reachable.`, { status: 200 })
    }

    let title = searchParams.get("title") || "Eagle Choice"
    let price = searchParams.get("price") || ""
    let type = searchParams.get("type") || "product"
    let image = searchParams.get("image") || ""
    
    // Parse legacy specs from URL
    let specsData: { key: string, value: string }[] = []
    const s1 = searchParams.get("s1")
    const s2 = searchParams.get("s2")
    const s3 = searchParams.get("s3")
    if (s1) specsData.push({ key: "Feature 1", value: s1 })
    if (s2) specsData.push({ key: "Feature 2", value: s2 })
    if (s3) specsData.push({ key: "Feature 3", value: s3 })

    const id = searchParams.get("id")
    
    // Server-side lookup for shorter URLs
    if (id) {
      const supabase = await createAdminClient()
      if (type === "product") {
        const { data: p } = await supabase.from("products").select("name, price, images, specifications").eq("id", id).single()
        if (p) {
          title = p.name
          price = formatCurrency(p.price)
          image = p.images?.[0] || image
          if (p.specifications && typeof p.specifications === 'object') {
            specsData = Object.entries(p.specifications).slice(0, 8).map(([k, v]) => ({ key: String(k), value: String(v) }))
          }
        }
      } else if (type === "service") {
        const { data: s } = await supabase.from("services").select("name, base_price, cover_image_url, required_documents").eq("id", id).single()
        if (s) {
          title = s.name
          price = formatCurrency(s.base_price)
          image = s.cover_image_url || image
          if (Array.isArray(s.required_documents)) {
            specsData = s.required_documents.slice(0, 6).map((doc, i) => ({ key: `Document ${i+1}`, value: String(doc) }))
          }
        }
      }
    }

    const accentColor = "#f59e0b" // Amber
    const priceColor = "#f59e0b"

    let imageData: string | null = null
    if (image && image.startsWith("http")) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 7000)

        const res = await fetch(image, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          }
        })
        
        clearTimeout(timeoutId)

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

    const response = new ImageResponse(
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

            {/* Image Area (Large directly centered on top) */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "15px",
              position: "relative",
            }}>
              {imageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageData}
                  alt=""
                  style={{ 
                    width: "100%", 
                    height: "380px", 
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div style={{ fontSize: "100px", fontWeight: "900", color: "#f0f0f0" }}>
                  {type.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content Footer (Title, Specs, & Price) */}
            <div style={{
              padding: "40px 50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              background: "linear-gradient(to top, #ffffff, #fafafa)",
              borderTop: "1px solid #f5f5f5"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "65%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                   <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: accentColor }} />
                   <span style={{ fontSize: "14px", fontWeight: "800", color: "#888", letterSpacing: "2px" }}>{type.toUpperCase()}</span>
                </div>
                <div style={{ 
                  fontSize: title.length > 30 ? "46px" : "60px", 
                  fontWeight: "900", 
                  color: "#111", 
                  lineHeight: "1.1",
                  letterSpacing: "-2px"
                }}>
                  {title}
                </div>
                {/* Horizontal Dot-Separated Specs */}
                {specsData.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                    {specsData.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ 
                          fontSize: "16px", 
                          color: "#666", 
                          fontWeight: "600",
                          backgroundColor: "#f4f4f5",
                          padding: "4px 12px",
                          borderRadius: "20px"
                        }}>
                          {s.value}
                        </span>
                        {i < specsData.length - 1 && (
                          <span style={{ margin: "0 4px", color: "#d4d4d8", fontSize: "18px" }}>•</span>
                        )}
                      </div>
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
                  padding: "8px 16px",
                  backgroundColor: "#ecfdf5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "900",
                  color: "#10b981", // Green for stock
                  letterSpacing: "1px"
                }}>VERIFIED LISTING</div>
              </div>
            </div>
          </div>
          
          {/* Footer Web Watermark */}
          <div style={{
            position: "absolute",
            bottom: "45px",
            right: "80px",
            fontSize: "14px",
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

    if (searchParams.get("download") === "1") {
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_branded_card.png`
      response.headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    }

    return response
  } catch (e: any) {
    console.error(`OG Image Error: ${e.message}`)
    return new Response(`Failed to generate the image`, { status: 500 })
  }
}

