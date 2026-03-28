"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Store, Palette, Users, Gavel, CheckCircle2, 
  Loader2, ArrowRight, ArrowLeft, Shield, Sparkles, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStore } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "identity", title: "Identity", icon: Store, description: "Name your brand" },
  { id: "branding", title: "Style", icon: Palette, description: "Theme your store" },
  { id: "team", title: "Agents", icon: Users, description: "Manage your team" },
  { id: "terms", title: "Agreement", icon: Gavel, description: "Finalize launch" },
]

const BRAND_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#000000", "#0891b2", "#ca8a04"
]

const CATEGORIES = [
  "Electronics", "Computers", "Mobile Phones", "Accessories", "Fashion", "Home Appliances"
]

export default function StoreSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    brand_color: "#7c3aed",
    categories: [] as string[],
    accepted_terms: false
  })

  function toggleCategory(cat: string) {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat) 
        : [...prev.categories, cat]
    }))
  }

  async function handleSubmit() {
    if (!formData.name.trim()) { setError("Store name is required"); return }
    if (!formData.accepted_terms) { setError("Please accept the terms to continue"); return }
    
    setLoading(true)
    setError("")

    // We'll pass a standard object to createStore, which we'll update to handle the new fields
    const res = await createStore({
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      brand_color: formData.brand_color,
      category_tags: formData.categories.join(","),
      accepted_terms: true // Marked as true since they checked the box
    } as any)

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else if (res.slug) {
      setDone(true)
      setTimeout(() => router.push(`/store/${res.slug}`), 2000)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 font-sans">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-[100px] opacity-20 animate-pulse" />
          <div className="relative text-center space-y-6 animate-in zoom-in-50 duration-700">
            <div className="h-24 w-24 rounded-3xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">Boutique Launched! 🚀</h2>
              <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">Welcome to the inner circle. Taking you to your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfaff] dark:bg-black font-sans selection:bg-purple-500 selection:text-white flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] transition-colors duration-1000" style={{ background: formData.brand_color }} />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-colors duration-1000" style={{ background: formData.brand_color }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex h-16 w-16 rounded-2xl items-center justify-center shadow-2xl transition-all duration-500 group" style={{ background: formData.brand_color }}>
            <Shield className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter capitalize transition-all duration-500">
              Build your <span className="text-purple-600" style={{ color: formData.brand_color }}>Empire.</span>
            </h1>
            <p className="text-gray-500 font-medium italic text-sm mt-1">Scale your business instantly with Eagle Choice.</p>
          </div>
        </div>

        {/* Desktop Step Indicator */}
        <div className="hidden md:flex w-full items-center justify-between px-10 relative mb-4">
          <div className="absolute h-1 w-[calc(100%-120px)] left-[60px] bg-gray-100 dark:bg-gray-800 top-1/2 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute h-1 left-[60px] top-1/2 -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]" 
            style={{ width: `${(step / (STEPS.length - 1)) * (100 - (120/800 * 100))}%`, background: formData.brand_color }}
          />
          {STEPS.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 w-32">
              <div 
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700",
                  i <= step ? "text-white shadow-xl" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-300"
                )}
                style={i <= step ? { background: formData.brand_color, borderColor: formData.brand_color } : {}}
              >
                {i < step ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-6 w-6" />}
              </div>
              <div className="text-center">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-0.5", i <= step ? "text-gray-900 dark:text-white" : "text-gray-400")}>{s.title}</p>
                <p className="text-[9px] text-gray-400 font-medium italic line-clamp-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="w-full bg-white dark:bg-gray-950/40 backdrop-blur-3xl border border-white dark:border-gray-800 rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-none min-h-[500px] flex flex-col">
          
          {error && (
            <div className="mb-10 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="flex-1">
            {/* ── STEP 0: IDENTITY ── */}
            {step === 0 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">First, your name.</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg italic">The name of your store is the first thing buyers will see. Keep it short, trendy, and unique.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Store Name</Label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                        <Store className="h-6 w-6" />
                      </div>
                      <Input 
                        placeholder="e.g. Accra Gear Hub" 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-16 text-xl font-bold focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1">The Vibe (Tagline)</Label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <Input 
                        placeholder="e.g. Pure electronics, purely Ghanaian." 
                        value={formData.tagline}
                        onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                        className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-16 text-xl font-bold focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: STYLE ── */}
            {step === 1 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Choose your Look.</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg italic">Pick a brand color that represents your store&apos;s personality. We&apos;ll use this everywhere.</p>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {BRAND_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, brand_color: color })}
                      className={cn(
                        "h-14 w-full rounded-2xl border-4 transition-all duration-300",
                        formData.brand_color === color ? "scale-110 shadow-2xl border-white dark:border-gray-700" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </div>

                <div className="pt-6 space-y-4">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-1 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Market Categories
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "px-5 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-300",
                          formData.categories.includes(cat)
                            ? "text-white shadow-lg"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200"
                        )}
                        style={formData.categories.includes(cat) ? { background: formData.brand_color, borderColor: formData.brand_color } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: TEAM ── */}
            {step === 2 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">You & Your Team.</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg italic">Every great store needs great support. You can add agents to your store later to handle product inquiries.</p>
                </div>
                
                <div className="p-10 rounded-[3rem] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
                    <Users className="h-10 w-10 text-gray-300" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Self-Managed Mode</p>
                    <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto italic">
                      For now, you are the primary agent of your store. You can invite your team members via email once your boutique is live.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: TERMS ── */}
            {step === 3 && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">One Last Thing.</h2>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg italic">Eagle Choice handles the marketing, hosting, and payments. In exchange, we grow together.</p>
                </div>

                <div className="p-10 rounded-[3rem] border-2 space-y-8" style={{ borderColor: formData.brand_color + "22", background: formData.brand_color + "08" }}>
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white" style={{ background: formData.brand_color }}>
                      <Gavel className="h-7 w-7" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">The 5% Commission</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic text-sm">
                        By launching your boutique, you agree that Eagle Choice will take a <span className="text-purple-600 font-bold" style={{ color: formData.brand_color }}>5% commission</span> on every successful product sale on this platform. This fee handles everything from your shop host to the GH-Payments gateway.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/40 dark:border-gray-800">
                    <input 
                      type="checkbox" 
                      id="accept_terms"
                      checked={formData.accepted_terms}
                      onChange={e => setFormData({ ...formData, accepted_terms: e.target.checked })}
                      className="h-7 w-7 rounded-xl border-2 transition-all cursor-pointer accent-purple-600"
                    />
                    <Label htmlFor="accept_terms" className="text-sm font-black text-gray-800 dark:text-gray-100 cursor-pointer">
                      I accept the Storeowner Commission Terms & Privacy Policy
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="ghost" 
              onClick={() => setStep(s => s - 1)} 
              disabled={step === 0}
              className="h-14 px-8 rounded-2xl font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-3" /> Go back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button 
                onClick={() => {
                  if (step === 0 && !formData.name) { setError("Please name your store first."); return }
                  setError("")
                  setStep(s => s + 1)
                }}
                className="h-14 px-12 rounded-2xl font-black text-white shadow-xl transition-all duration-300"
                style={{ background: formData.brand_color }}
              >
                Continue Setup <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!formData.accepted_terms || loading}
                className="h-14 px-14 rounded-2xl font-black text-white shadow-2xl transition-all duration-300 disabled:opacity-50"
                style={{ background: formData.brand_color }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : "Launch My Boutique"}
                {!loading && <Sparkles className="h-5 w-5 ml-3" />}
              </Button>
            )}
          </div>
        </div>

        {/* Global Redirect to Login Link */}
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em]">
          EAGLE CHOICE MARKETPLACE &bull; GHANA
        </p>

      </div>
    </div>
  )
}
