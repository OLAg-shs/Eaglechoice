"use client"

import { Shield, Sparkles, Zap, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChoiceCardProps {
  name: string
  tagline?: string
  color: string
  layout: "landscape" | "portrait"
  theme: "midnight" | "gold" | "neon" | "minimal"
  socials?: { instagram?: string; x?: string; facebook?: string }
  layoutData?: {
    borderRadius?: string
    backgroundColor?: string
    elements?: { id: string; x: number; y: number; visible: boolean }[]
  }
}

export default function ChoiceCardPreview({ name, tagline, color, layout, theme, socials, layoutData }: ChoiceCardProps) {
  const isMidnight = theme === "midnight"
  const isGold = theme === "gold"
  const isNeon = theme === "neon"

  const getElementStyle = (id: string, defaultClass: string) => {
    const el = layoutData?.elements?.find(e => e.id === id)
    if (!el) return defaultClass
    if (!el.visible) return "hidden"
    return cn("absolute -translate-x-1/2 -translate-y-1/2", defaultClass)
  }

  const getElementPosition = (id: string) => {
    const el = layoutData?.elements?.find(e => e.id === id)
    if (!el) return {}
    return { left: `${el.x}%`, top: `${el.y}%` }
  }

  return (
    <div 
      className={cn(
        "relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_40px_100px_rgba(0,0,0,0.15)] group/card",
        layout === "landscape" ? "aspect-[1.6/1] w-full" : "aspect-[1/1.6] h-[400px] w-auto mx-auto",
        "overflow-hidden p-8 border border-white/20",
        isMidnight ? "bg-[#0b0f1a]" : 
        isGold ? "bg-gradient-to-br from-[#1a1c2c] to-[#4a3f35]" : 
        isNeon ? "bg-[#050505]" : "bg-white"
      )}
      style={{ 
        borderRadius: layoutData?.borderRadius || "2.5rem",
        backgroundColor: layoutData?.backgroundColor || undefined
      }}
    >
      
      {/* Background Accents (only for dark themes) */}
      {(isMidnight || isGold || isNeon) && (
        <div className={cn(
          "absolute -top-1/2 -right-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-40 transition-colors duration-1000",
          isNeon ? "bg-purple-600" : "bg-blue-600"
        )} />
      )}
      
      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        
        {/* Element: Logo/Header */}
        <div 
          className={getElementStyle("header", "flex justify-between items-start w-full relative")}
          style={getElementPosition("header")}
        >
          <div className="flex flex-col gap-1">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
              isGold ? "bg-yellow-500/20 text-yellow-500" : "bg-blue-600/20 text-blue-500"
            )}>
              <Shield className="h-5 w-5 fill-current" />
            </div>
          </div>
          
          <div className={cn(
            "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
            isMidnight || isGold || isNeon ? "bg-white/5 border-white/10 text-white/60" : "bg-gray-50 border-gray-100 text-gray-500"
          )}>
            Boutique Owner
          </div>
        </div>

        {/* Element: Store Name & Tagline (Identity) */}
        <div 
          className={getElementStyle("identity", "space-y-4")}
          style={getElementPosition("identity")}
        >
          <div className="space-y-1">
            <h3 className={cn(
              "text-3xl font-black tracking-tighter leading-none",
              isMidnight || isGold || isNeon ? "text-white" : "text-gray-900"
            )}>
              {name || "Your Boutique"}
            </h3>
            <p className={cn(
              "text-xs font-medium italic opacity-60",
              isMidnight || isGold || isNeon ? "text-blue-100" : "text-gray-500"
            )}>
              {tagline || "Your Premium Tagline Here"}
            </p>
          </div>
          
          {/* Badge Group */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              <span className="text-[7px] font-black uppercase tracking-widest text-blue-400">Verified</span>
            </div>
          </div>
        </div>

        {/* Element: Social Presence */}
        <div 
          className={cn(
            getElementStyle("socials", "flex gap-4 pt-1 opacity-80"),
            !(socials && (socials.instagram || socials.facebook)) && "hidden"
          )}
          style={getElementPosition("socials")}
        >
          {socials?.instagram && (
            <div className="flex items-center gap-1.5">
              <div className={cn("h-4 w-4 rounded flex items-center justify-center text-[7px] font-black", isMidnight || isGold || isNeon ? "bg-white/10 text-white" : "bg-gray-100 text-gray-500")}>IG</div>
              <span className={cn("text-[8px] font-bold tracking-widest", isMidnight || isGold || isNeon ? "text-white/60" : "text-gray-500")}>{socials.instagram}</span>
            </div>
          )}
          {socials?.facebook && (
            <div className="flex items-center gap-1.5">
              <div className={cn("h-4 w-4 rounded flex items-center justify-center text-[7px] font-black", isMidnight || isGold || isNeon ? "bg-white/10 text-white" : "bg-gray-100 text-gray-500")}>FB</div>
              <span className={cn("text-[8px] font-bold tracking-widest", isMidnight || isGold || isNeon ? "text-white/60" : "text-gray-500")}>{socials.facebook}</span>
            </div>
          )}
        </div>

        {/* Element: Member ID / Metadata */}
        <div 
          className={getElementStyle("footer", "flex justify-between items-end w-full")}
          style={getElementPosition("footer")}
        >
          <div className="space-y-1">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Member ID</span>
            <div className={cn("text-xs font-mono font-bold space-x-2", isMidnight || isGold || isNeon ? "text-white/60" : "text-gray-400")}>
              <span>CH-XXXX-XXXX-2024</span>
            </div>
          </div>
          <div 
            className="h-10 w-10 rounded-lg shadow-inner flex items-center justify-center opacity-80"
            style={{ backgroundColor: color + "22" }}
          >
            <Sparkles className="h-4 w-4" style={{ color }} />
          </div>
        </div>

      </div>

      {/* Glass Overlay for Dark Themes */}
      {(isMidnight || isGold || isNeon) && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      )}
    </div>
  )
}
