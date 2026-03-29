"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Loader2, Save, Trash2, ImageIcon, Package, Plus, Layout, 
  Palette, ShieldCheck, Sparkles, CheckCircle2, Zap, Maximize
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { updateProduct, deleteProduct } from "@/lib/actions/products"
import { updateStore } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"
import DesignStudioCanvas from "@/components/DesignStudioCanvas"
import BrandedProductCard from "@/components/BrandedProductCard"

const DEFAULT_PRODUCT_ELEMENTS = [
  { id: "image", label: "Product Image", x: 50, y: 45, visible: true },
  { id: "branding", label: "Store Identity", x: 15, y: 10, visible: true },
  { id: "name", label: "Product Name", x: 15, y: 85, visible: true },
  { id: "specs", label: "Tech Specs", x: 15, y: 65, visible: true },
  { id: "price", label: "Price Tag", x: 80, y: 85, visible: true },
]

export default function ProductEditForm({ product, storeSlug, brandColor }: { product: any, storeSlug: string, brandColor: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [isNegotiationEnabled, setIsNegotiationEnabled] = useState(product.is_negotiation_enabled)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Live Preview State
  const [liveName, setLiveName] = useState(product.name)
  const [livePrice, setLivePrice] = useState(String(product.price))

  // --- Feature State ---
  const initialSpecs = product.specifications 
    ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string }))
    : [{ key: "", value: "" }]
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>(initialSpecs)
  
  const [displayConfig, setDisplayConfig] = useState(product.display_config || {
    background: "white" as "solid" | "gradient" | "glass" | "white",
    cardColor: "#ffffff",
    padding: "md",
    objectFit: "contain",
    showBranding: true,
    elements: DEFAULT_PRODUCT_ELEMENTS
  })
  const [imagePreview, setImagePreview] = useState<string | null>(product.images?.[0] || null)

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }])
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index))
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = val
    setSpecs(newSpecs)
  }

  const setProductElements = (elements: any) => {
    setDisplayConfig((prev: any) => ({ ...prev, elements }))
  }

  const saveAsDefaultLayout = async () => {
    if (!product.store_id) return
    const formData = new FormData()
    formData.set("store_config", JSON.stringify({ product_layout_preset: displayConfig.elements }))
    const res = await updateStore(product.store_id, formData)
    if (res.success) toast({ title: "Global Layout Updated ✅", description: "Design saved as store default." })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    
    formData.set("is_available", String(isAvailable))
    formData.set("is_negotiation_enabled", String(isNegotiationEnabled))

    // Parse specifications to JSON
    const specsObj: Record<string, string> = {}
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) specsObj[s.key] = s.value
    })
    formData.set("specifications", JSON.stringify(specsObj))

    // Set display config
    formData.set("display_config", JSON.stringify(displayConfig))

    const result = await updateProduct(product.id, formData)
    setSaving(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({ title: "Product Updated ✅", description: "Your changes have been saved." })
      router.push(`/store/${storeSlug}/products`)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    setDeleting(true)
    const result = await deleteProduct(product.id)
    setDeleting(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({ title: "Product Deleted", description: "The product has been removed from your store." })
      router.push(`/store/${storeSlug}/products`)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfaff] dark:bg-black font-sans selection:bg-blue-500 selection:text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <Link href={`/store/${storeSlug}/products`} className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Products
            </Link>
            <div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                Edit <span style={{ color: brandColor }}>Product.</span>
              </h1>
              <p className="text-gray-500 font-medium italic mt-1">Refine your offering. Maintain store excellence.</p>
            </div>
          </div>

          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl font-bold px-8 h-14" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-5 w-5 mr-2" /> Delete Product
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Product Intel</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Name *</Label>
                  <Input 
                    id="name" name="name" 
                    defaultValue={product.name} required 
                    value={liveName}
                    onChange={e => setLiveName(e.target.value)}
                    className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xl font-black focus:ring-4 focus:ring-blue-500/10" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="base_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Price (GHS) *</Label>
                    <div className="relative">
                       <Input 
                        id="base_price" name="base_price" type="number" step="0.01" min="0" defaultValue={product.price} required 
                        value={livePrice}
                        onChange={e => setLivePrice(e.target.value)}
                        className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-black pl-10" 
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Stock Quantity *</Label>
                    <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock_quantity} required className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-black" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="brand" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Brand</Label>
                    <Input id="brand" name="brand" defaultValue={product.brand || ""} placeholder="e.g. Apple" className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Category *</Label>
                    <Input id="category" name="category" defaultValue={product.category} required className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Description</Label>
                  <Textarea id="description" name="description" defaultValue={product.description || ""} rows={5} className="rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-medium leading-relaxed resize-none focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>
            </div>

            {/* Specification Builder */}
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5" style={{ color: brandColor }} />
                  <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Specifications</h2>
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
                        placeholder="Label" 
                        value={spec.key} 
                        onChange={(e) => updateSpec(idx, "key", e.target.value)}
                        className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        placeholder="Value" 
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
            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-8">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Identity Studio</h2>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                   <div className={cn(
                     "aspect-[1.4/1] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-visible transition-all duration-500",
                     imagePreview ? "border-transparent" : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700"
                   )}>
                      {imagePreview ? (
                        <div className="w-full h-full relative group">
                           <DesignStudioCanvas
                             elements={(displayConfig.elements || DEFAULT_PRODUCT_ELEMENTS).map((el: any) => ({
                               ...el,
                               renderHandle: (handleEl: any) => {
                                 const specsObj: Record<string, string> = {}
                                 specs.forEach(s => { if (s.key && s.value) specsObj[s.key] = s.value })

                                 return (
                                   <div className="pointer-events-none transform scale-[1.2] origin-center">
                                      <BrandedProductCard
                                        name={liveName}
                                        price={livePrice}
                                        brand={product.brand}
                                        specifications={specsObj}
                                        imageUrl={imagePreview}
                                        brandColor={brandColor}
                                        storeName={storeSlug}
                                        displayConfig={{
                                           ...displayConfig,
                                           elements: (displayConfig.elements || DEFAULT_PRODUCT_ELEMENTS).map((e: any) => ({
                                             ...e,
                                             visible: e.id === handleEl.id
                                           }))
                                        }}
                                      />
                                   </div>
                                 )
                               }
                             }))}
                             onUpdate={setProductElements}
                             containerWidth={500}
                             containerHeight={400}
                           >
                              <div className="w-full h-full">
                                <BrandedProductCard
                                  name={liveName}
                                  price={livePrice}
                                  brand={product.brand}
                                  specifications={{}}
                                  imageUrl={imagePreview}
                                  brandColor={brandColor}
                                  storeName={storeSlug}
                                  displayConfig={{
                                    ...displayConfig,
                                    elements: (displayConfig.elements || DEFAULT_PRODUCT_ELEMENTS).map((e: any) => ({ ...e, visible: false }))
                                  }}
                                />
                             </div>
                           </DesignStudioCanvas>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <ImageIcon className="h-8 w-8 text-gray-300 mx-auto" />
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Launch Media</p>
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
                   {imagePreview && (
                     <p className="text-center text-[10px] text-gray-400 font-medium italic mt-4">Tip: Click the image to replace it.</p>
                   )}
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Backdrop Style</Label>
                    <div className="grid grid-cols-4 gap-2">
                       {["white", "solid", "gradient", "glass"].map(b => (
                         <button 
                          key={b} type="button"
                          onClick={() => setDisplayConfig({...displayConfig, background: b as any})}
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

                  {displayConfig.background === "solid" && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Custom Card Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={displayConfig.cardColor} 
                          onChange={(e) => setDisplayConfig({...displayConfig, cardColor: e.target.value})}
                          className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                        />
                        <Input 
                          type="text" 
                          value={displayConfig.cardColor} 
                          onChange={(e) => setDisplayConfig({...displayConfig, cardColor: e.target.value})}
                          className="flex-1 h-10 rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

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
                        <Label htmlFor="show_brand" className="font-bold text-xs text-gray-900 dark:text-white">Apply Branding</Label>
                        <p className="text-[9px] text-gray-400 italic">Inject boutique logo into render.</p>
                     </div>
                     <Switch id="show_brand" checked={displayConfig.showBranding} onCheckedChange={(v) => setDisplayConfig({...displayConfig, showBranding: v})} />
                  </div>

                  <Button type="button" variant="outline" onClick={saveAsDefaultLayout} className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                    <Maximize className="h-4 w-4" /> Save as Store Default
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[3rem] p-8 md:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.02)] space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-blue-600" />
                    <div className="space-y-0.5">
                       <Label htmlFor="is_available" className="font-bold text-sm text-gray-900 dark:text-white">Live Status</Label>
                       <p className="text-[10px] text-gray-400 font-medium">Available for public discovery.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Switch id="is_negotiation" checked={isNegotiationEnabled} onCheckedChange={setIsNegotiationEnabled} className="data-[state=checked]:bg-emerald-600" />
                    <div className="space-y-0.5">
                      <Label htmlFor="is_negotiation" className="font-bold text-sm text-gray-900 dark:text-white">Price Negotiation</Label>
                      <p className="text-[10px] text-gray-400 font-medium">Allow buyers to make offers.</p>
                    </div>
                  </div>
                </div>

               <Button type="submit" disabled={saving} className="w-full h-20 rounded-3xl font-black text-white shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: brandColor }}>
                  {saving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
                  {saving ? "Saving Changes..." : "Save Product Settings"}
               </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
