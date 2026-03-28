"use client"

import { useState, useRef } from "react"
import { Download, Store, Users, Package, QrCode, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BrandedCardProps {
  store: any
  productCount: number
  agentCount: number
}

export default function BrandedCardClient({ store, productCount, agentCount }: BrandedCardProps) {
  const [showAgents, setShowAgents] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  const [showQR, setShowQR] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const brandColor = store.brand_color || "#2563eb"
  const storeUrl = `https://eaglechoice.vercel.app/stores/${store.slug}`

  async function handleDownload() {
    setDownloading(true)
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current!, { scale: 3, backgroundColor: null, useCORS: true })
      const link = document.createElement("a")
      link.download = `${store.slug}-store-card.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (e) {
      // Fallback: open print dialog
      window.print()
    }
    setDownloading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branded Store Card</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a shareable card for WhatsApp, Instagram, and more</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Card Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Show Agent Count", value: showAgents, set: setShowAgents },
            { label: "Show Product Count", value: showProducts, set: setShowProducts },
            { label: "Show QR Code", value: showQR, set: setShowQR },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center gap-3">
              <Switch id={label} checked={value} onCheckedChange={set} />
              <Label htmlFor={label} className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Card Preview */}
      <div>
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Preview</p>
        <div
          ref={cardRef}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${brandColor}ee 0%, ${brandColor} 60%, #000000aa 100%)`,
            minHeight: 280,
            fontFamily: "'Inter', sans-serif",
          }}>
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />

          {/* Eagle Choice watermark */}
          <div className="absolute bottom-4 right-4 opacity-30 text-white text-[10px] font-bold tracking-widest">
            EAGLE CHOICE
          </div>

          <div className="relative z-10 p-8">
            {/* Store identity */}
            <div className="flex items-center gap-4 mb-6">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-white/30 shadow-xl" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-extrabold shadow-xl">
                  {store.name[0]}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{store.name}</h2>
                {store.tagline && <p className="text-white/70 text-sm mt-0.5">{store.tagline}</p>}
              </div>
            </div>

            {/* Category tags */}
            {(store.category_tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {store.category_tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-5 mb-6">
              {showProducts && (
                <div className="flex items-center gap-2 text-white">
                  <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-none">{productCount}</p>
                    <p className="text-white/60 text-[10px]">Products</p>
                  </div>
                </div>
              )}
              {showAgents && agentCount > 0 && (
                <div className="flex items-center gap-2 text-white">
                  <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-none">{agentCount}</p>
                    <p className="text-white/60 text-[10px]">Agents</p>
                  </div>
                </div>
              )}
            </div>

            {/* URL + QR */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Find us at</p>
                <p className="text-white font-mono text-xs break-all">{storeUrl}</p>
              </div>
              {showQR && (
                <div className="h-14 w-14 rounded-xl bg-white flex items-center justify-center shrink-0 ml-4">
                  {/* Simple QR placeholder — real implementation can use qrcode library */}
                  <QrCode className="h-10 w-10 text-gray-800" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <Button onClick={handleDownload} disabled={downloading} className="w-full text-white border-none font-semibold h-12"
        style={{ background: brandColor }}>
        {downloading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</> : <><Download className="h-4 w-4 mr-2" />Download as PNG</>}
      </Button>

      <p className="text-center text-xs text-gray-400">Share this card on WhatsApp, Instagram, X, or print it as a flyer.</p>
    </div>
  )
}
