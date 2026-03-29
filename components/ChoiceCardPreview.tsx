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
}

export default function ChoiceCardPreview({ name, tagline, color, layout, theme, socials }: ChoiceCardProps) {
  const isMidnight = theme === "midnight"
  const isGold = theme === "gold"
  const isNeon = theme === "neon"

  return (
    <div className={cn(
      "relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_40px_100px_rgba(0,0,0,0.15)] group/card",
      layout === "landscape" ? "aspect-[1.6/1] w-full" : "aspect-[1/1.6] h-[400px] w-auto mx-auto",
      "rounded-[2.5rem] overflow-hidden p-8 border border-white/20",
      isMidnight ? "bg-[#0b0f1a]" : 
      isGold ? "bg-gradient-to-br from-[#1a1c2c] to-[#4a3f35]" : 
      isNeon ? "bg-[#050505]" : "bg-white"
    )}>
      
      {/* Background Accents */}
      <div className={cn(
        "absolute -top-1/2 -right-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-40 transition-colors duration-1000",
        isNeon ? "bg-purple-600" : "bg-blue-600"
      )} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
              isGold ? "bg-yellow-500/20 text-yellow-500" : "bg-blue-600/20 text-blue-500"
            )}>
              <Shield className="h-5 w-5 fill-current" />
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.4em] ml-1 mt-2",
              isMidnight || isGold || isNeon ? "text-white/40" : "text-gray-400"
            )}>
              Eagle Choice Official ID
            </span>
          </div>
          
          <div className={cn(
            "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
            isMidnight || isGold || isNeon ? "bg-white/5 border-white/10 text-white/60" : "bg-gray-50 border-gray-100 text-gray-500"
          )}>
            Boutique Owner
          </div>
        </div>

        {/* Identity Section */}
        <div className="space-y-4">
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
          
          {/* Card Features Chips */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              <span className="text-[7px] font-black uppercase tracking-widest text-blue-400">Verified</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Instant Access</span>
            </div>
          </div>

          {/* Social Links Strip */}
          {socials && (socials.instagram || socials.x || socials.facebook) && (
            <div className="flex gap-2 pt-1 opacity-60">
              {socials.instagram && <div className={cn("h-4 w-4 rounded flex items-center justify-center text-[7px] font-black", isMidnight || isGold || isNeon ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600")}>IG</div>}
              {socials.x && <div className={cn("h-4 w-4 rounded flex items-center justify-center text-[7px] font-black", isMidnight || isGold || isNeon ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600")}>X</div>}
              {socials.facebook && <div className={cn("h-4 w-4 rounded flex items-center justify-center text-[7px] font-black", isMidnight || isGold || isNeon ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600")}>FB</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Member ID</span>
            <div className={cn("text-xs font-mono font-bold", isMidnight || isGold || isNeon ? "text-white/60" : "text-gray-400")}>
              CH-XXXX-XXXX-2024
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

      {/* Glass Overlay for Gold/Midnight */}
      {(isMidnight || isGold || isNeon) && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
      )}
    </div>
  )
}
