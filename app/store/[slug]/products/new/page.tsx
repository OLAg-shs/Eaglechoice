"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft, Palette, Layout, Save, RotateCcw, 
  Eye, MousePointer2, Sliders, CheckCircle2, Loader2, Sparkles, 
  Maximize, Minimize, Type, Shield, Info, Plus, Trash2, Image as ImageIcon, Zap, Users
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/actions/products"
import { getStoreAgents, getStoreBySlug, updateStore } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"
import DesignStudioCanvas from "@/components/DesignStudioCanvas"

const DEFAULT_PRODUCT_ELEMENTS = [
  { id: "price", label: "Price Badge", x: 85, y: 10, visible: true },
  { id: "branding", label: "Boutique Logo", x: 50, y: 90, visible: true },
  { id: "name", label: "Product Name", x: 50, y: 10, visible: false },
]

export default function SellerNewProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAvailable, setIsAvailable] = useState(true)
  const [isNegotiationEnabled, setIsNegotiationEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeData, setStoreData] = useState<any>(null)
  const [selectedAgent, setSelectedAgent] = useState("")

  // Live Preview State
  const [liveName, setLiveName] = useState("")
  const [livePrice, setLivePrice] = useState("")

  // --- New Feature State ---
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([
    { key: "", value: "" }
  ])
  const [displayConfig, setDisplayConfig] = useState({
    background: "solid",
    padding: "md",
    objectFit: "contain",
    showBranding: true,
    elements: DEFAULT_PRODUCT_ELEMENTS
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: store } = await getStoreBySlug(slug)
      if (store) {
        setStoreId(store.id)
        setStoreData(store)
        const storeAgents = await getStoreAgents(store.id)
        setAgents(storeAgents)
        const owner = storeAgents.find((a: any) => a.role === "owner")
        if (owner) setSelectedAgent(owner.user_id)

        // Load store-wide product layout preset if exists
        if (store.store_config?.product_layout_preset) {
          setDisplayConfig(prev => ({ ...prev, elements: store.store_config.product_layout_preset }))
        }
      }
    }
    loadData()
  }, [slug])

  const setProductElements = (elements: any) => {
    setDisplayConfig(prev => ({ ...prev, elements }))
  }

  const saveAsDefaultLayout = async () => {
    if (!storeData) return
    const newStoreConfig = {
      ...storeData.store_config,
      product_layout_preset: displayConfig.elements
    }
    const formData = new FormData()
    formData.set("store_config", JSON.stringify(newStoreConfig))
    const res = await updateStore(storeData.id, formData)
    if (res.success) toast({ title: "Global Layout Updated ✅", description: "All new products will now use this arrangement." })
  }

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }])
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index))
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = val
    setSpecs(newSpecs)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    formData.set("is_available", String(isAvailable))
    formData.set("is_negotiation_enabled", String(isNegotiationEnabled))
    if (storeId) formData.set("store_id", storeId)
    formData.set("agent_id", selectedAgent)

    // Parse specifications to JSON
    const specsObj: Record<string, string> = {}
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) specsObj[s.key] = s.value
    })
    formData.set("specifications", JSON.stringify(specsObj))

    // Set display config
    formData.set("display_config", JSON.stringify(displayConfig))

    try {
      const result = await createProduct(formData)
      if (result.error) throw new Error(result.error)
      
      toast({ title: "Product Launched! 🚀", description: "Successfully added to your boutique." })
      router.push(`/store/${slug}/products`)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const brandColor = storeData?.brand_color || "#3b82f6"

  return (
    <div className="min-h-screen bg-[#fdfaff] dark:bg-black font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <Link href={`/store/${slug}/products`} className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Boutique
            </Link>
            <div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                New <span style={{ color: brandColor }}>Product.</span>
              </h1>
              <p className="text-gray-500 font-medium italic mt-1">Excellence in every listing. Build your inventory.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: brandColor + "15" }}>
                <Zap className="h-5 w-5" style={{ color: brandColor }} />
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory Power</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Master Architect Mode</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Identity Card */}
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Primary Intel</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Name *</Label>
                  <Input 
                    id="name" name="name" 
                    placeholder="e.g. MacBook Pro M3 Max" required 
                    value={liveName}
                    onChange={e => setLiveName(e.target.value)}
                    className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xl font-black focus:ring-4 focus:ring-blue-500/10 placeholder:font-medium placeholder:text-gray-300" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="base_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Premium Price (GHS) *</Label>
                    <div className="relative">
                       <Input 
                        id="base_price" name="base_price" type="number" step="0.01" min="0" required 
                        value={livePrice}
                        onChange={e => setLivePrice(e.target.value)}
                        className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-black pl-10" 
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Stock Availability *</Label>
                    <Input id="stock" name="stock" type="number" min="0" required defaultValue={1} className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-black" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Storytelling</Label>
                  <Textarea id="description" name="description" placeholder="Evoke desire. Tell the story of this product..." rows={5} className="rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-medium leading-relaxed resize-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
            </div>

            {/* Specification Builder */}
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5" style={{ color: brandColor }} />
                  <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Technical Specs</h2>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="rounded-xl font-bold gap-2">
                  <Plus className="h-4 w-4" /> Add Spec
                </Button>
              </div>

              <div className="space-y-4">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex-1">
                      <Input 
                        placeholder="Label (e.g. Memory)" 
                        value={spec.key} 
                        onChange={(e) => updateSpec(idx, "key", e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="Value (e.g. 16GB)" 
                        value={spec.value} 
                        onChange={(e) => updateSpec(idx, "value", e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold"
                      />
                    </div>
                    {specs.length > 1 && (
                      <button type="button" onClick={() => removeSpec(idx)} className="h-12 w-12 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Studio & Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Identity Studio */}
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Identity Studio</h2>
              </div>

              <div className="space-y-6">
                {/* Media Upload */}
                <div className="relative group">
                   <div className={cn(
                     "aspect-[4/5] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
                     imagePreview ? "border-transparent" : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
                   )}>
                      {imagePreview ? (
                        <div className="w-full h-full relative" style={{ 
                          background: displayConfig.background === "solid" ? brandColor : 
                                      displayConfig.background === "gradient" ? `linear-gradient(135deg, ${brandColor}, #000)` : 
                                      "#f3f4f6"
                        }}>
                           <DesignStudioCanvas
                             elements={displayConfig.elements || DEFAULT_PRODUCT_ELEMENTS}
                             onUpdate={setProductElements}
                             containerWidth={400}
                             containerHeight={500}
                           >
                             <div className="w-full h-full relative">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className={cn(
                                    "w-full h-full transition-all duration-500",
                                    displayConfig.objectFit === "contain" ? "object-contain" : "object-cover",
                                    displayConfig.padding === "sm" ? "p-4" : displayConfig.padding === "md" ? "p-8" : "p-12"
                                  )} 
                                />
                                
                                {/* Dynamic Product Elements */}
                                {(displayConfig.elements || DEFAULT_PRODUCT_ELEMENTS).map(el => el.visible && (
                                  <div 
                                    key={el.id}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${el.x}%`, top: `${el.y}%` }}
                                  >
                                    {el.id === 'price' && (
                                      <div className="bg-black/90 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-2xl border border-white/20 whitespace-nowrap">
                                        ₵ {livePrice || '0.00'}
                                      </div>
                                    )}
                                    {el.id === 'branding' && (
                                      <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                                        {storeData?.name || "Boutique"} Choice
                                      </div>
                                    )}
                                    {el.id === 'name' && (
                                      <div className="bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl font-black text-[10px] shadow-2xl border border-gray-100 dark:border-gray-800 whitespace-nowrap">
                                        {liveName || 'Product Title'}
                                      </div>
                                    )}
                                  </div>
                                ))}
                             </div>
                           </DesignStudioCanvas>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="h-16 w-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mx-auto">
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Launch Media</p>
                            <p className="text-[10px] text-gray-300 italic">Click or drag & drop</p>
                          </div>
                        </div>
                      )}
                      <input 
                        id="image_files" name="image_files" type="file" accept="image/*" multiple 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                   </div>
                </div>

                {/* Studio Controls */}
                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Backdrop Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {["solid", "gradient", "glass"].map(b => (
                         <button 
                          key={b} type="button"
                          onClick={() => setDisplayConfig({...displayConfig, background: b})}
                          className={cn(
                            "h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                            displayConfig.background === b ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-50 dark:border-gray-900 text-gray-400"
                          )}
                         >
                           {b}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Image Padding</Label>
                      <div className="flex gap-2">
                        {["sm", "md", "lg"].map(p => (
                          <button 
                            key={p} type="button"
                            onClick={() => setDisplayConfig({...displayConfig, padding: p})}
                            className={cn(
                              "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                              displayConfig.padding === p ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-50 dark:border-gray-900 text-gray-400"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Visual Fit</Label>
                      <div className="flex gap-2">
                        {["contain", "cover"].map(f => (
                          <button 
                            key={f} type="button"
                            onClick={() => setDisplayConfig({...displayConfig, objectFit: f})}
                            className={cn(
                              "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                              displayConfig.objectFit === f ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-gray-50 dark:border-gray-900 text-gray-400"
                            )}
                          >
                           {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                     <div className="space-y-0.5">
                        <Label htmlFor="show_brand" className="font-bold text-xs text-gray-900 dark:text-white">Apply Choice Branding</Label>
                        <p className="text-[9px] text-gray-400 italic">Inject boutique logo & name into render.</p>
                     </div>
                     <Switch id="show_brand" checked={displayConfig.showBranding} onCheckedChange={(v) => setDisplayConfig({...displayConfig, showBranding: v})} />
                  </div>

                  <Button type="button" variant="outline" onClick={saveAsDefaultLayout} className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                    <Maximize className="h-4 w-4" /> Save as Default Layout
                  </Button>
                </div>
              </div>
            </div>

            {/* Final Execution Controls */}
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-6">
               {/* Visibility & Agent */}
               <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="agent_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Handling Agent *</Label>
                    <div className="relative">
                      <select 
                        id="agent_id"
                        value={selectedAgent}
                        onChange={e => setSelectedAgent(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 px-12 text-sm font-bold appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select handling point...</option>
                        {agents.map(agent => (
                          <option key={agent.user_id} value={agent.user_id}>
                            {agent.profile?.full_name} ({agent.role === 'owner' ? 'Owner' : 'Agent'})
                          </option>
                        ))}
                      </select>
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                     <div className="flex items-center gap-4">
                        <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} style={{ backgroundColor: isAvailable ? brandColor : "" }} />
                        <div className="space-y-0.5">
                          <Label htmlFor="is_available" className="font-bold text-sm text-gray-900 dark:text-white">Live Status</Label>
                          <p className="text-[10px] text-gray-400 font-medium">Instantly discoverable by buyers.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Switch id="is_negotiation" checked={isNegotiationEnabled} onCheckedChange={setIsNegotiationEnabled} className="data-[state=checked]:bg-emerald-600" />
                        <div className="space-y-0.5">
                          <Label htmlFor="is_negotiation" className="font-bold text-sm text-gray-900 dark:text-white">Price Negotiation</Label>
                          <p className="text-[10px] text-gray-400 font-medium">Activate &quot;Make an Offer&quot; engine.</p>
                        </div>
                      </div>
                  </div>
               </div>

               <Button type="submit" disabled={saving || !selectedAgent} className="w-full h-20 rounded-3xl font-black text-white shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: brandColor }}>
                  {saving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <CheckCircle2 className="h-6 w-6 mr-3" />}
                  {saving ? "Launching Product..." : "Finalize & Launch Listing"}
               </Button>
               
               <p className="text-center text-[10px] text-gray-400 font-medium italic">
                  By launching, you acknowledge platform listing standards. 
               </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
