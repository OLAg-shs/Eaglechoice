"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, Palette, Layout, Save, RotateCcw, 
  Eye, MousePointer2, Sliders, CheckCircle2, Loader2, Sparkles, 
  Maximize, Minimize, Type, Shield, Info
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getStoreBySlug, updateStore } from "@/lib/actions/stores"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"
import DesignStudioCanvas from "@/components/DesignStudioCanvas"
import { cn } from "@/lib/utils"

const DEFAULT_ELEMENTS = [
  { id: "header", label: "Logo & Badge", x: 10, y: 15, visible: true },
  { id: "identity", label: "Name & Tagline", x: 10, y: 55, visible: true },
  { id: "socials", label: "Social Links", x: 10, y: 80, visible: true },
  { id: "footer", label: "Metadata & Accent", x: 10, y: 90, visible: true },
]

export default function CardStudioPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<any>(null)
  
  // Customization State
  const [elements, setElements] = useState(DEFAULT_ELEMENTS)
  const [borderRadius, setBorderRadius] = useState("2.5rem")
  const [backgroundColor, setBackgroundColor] = useState("")
  const [theme, setTheme] = useState<any>("midnight")
  const [layout, setLayout] = useState<any>("landscape")

  useEffect(() => {
    async function loadStore() {
      const { data, error } = await getStoreBySlug(slug)
      if (data) {
        setStore(data)
        const config = data.card_config || {}
        if (config.elements) setElements(config.elements)
        if (config.borderRadius) setBorderRadius(config.borderRadius)
        if (config.backgroundColor) setBackgroundColor(config.backgroundColor)
        if (config.theme) setTheme(config.theme)
        if (config.layout) setLayout(config.layout)
      }
      setLoading(false)
    }
    loadStore()
  }, [slug])

  async function handleSave() {
    setSaving(true)
    const card_config = {
      ...(store?.card_config || {}),
      elements,
      borderRadius,
      backgroundColor,
      theme,
      layout,
      custom_layout: true
    }

    const formData = new FormData()
    formData.set("card_config", JSON.stringify(card_config))

    const result = await updateStore(store.id, formData)
    setSaving(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({ title: "Design Architected! 📐", description: "Your custom Choice Card is now live." })
      router.refresh()
    }
  }

  const resetToDefault = () => {
    setElements(DEFAULT_ELEMENTS)
    setBorderRadius("2.5rem")
    setBackgroundColor("")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfaff] dark:bg-black font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Absolute Header */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/store/${slug}/settings`} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <h1 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center gap-2">
               Card Studio <span className="px-2 py-0.5 rounded-full bg-blue-600 text-[8px] text-white">Pro Architect</span>
             </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={resetToDefault} className="rounded-xl font-bold gap-2 text-gray-400">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 gap-2 px-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Architecting..." : "Launch Design"}
          </Button>
        </div>
      </div>

      <div className="pt-20 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Designer Sidebar */}
        <div className="lg:col-span-3 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-8 space-y-10 overflow-y-auto max-h-[calc(100vh-80px)]">
           
           <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-blue-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Geometry</h2>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500">Corner Radius</Label>
                    <input 
                      type="range" min="0" max="64" value={parseInt(borderRadius)} 
                      onChange={e => setBorderRadius(`${e.target.value}px`)} 
                      className="w-full h-1.5 bg-gray-100 dark:bg-gray-900 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                 </div>
                 <div className="flex gap-2">
                    {['landscape', 'portrait'].map(l => (
                      <button 
                        key={l} onClick={() => setLayout(l)}
                        className={cn(
                          "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                          layout === l ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-50 dark:border-gray-900 text-gray-400"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                 </div>
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Aesthetics</h2>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500">Custom Background</Label>
                    <div className="flex items-center gap-3">
                       <Input 
                        type="color" value={backgroundColor || "#000000"} 
                        onChange={e => setBackgroundColor(e.target.value)} 
                        className="h-10 w-16 p-1 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-transparent cursor-pointer"
                      />
                      <Input 
                        placeholder="Hex Code" value={backgroundColor} 
                        onChange={e => setBackgroundColor(e.target.value)}
                        className="h-10 rounded-lg font-mono text-xs font-bold"
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    {['midnight', 'gold', 'neon', 'minimal'].map(t => (
                      <button 
                        key={t} onClick={() => {setTheme(t); setBackgroundColor("")}}
                        className={cn(
                          "h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                          theme === t && !backgroundColor ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-50 dark:border-gray-900 text-gray-400"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Element Visibility</h2>
              </div>
              <div className="space-y-2">
                {elements.map((el, idx) => (
                   <button 
                    key={el.id} 
                    onClick={() => {
                      const newSpecs = [...elements]
                      newSpecs[idx].visible = !newSpecs[idx].visible
                      setElements(newSpecs)
                    }}
                    className={cn(
                      "flex items-center justify-between w-full h-12 px-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      el.visible ? "border-emerald-600 text-emerald-600 bg-emerald-50/20" : "border-gray-50 dark:border-gray-900 text-gray-400"
                    )}
                   >
                     {el.label}
                     {el.visible ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-gray-300" />}
                   </button>
                ))}
              </div>
           </section>

           <div className="pt-10 space-y-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-2">
                 <div className="flex items-center gap-2 text-blue-600">
                    <Info className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Architect Tip</span>
                 </div>
                 <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium leading-relaxed italic">
                    Tap and drag any element on the right to manually arrange your design. Coordinates are saved as percentages for responsive excellence.
                 </p>
              </div>
           </div>
        </div>

        {/* Studio Canvas Area */}
        <div className="lg:col-span-9 bg-[#f8f9fc] dark:bg-black/40 flex items-center justify-center p-12 overflow-hidden">
           <div className={cn(
             "relative group",
             layout === "landscape" ? "w-full max-w-4xl" : "h-full max-h-[700px]"
           )}>
             {/* The Component Wrapper */}
             <div className="absolute inset-0 z-0 scale-[0.98] blur-3xl opacity-20 pointer-events-none transition-all group-hover:scale-105" style={{ background: store?.brand_color }} />
             
             <div className="relative z-10 w-full h-full">
                <DesignStudioCanvas 
                  elements={elements} 
                  onUpdate={setElements} 
                  containerWidth={800} 
                  containerHeight={500}
                >
                  <ChoiceCardPreview 
                    name={store.name}
                    tagline={store.tagline}
                    color={store.brand_color}
                    layout={layout}
                    theme={theme}
                    socials={store.social_links}
                    layoutData={{
                      borderRadius,
                      backgroundColor,
                      elements
                    }}
                  />
                </DesignStudioCanvas>

                {/* Live Position HUD (Only visible when dragging or hovering) */}
                <div className="absolute -bottom-12 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex gap-6">
                      {elements.map(el => el.visible && (
                        <div key={el.id} className="text-[8px] font-black uppercase tracking-tighter text-white/40">
                          {el.label}: <span className="text-white">{Math.round(el.x)}%, {Math.round(el.y)}%</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
