"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Palette, Tag, ImageIcon, Loader2, Save, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateStore } from "@/lib/actions/stores"

const CATEGORY_PRESETS = [
  "Electronics", "Fashion", "Food & Drinks", "Health & Beauty",
  "Home & Living", "Sports", "Books", "Auto Parts",
  "Computers", "Phones & Tablets", "Clothing", "Services",
]

export default function StoreSettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(store.name)
  const [tagline, setTagline] = useState(store.tagline || "")
  const [description, setDescription] = useState(store.description || "")
  const [brandColor, setBrandColor] = useState(store.brand_color || "#2563eb")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(store.category_tags || [])
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo_url)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.set("name", name)
    formData.set("tagline", tagline)
    formData.set("description", description)
    formData.set("brand_color", brandColor)
    formData.set("category_tags", selectedCategories.join(","))
    if (logoFile) formData.set("logo", logoFile)

    const result = await updateStore(store.id, formData)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Update Failed", description: result.error })
    } else {
      toast({ title: "Settings Saved ✅", description: "Your store has been updated." })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Core Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" style={{ color: brandColor }} />
              Public Identity
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short catchphrase" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="About your store..." />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" style={{ color: brandColor }} />
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_PRESETS.map(cat => (
                <button
                  key={cat} type="button" onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCategories.includes(cat) ? "text-white border-transparent" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}
                  style={selectedCategories.includes(cat) ? { background: brandColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" style={{ color: brandColor }} />
              Logo & Branding
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                  }} />
                </label>
                <div className="text-sm text-gray-500">
                  <p className="font-semibold text-gray-900 dark:text-white">Store Logo</p>
                  <p>Click to upload a new logo. Minimum size 200x200px recommended.</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Label className="flex items-center justify-between">
                  <span>Brand Color</span>
                  <span className="font-mono text-xs uppercase">{brandColor}</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                    className="h-10 w-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer" />
                  <div className="flex-1 h-10 rounded-xl" style={{ background: brandColor, opacity: 0.2 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preview */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Store Card Preview</h3>
            <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: brandColor + "33" }}>
              <div className="h-10 w-10 rounded-xl border flex items-center justify-center shrink-0" style={{ background: brandColor, borderColor: "white" }}>
                <span className="text-white font-bold">{name?.[0] || "?"}</span>
              </div>
              <div>
                <p className="text-sm font-bold truncate">{name || "Store Name"}</p>
                <p className="text-[10px] text-gray-500 truncate">{tagline || "Tagline goes here"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500">Your changes will be visible immediately on your public storefront.</p>
        <Button type="submit" disabled={loading} className="px-8 font-bold text-white border-none h-12 rounded-2xl" style={{ background: brandColor }}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
