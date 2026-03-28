"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Palette, Tag, Image as ImageIcon, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStore } from "@/lib/actions/stores"

const STEPS = ["Store Identity", "Brand & Style", "Go Live!"]

const BRAND_COLORS = [
  "#2563eb", "#7c3aed", "#dc2626", "#ea580c",
  "#16a34a", "#0891b2", "#db2777", "#ca8a04",
  "#1d4ed8", "#6d28d9", "#b91c1c", "#c2410c",
]

const CATEGORY_PRESETS = [
  "Electronics", "Fashion", "Food & Drinks", "Health & Beauty",
  "Home & Living", "Sports", "Books", "Auto Parts",
  "Computers", "Phones & Tablets", "Clothing", "Services",
]

export default function StoreSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const [name, setName] = useState("")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [brandColor, setBrandColor] = useState("#2563eb")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  async function handleSubmit() {
    if (!name.trim()) { setError("Store name is required"); return }
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("name", name)
    formData.set("tagline", tagline)
    formData.set("description", description)
    formData.set("brand_color", brandColor)
    formData.set("category_tags", selectedCategories.join(","))
    if (logoFile) formData.set("logo", logoFile)

    const result = await createStore(formData)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.slug) {
      setDone(true)
      setTimeout(() => router.push(`/store/${result.slug}`), 1800)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-4 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="h-20 w-20 text-green-400 mx-auto" />
          <h2 className="text-3xl font-extrabold text-white">Store Created! 🎉</h2>
          <p className="text-gray-400">Taking you to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: brandColor }} />
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10" style={{ background: brandColor }} />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-4 shadow-2xl" style={{ background: brandColor }}>
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create Your Store</h1>
          <p className="text-gray-400 mt-1 text-sm">Sell on Eagle Choice in minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${i <= step ? "text-white" : "bg-white/10 text-gray-500"}`}
                style={i <= step ? { background: brandColor } : {}}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-10 transition-all ${i < step ? "opacity-100" : "bg-white/10 opacity-50"}`} style={i < step ? { background: brandColor } : {}} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300 mb-5">{error}</div>}

          {/* Step 0 — Store Identity */}
          {step === 0 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Store className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-lg font-bold text-white">Store Identity</h2>
              </div>

              {/* Logo upload */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Store Logo</Label>
                <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/30 transition-colors relative overflow-hidden">
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" className="h-full w-full object-cover absolute inset-0" />
                    : <><ImageIcon className="h-8 w-8 text-gray-500 mb-2" /><span className="text-xs text-gray-500">Click to upload logo</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                  }} />
                </label>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Store Name <span className="text-red-400">*</span></Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kofi's Tech Hub" required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Tagline</Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Premium gadgets at your fingertips"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell customers what you sell..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" rows={3} />
              </div>
            </div>
          )}

          {/* Step 1 — Brand & Style */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Palette className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-lg font-bold text-white">Brand & Style</h2>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300 text-sm">Brand Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {BRAND_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setBrandColor(c)}
                      className={`h-9 w-full rounded-xl border-2 transition-all ${brandColor === c ? "scale-110 border-white" : "border-transparent hover:scale-105"}`}
                      style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs text-gray-400">Custom:</label>
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                    className="h-9 w-16 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                  <span className="text-xs text-gray-400 font-mono">{brandColor}</span>
                </div>

                {/* Live preview */}
                <div className="mt-4 p-4 rounded-2xl border border-white/10" style={{ borderColor: brandColor + "44" }}>
                  <div className="text-xs text-gray-500 mb-2">Card preview</div>
                  <div className="h-2 rounded-full mb-2" style={{ background: brandColor, opacity: 0.8 }} />
                  <p className="text-white text-sm font-bold">{name || "Your Store Name"}</p>
                  <p className="text-gray-400 text-xs">{tagline || "Your tagline here"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-300 text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" /> What do you sell? (Select categories)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESETS.map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCategories.includes(cat) ? "text-white border-transparent" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"}`}
                      style={selectedCategories.includes(cat) ? { background: brandColor, borderColor: brandColor } : {}}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Review & Go Live */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: brandColor }} />
                <h2 className="text-lg font-bold text-white">Ready to Go Live!</h2>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 space-y-4">
                {logoPreview && <img src={logoPreview} alt="logo" className="h-14 w-14 rounded-xl object-cover border border-white/10" />}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Store Name</p>
                  <p className="text-white font-bold text-xl">{name}</p>
                </div>
                {tagline && <div><p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Tagline</p><p className="text-gray-300">{tagline}</p></div>}
                {selectedCategories.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-full text-xs text-white font-medium" style={{ background: brandColor }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-white/20" style={{ background: brandColor }} />
                  <span className="text-xs text-gray-400">Brand Color: <span className="font-mono">{brandColor}</span></span>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-green-400 text-xs font-medium">
                  ✓ Your store will go live immediately after creation. You can always edit these details from your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-white/10 text-gray-300 hover:text-white bg-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button className="flex-1 font-semibold text-white border-none"
                style={{ background: brandColor }}
                onClick={() => {
                  if (step === 0 && !name.trim()) { setError("Please enter a store name"); return }
                  setError("")
                  setStep(s => s + 1)
                }}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button className="flex-1 font-semibold text-white border-none" style={{ background: brandColor }}
                onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating store...</> : "🚀 Launch My Store"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
