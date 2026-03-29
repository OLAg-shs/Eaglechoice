"use client"

import { ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface BrandedProductCardProps {
  name: string
  price: string | number
  brand?: string
  specifications?: Record<string, string>
  imageUrl?: string
  brandColor?: string
  storeName?: string
  displayConfig?: {
    cardColor?: string
    backdropStyle?: "solid" | "gradient" | "glass" | "white"
    padding?: "sm" | "md" | "lg"
    elements?: { id: string; x: number; y: number; visible: boolean }[]
  }
}

export default function BrandedProductCard({ 
  name, 
  price, 
  brand, 
  specifications, 
  imageUrl, 
  brandColor = "#2563eb", 
  storeName = "Eagle Choice",
  displayConfig 
}: BrandedProductCardProps) {
  
  const getElementStyle = (id: string, defaultClass: string) => {
    const el = displayConfig?.elements?.find(e => e.id === id)
    if (el && !el.visible) return "hidden"
    return cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500", defaultClass)
  }

  const getElementPosition = (id: string) => {
    const el = displayConfig?.elements?.find(e => e.id === id)
    if (!el) return {}
    return { left: `${el.x}%`, top: `${el.y}%` }
  }

  const specs = specifications ? Object.entries(specifications) : []
  const backdrop = displayConfig?.backdropStyle || "white"

  return (
    <div 
      className={cn(
        "relative w-full aspect-[1.4/1] overflow-hidden rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.08)] border transition-all duration-700",
        backdrop === "white" ? "bg-white border-gray-100" : 
        backdrop === "solid" ? "border-white/10" : "bg-white border-gray-100"
      )}
      style={{ 
        backgroundColor: (backdrop === "solid" || backdrop === "white") ? (displayConfig?.cardColor || (backdrop === "white" ? "#fff" : brandColor)) : undefined,
        backgroundImage: backdrop === "gradient" ? `linear-gradient(135deg, ${brandColor}, #000)` : undefined
      }}
    >
      {/* 🟢 DRAGGABLE SUBJECT: The Product Image */}
      <div 
        className={getElementStyle("image", "w-[60%] h-[60%] flex items-center justify-center")}
        style={getElementPosition("image")}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-gray-50 rounded-[2rem] flex items-center justify-center">
            <span className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px]">No Product Image</span>
          </div>
        )}
      </div>

      {/* 🔴 DRAGGABLE ELEMENT: Store Branding */}
      <div 
        className={getElementStyle("branding", "flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-gray-50")}
        style={getElementPosition("branding")}
      >
        <div className="h-6 w-6 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ background: brandColor }}>
          <ShieldCheck className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{storeName}</span>
      </div>

      {/* 🔵 DRAGGABLE ELEMENT: Product Name */}
      <div 
        className={getElementStyle("name", "max-w-[40%] text-center md:text-left")}
        style={getElementPosition("name")}
      >
        <h3 className="text-3xl font-black tracking-tighter leading-[0.9] text-gray-900">
          {name || "Premium Product"}
        </h3>
        {brand && (
          <div className="mt-1 inline-flex items-center gap-2 group">
             <div className="w-1.5 h-1.5 rounded-full" style={{ background: brandColor }} />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-gray-900 transition-colors">{brand}</span>
          </div>
        )}
      </div>

      {/* 🟠 DRAGGABLE ELEMENT: Specifications Cluster */}
      <div 
        className={getElementStyle("specs", "flex flex-wrap gap-1.5 max-w-[50%] justify-center md:justify-start")}
        style={getElementPosition("specs")}
      >
        {specs.length > 0 ? specs.map(([key, value], idx) => (
          <div key={idx} className="px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100/50 flex items-center gap-2 shadow-sm">
            <span className="text-[8px] font-medium text-gray-400 uppercase tracking-tighter">{key}</span>
            <span className="text-[9px] font-black text-gray-900 tracking-tight">{value}</span>
          </div>
        )) : (
          <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 border-dashed text-[8px] font-black text-gray-300 uppercase tracking-widest">
            Detailed Intel
          </div>
        )}
      </div>

      {/* 💰 DRAGGABLE ELEMENT: Price Tag */}
      <div 
        className={getElementStyle("price", "flex flex-col items-center")}
        style={getElementPosition("price")}
      >
        <div className="relative group/price">
           <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 scale-150 group-hover:opacity-40 transition-opacity" />
           <div className="relative text-4xl font-black tracking-tighter text-orange-500 drop-shadow-sm">
             <span className="text-xl mr-1 opacity-60">₵</span>
             {Number(price).toLocaleString()}
           </div>
           <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
             <span className="text-[7px] font-black uppercase tracking-widest">Verified Listing</span>
           </div>
        </div>
      </div>

      {/* Bottom Subtle Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
         <span className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-400">{storeName.toLowerCase()}.vercel.app</span>
      </div>
    </div>
  )
}
