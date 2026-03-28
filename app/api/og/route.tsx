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
            backgroundColor: "#f4f4f5", // Light gray background
            fontFamily: "sans-serif",
            padding: "30px",
            position: "relative",
          }}
        >
          {/* Main Card Container shadow and border */}
          <div
            style={{
              display: "flex",
              flex: 1,
              backgroundColor: "white",
              borderRadius: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
              border: "1px solid #e4e4e7",
              overflow: "hidden",
            }}
          >
            {/* Left Side: Product Image Showcase */}
            <div style={{
              flex: "0 0 500px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRight: "1px solid #f4f4f5",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            }}>
               {imageData ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img
                   src={imageData}
                   alt=""
                   style={{ 
                     maxWidth: "100%", 
                     maxHeight: "450px", 
                     objectFit: "contain",
                   }}
                 />
               ) : (
                 <div style={{ fontSize: "120px", fontWeight: "900", color: "#f4f4f5" }}>
                   {type.slice(0, 3).toUpperCase()}
                 </div>
               )}
            </div>

            {/* Right Side: Details & Specs */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fafafa",
              padding: "50px 60px",
            }}>
              {/* Header Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
                 <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: accentColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 }}>E</div>
                 <span style={{ fontSize: 26, fontWeight: 900, color: "#111", letterSpacing: "-1px" }}>Eagle Choice</span>
              </div>

              {/* Type Category */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                 <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: accentColor }} />
                 <span style={{ fontSize: 13, fontWeight: 900, color: "#888", letterSpacing: "3px" }}>{type.toUpperCase()}</span>
              </div>

              {/* Title */}
              <div style={{ 
                fontSize: title.length > 50 ? "36px" : title.length > 30 ? "42px" : "48px", 
                fontWeight: 900, 
                color: "#111", 
                lineHeight: 1.1, 
                letterSpacing: "-1.5px", 
                marginBottom: "30px" 
              }}>
                {title}
              </div>

              {/* Price & Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                <div style={{ fontSize: "48px", fontWeight: 900, color: priceColor, letterSpacing: "-1px" }}>
                  {price.replace('GH₵', 'GH')}
                </div>
                <div style={{ padding: "8px 16px", backgroundColor: "#ecfdf5", borderRadius: 8, fontSize: 13, fontWeight: 900, color: "#10b981", letterSpacing: "1px" }}>
                   VERIFIED LISTING
                </div>
              </div>

              {/* Specifications Grid */}
              {specsData.length > 0 && (
                 <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    {specsData.map((s, i) => (
                        <div key={i} style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          backgroundColor: "white", 
                          padding: "12px 16px", 
                          borderRadius: "12px", 
                          border: "1px solid #e4e4e7", 
                          width: "250px" 
                        }}>
                           <span style={{ 
                             fontSize: 12, 
                             fontWeight: 900, 
                             color: "#a1a1aa", 
                             textTransform: "uppercase", 
                             letterSpacing: "1px",
                             marginBottom: "4px" 
                           }}>
                             {s.key.replace('_', ' ')}
                           </span>
                           <span style={{ 
                             fontSize: 18, 
                             fontWeight: 800, 
                             color: "#27272a",
                             lineHeight: 1.2,
                             // Truncate text if it's too long
                             overflow: "hidden",
                             textOverflow: "ellipsis",
                             whiteSpace: "nowrap"
                           }}>
                             {s.value}
                           </span>
                        </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
          
          {/* Footer Web Watermark */}
          <div style={{
            position: "absolute",
            bottom: "50px",
            right: "50px",
            padding: "10px 20px",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: "20px",
            fontSize: "14px",
            color: "#aaa",
            fontWeight: "bold",
            letterSpacing: "1px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
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

