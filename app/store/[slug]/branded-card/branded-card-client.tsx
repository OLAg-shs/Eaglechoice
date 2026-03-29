"use client"

import { useState } from "react"
import { Download, Monitor, Share2, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"

interface BrandedCardProps {
  store: any
  productCount: number
  agentCount: number
}

export default function BrandedCardClient({ store, productCount, agentCount }: BrandedCardProps) {
  const [downloading, setDownloading] = useState(false)
  
  // -- EXTRACT CONFIG FROM MASTER ARCHITECT --
  const cardConfig = store.card_config || { theme: "midnight", layout: "landscape", primary_color: "#2563eb" }
  const brandColor = store.brand_color || cardConfig.primary_color || "#2563eb"

  async function handleDownload() {
    // Note: In a production environment, this would ideally use a library like html2canvas 
    // or a specialized API route to generate a high-res PNG.
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      window.print() // Fallback to print for this demo
    }, 1000)
  }

  return (
    <div className="space-y-10 max-w-4xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Boutique Identity.</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Your Choices, perfectly branded. Share your digital card anywhere.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 rounded-2xl font-bold px-6 gap-2 border-gray-200 dark:border-gray-800">
            <Share2 className="h-4 w-4" /> Share Link
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={downloading} 
            className="h-12 rounded-2xl font-black px-8 gap-2 text-white shadow-xl bg-blue-600 hover:bg-black transition-all"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* REPLICATING THE MASTER ARCHITECT PREVIEW */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50/50 dark:bg-white/5 p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/10 shadow-inner flex items-center justify-center min-h-[500px]">
            <div className="w-full max-w-md">
               <ChoiceCardPreview 
                name={store.name}
                tagline={store.tagline || ""}
                color={brandColor}
                theme={cardConfig.theme}
                layout={cardConfig.layout}
               />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            <div className="flex items-center gap-2 italic"><RefreshCcw className="h-3 w-3" /> Auto-Synced</div>
            <div className="flex items-center gap-2 italic"><Monitor className="h-3 w-3" /> Digital Ready</div>
          </div>
        </div>

        {/* DETAILS PANEL */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-sm space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Intelligence</Label>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Live Theme</span>
                  <span className="text-xs font-black uppercase text-blue-600 tracking-wider">{cardConfig.theme}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Card Layout</span>
                  <span className="text-xs font-black uppercase text-blue-600 tracking-wider">{cardConfig.layout}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visibility Stats</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{productCount}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Products</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{agentCount}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Team</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              Update Card Styling
            </Button>
          </div>
        </div>

      </div>

      <p className="text-center text-[10px] text-gray-400 font-medium italic">
        This card is your official boutique digital asset. Updates in the Stylist Studio are applied instantly.
      </p>
    </div>
  )
}
