"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Store, Palette, Users, Gavel, CheckCircle2, Loader2, ArrowRight, ArrowLeft,
  Shield, Sparkles, Tag, AtSign, Share2, Phone, Monitor, Sun, Moon,
  CreditCard, Zap, ShieldCheck, Globe, LayoutDashboard, MessageSquare,
  Star, Truck, Lock, Megaphone, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStore } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"

// ─── Step Definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: "identity",    title: "Identity",    icon: Store,         description: "Name your brand" },
  { id: "branding",   title: "Style",        icon: Palette,       description: "Brand color & card" },
  { id: "dashboard",  title: "Dashboard",    icon: Monitor,       description: "Your command center" },
  { id: "social",     title: "Social",       icon: Globe,         description: "Connect your channels" },
  { id: "experience", title: "Experience",   icon: Star,          description: "Buyer experience" },
  { id: "powers",     title: "Powers",       icon: Zap,           description: "Intelligence suite" },
  { id: "payout",     title: "Payout",       icon: CreditCard,    description: "Get paid" },
  { id: "team",       title: "Team",         icon: Users,         description: "Your crew" },
  { id: "terms",      title: "Launch",       icon: Gavel,         description: "Go live" },
]

// ─── Presets & Options ────────────────────────────────────────────────────────
const BRAND_COLORS = [
  "#7c3aed", "#2563eb", "#db2777", "#ea580c",
  "#16a34a", "#000000", "#0891b2", "#ca8a04",
  "#e11d48", "#4f46e5", "#0d9488", "#854d0e",
]

const CATEGORIES = [
  "Electronics", "Computers", "Mobile Phones", "Accessories",
  "Fashion", "Home Appliances", "Home & Living", "Food & Drinks",
  "Health & Beauty", "Sports", "Books", "Auto Parts", "Clothing", "Services",
]

const CARD_THEMES = [
  { id: "midnight", label: "Midnight",  sub: "Dark & powerful",     bg: "bg-[#0b0f1a]",  text: "text-white" },
  { id: "gold",     label: "Gold",      sub: "Luxury edition",       bg: "bg-gradient-to-br from-[#1a1c2c] to-[#4a3f35]", text: "text-amber-400" },
  { id: "neon",     label: "Neon",      sub: "Electric & bold",      bg: "bg-[#050505]",  text: "text-purple-400" },
  { id: "minimal",  label: "Minimal",   sub: "Clean & professional", bg: "bg-white border border-gray-100", text: "text-gray-900" },
]

const DASHBOARD_THEMES = [
  { id: "dark",   label: "Midnight",  sub: "Deep dark command center", icon: Moon },
  { id: "light",  label: "Light",     sub: "Bright & clean workspace",  icon: Sun },
  { id: "system", label: "System",    sub: "Follows device setting",    icon: Monitor },
]

const SIDEBAR_STYLES = [
  { id: "glass",  label: "Glassmorphic", sub: "Blurred, floating panel" },
  { id: "solid",  label: "Solid",        sub: "Sharp, professional look" },
]

const STORE_MODES = [
  { id: "online",   label: "Online Only",  sub: "Ship & deliver everywhere", icon: Globe },
  { id: "physical", label: "Physical",     sub: "Walk-in boutique",          icon: Store },
  { id: "hybrid",   label: "Hybrid",       sub: "Online + In-store",         icon: TrendingUp },
]

const AVAILABILITY_MODES = [
  { id: "open",        label: "Open to All",    sub: "Anyone can discover & order from you" },
  { id: "exclusive",   label: "Exclusive Mode", sub: "Buyers must request access first" },
  { id: "appointment", label: "By Appointment", sub: "Orders by scheduler only" },
]

const GHANA_BANKS = [
  "Absa Bank Ghana", "Access Bank Ghana", "ADB Bank", "Bank of Africa",
  "CalBank", "Ecobank Ghana", "FBN Bank", "Fidelity Bank", "First Atlantic Bank",
  "GCB Bank", "GTBank", "MTN MoMo", "Vodafone Cash", "AirtelTigo Money",
  "Stanbic Bank", "Standard Chartered Bank", "UBA Ghana", "Zenith Bank"
]

// ─── Default State ─────────────────────────────────────────────────────────────
const defaultFormData = {
  // Step 0 — Identity
  name: "",
  tagline: "",
  description: "",
  categories: [] as string[],
  // Step 1 — Branding
  brand_color: "#7c3aed",
  card_theme: "midnight",
  card_layout: "landscape" as "landscape" | "portrait",
  // Step 2 — Dashboard
  dashboard_theme: "dark",
  sidebar_style: "glass",
  // Step 3 — Social
  instagram: "",
  facebook: "",
  whatsapp: "",
  website: "",
  // Step 4 — Store Experience
  store_mode: "online",
  availability_mode: "open",
  announcement: "",
  // Step 5 — Powers (Intelligence Suite)
  feat_ai_agents: true,
  feat_branded_cards: true,
  feat_analytics: true,
  feat_negotiation: true,
  feat_loyalty: true,
  feat_reviews: true,
  feat_live_chat: false,
  // Step 6 — Payout
  payout_bank: "",
  payout_account_number: "",
  payout_account_name: "",
  // Step 7 — Team (no inputs, informational)
  // Step 8 — Terms
  accepted_terms: false,
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function StoreSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [form, setForm] = useState(defaultFormData)

  function set<K extends keyof typeof defaultFormData>(key: K, value: (typeof defaultFormData)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleCategory(cat: string) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function togglePower(key: keyof typeof defaultFormData) {
    setForm(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function canAdvance(): boolean {
    if (step === 0 && !form.name.trim()) { setError("Please give your store a name first."); return false }
    return true
  }

  async function handleSubmit() {
    if (!form.accepted_terms) { setError("Please accept the terms to continue."); return }
    setLoading(true)
    setError("")

    // ── Build FormData (this is the critical fix — createStore expects FormData) ──
    const fd = new FormData()
    fd.set("name", form.name)
    fd.set("tagline", form.tagline)
    fd.set("description", form.description)
    fd.set("brand_color", form.brand_color)
    fd.set("category_tags", form.categories.join(","))

    fd.set("card_config", JSON.stringify({
      theme: form.card_theme,
      layout: form.card_layout,
      primary_color: form.brand_color,
    }))

    fd.set("dashboard_config", JSON.stringify({
      theme: form.dashboard_theme,
      sidebar_style: form.sidebar_style,
      primary_color: form.brand_color,
    }))

    fd.set("social_links", JSON.stringify({
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      whatsapp: form.whatsapp || null,
      website: form.website || null,
    }))

    fd.set("features", JSON.stringify({
      ai_agents: form.feat_ai_agents,
      branded_cards: form.feat_branded_cards,
      analytics: form.feat_analytics,
      negotiation: form.feat_negotiation,
      loyalty: form.feat_loyalty,
      reviews: form.feat_reviews,
      live_chat: form.feat_live_chat,
    }))

    fd.set("store_config", JSON.stringify({
      mode: form.store_mode,
      availability: form.availability_mode,
      announcement: form.announcement,
    }))

    fd.set("payout_bank_name", form.payout_bank)
    fd.set("payout_account_number", form.payout_account_number)
    fd.set("payout_account_name", form.payout_account_name)
    fd.set("accepted_terms", "true")

    const res = await createStore(fd)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else if (res.slug) {
      setDone(true)
      setTimeout(() => router.push(`/store/${res.slug}`), 2200)
    }
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 font-sans">
        <div className="relative">
          <div className="absolute inset-0 blur-[100px] opacity-30 animate-pulse" style={{ background: form.brand_color }} />
          <div className="relative text-center space-y-6 animate-in zoom-in-50 duration-700">
            <div className="h-28 w-28 rounded-[2rem] bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="h-14 w-14 text-green-400" />
            </div>
            <div className="space-y-3">
              <h2 className="text-5xl font-black text-white tracking-tighter">Boutique Launched! 🚀</h2>
              <p className="text-gray-400 font-medium max-w-sm mx-auto italic">
                Welcome to the inner circle, <span style={{ color: form.brand_color }} className="font-black not-italic">{form.name}</span>. Setting up your command center...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── SHARED UI ─────────────────────────────────────────────────────────────────
  const accentBlob = (
    <div className="fixed inset-0 pointer-events-none opacity-15">
      <div className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-[160px] transition-colors duration-1000" style={{ background: form.brand_color }} />
      <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 transition-colors duration-1000" style={{ background: form.brand_color }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfaff] dark:bg-black font-sans selection:bg-purple-500 selection:text-white flex flex-col items-center justify-center p-4 lg:p-10 relative overflow-hidden">
      {accentBlob}

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-8">

        {/* ── Header ── */}
        <div className="text-center space-y-3 max-w-lg">
          <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center shadow-2xl transition-all duration-500" style={{ background: form.brand_color }}>
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Master <span style={{ color: form.brand_color }}>Architect.</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium italic mt-1">Build your empire, step by step. Eagle Choice scales with you.</p>
          </div>
        </div>

        {/* ── Step Progress ── */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="flex min-w-max md:min-w-full items-center justify-between px-4 md:px-8 relative gap-1">
            {/* Track line */}
            <div className="absolute h-0.5 w-[calc(100%-64px)] left-8 bg-gray-100 dark:bg-gray-800 top-5 z-0 rounded-full" />
            <div
              className="absolute h-0.5 left-8 top-5 z-0 rounded-full transition-all duration-700"
              style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - 64px)`, background: form.brand_color }}
            />
            {STEPS.map((s, i) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 w-20">
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 text-sm",
                    i < step
                      ? "text-white shadow-lg"
                      : i === step
                        ? "text-white shadow-xl scale-110"
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-300"
                  )}
                  style={i <= step ? { background: form.brand_color, borderColor: form.brand_color } : {}}
                >
                  {i < step ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                </div>
                <div className="text-center hidden md:block">
                  <p className={cn("text-[9px] font-black uppercase tracking-[0.15em]", i <= step ? "text-gray-900 dark:text-white" : "text-gray-400")}>{s.title}</p>
                  <p className="text-[8px] text-gray-400 italic truncate max-w-[72px]">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card Shell ── */}
        <div className="w-full bg-white dark:bg-gray-950/50 backdrop-blur-3xl border border-white/80 dark:border-gray-800 rounded-[3rem] p-8 md:p-14 shadow-[0_24px_64px_rgba(0,0,0,0.05)] dark:shadow-none min-h-[540px] flex flex-col">

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="flex-1">

            {/* ════════════════════════════════════════════
                STEP 0 — IDENTITY
            ════════════════════════════════════════════ */}
            {step === 0 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">First, your name.</h2>
                  <p className="text-gray-500 font-medium italic">The first thing buyers will see. Make it unforgettable.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store Name *</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-current transition-colors" style={{ color: form.brand_color }}>
                        <Store className="h-5 w-5" />
                      </div>
                      <Input
                        placeholder="e.g. Accra Gear Hub"
                        value={form.name}
                        onChange={e => set("name", e.target.value)}
                        className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-14 text-2xl font-black focus:ring-4 focus:ring-purple-500/10 placeholder:font-medium placeholder:text-gray-300 placeholder:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tagline</Label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-current transition-colors" style={{ color: form.brand_color }}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="e.g. Pure electronics, purely Ghanaian."
                        value={form.tagline}
                        onChange={e => set("tagline", e.target.value)}
                        className="h-13 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-12 font-bold focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</Label>
                    <Textarea
                      placeholder="Tell buyers what makes your boutique special..."
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      rows={3}
                      className="rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 resize-none font-medium focus:ring-4 focus:ring-purple-500/10"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Tag className="h-3 w-3" /> Market Categories
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200",
                            form.categories.includes(cat)
                              ? "text-white shadow-md scale-105"
                              : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                          )}
                          style={form.categories.includes(cat) ? { background: form.brand_color, borderColor: form.brand_color } : {}}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 1 — BRAND COLOR + IDENTITY CARD
            ════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Your Visual Identity.</h2>
                  <p className="text-gray-500 font-medium italic">Design your brand color and your official boutique identity card.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    {/* Brand Color */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Signature Color</Label>
                      <div className="grid grid-cols-6 gap-3">
                        {BRAND_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => set("brand_color", color)}
                            className={cn(
                              "h-12 w-full rounded-xl border-4 transition-all duration-200",
                              form.brand_color === color ? "scale-110 shadow-xl border-white dark:border-gray-700" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={form.brand_color}
                          onChange={e => set("brand_color", e.target.value)}
                          className="h-12 w-16 rounded-xl border border-gray-100 dark:border-gray-800 bg-transparent cursor-pointer"
                        />
                        <div className="flex-1 h-10 rounded-xl shadow-inner transition-all" style={{ background: form.brand_color, opacity: 0.2 }} />
                        <span className="font-mono text-sm font-bold text-gray-500 uppercase">{form.brand_color}</span>
                      </div>
                    </div>

                    {/* Card Layout */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Card Layout</Label>
                      <div className="flex gap-3">
                        {["landscape", "portrait"].map(l => (
                          <button
                            key={l}
                            onClick={() => set("card_layout", l as "landscape" | "portrait")}
                            className={cn(
                              "flex-1 h-12 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                              form.card_layout === l ? "text-white shadow-lg" : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400"
                            )}
                            style={form.card_layout === l ? { background: form.brand_color, borderColor: form.brand_color } : {}}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Theme */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Card Theme</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {CARD_THEMES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => set("card_theme", t.id)}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all",
                              t.bg,
                              form.card_theme === t.id ? "border-white/40 shadow-xl scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
                            )}
                          >
                            <p className={cn("text-xs font-black tracking-tight", t.text)}>{t.label}</p>
                            <p className="text-[9px] text-white/40 font-medium mt-0.5">{t.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  <div className="flex flex-col gap-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Live Preview</Label>
                    <div className="bg-gray-50/70 dark:bg-black/40 rounded-[2.5rem] p-8 flex items-center justify-center flex-1 border border-gray-100 dark:border-gray-800 shadow-inner">
                      <ChoiceCardPreview
                        name={form.name || "Your Boutique"}
                        tagline={form.tagline}
                        color={form.brand_color}
                        theme={form.card_theme as any}
                        layout={form.card_layout}
                        socials={{ instagram: form.instagram, facebook: form.facebook }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 2 — DASHBOARD VIBE
            ════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Your Command Center.</h2>
                  <p className="text-gray-500 font-medium italic">Customize how your seller portal looks and feels. This is where you run your empire.</p>
                </div>
                <div className="space-y-8">
                  {/* Dashboard Theme */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <LayoutDashboard className="h-3 w-3" /> Dashboard Theme
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {DASHBOARD_THEMES.map(t => {
                        const isSelected = form.dashboard_theme === t.id
                        return (
                          <button
                            key={t.id}
                            onClick={() => set("dashboard_theme", t.id)}
                            className={cn(
                              "p-6 rounded-3xl border-2 text-left transition-all duration-300 group",
                              isSelected
                                ? "shadow-xl scale-[1.02]"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                            )}
                            style={isSelected ? { borderColor: form.brand_color, background: form.brand_color + "10" } : {}}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={isSelected ? { background: form.brand_color + "20" } : { background: "#f3f4f6" }}>
                                <t.icon className="h-5 w-5" style={isSelected ? { color: form.brand_color } : { color: "#9ca3af" }} />
                              </div>
                              {isSelected && <ShieldCheck className="h-4 w-4 ml-auto" style={{ color: form.brand_color }} />}
                            </div>
                            <p className="text-sm font-black tracking-tight text-gray-900 dark:text-white">{t.label}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-1">{t.sub}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sidebar Style */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sidebar Style</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {SIDEBAR_STYLES.map(s => {
                        const isSelected = form.sidebar_style === s.id
                        return (
                          <button
                            key={s.id}
                            onClick={() => set("sidebar_style", s.id)}
                            className={cn(
                              "p-5 rounded-2xl border-2 text-left transition-all duration-200",
                              isSelected
                                ? "shadow-lg"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-200"
                            )}
                            style={isSelected ? { borderColor: form.brand_color, background: form.brand_color + "0d" } : {}}
                          >
                            <p className="text-sm font-black text-gray-900 dark:text-white">{s.label}</p>
                            <p className="text-[10px] text-gray-400 font-medium italic mt-0.5">{s.sub}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 3 — SOCIAL PRESENCE
            ════════════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Connect Your Channels.</h2>
                  <p className="text-gray-500 font-medium italic">Link your social presence. These will appear on your identity card and public storefront.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { key: "instagram", icon: AtSign, label: "Instagram",      placeholder: "@yourstore",            prefix: "" },
                    { key: "facebook",  icon: Share2, label: "Facebook",       placeholder: "facebook.com/yourstore", prefix: "" },
                    { key: "whatsapp",  icon: Phone,  label: "WhatsApp Number", placeholder: "+233 XX XXX XXXX",     prefix: "" },
                    { key: "website",   icon: Globe,  label: "Website",         placeholder: "https://yourstore.com", prefix: "" },
                  ].map(({ key, icon: Icon, label, placeholder }) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</Label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors text-gray-300 group-focus-within:text-current" style={{ color: form.brand_color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Input
                          placeholder={placeholder}
                          value={(form as any)[key]}
                          onChange={e => set(key as any, e.target.value)}
                          className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-12 font-bold focus:ring-4 focus:ring-purple-500/10"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live card preview with socials */}
                {(form.instagram || form.facebook) && (
                  <div className="bg-gray-50/70 dark:bg-black/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-inner">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Card Preview with Socials</Label>
                    <div className="max-w-md mx-auto">
                      <ChoiceCardPreview
                        name={form.name || "Your Boutique"}
                        tagline={form.tagline}
                        color={form.brand_color}
                        theme={form.card_theme as any}
                        layout={form.card_layout}
                        socials={{ instagram: form.instagram, facebook: form.facebook }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 4 — STORE EXPERIENCE
            ════════════════════════════════════════════ */}
            {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Design Your Store Experience.</h2>
                  <p className="text-gray-500 font-medium italic">Define how your boutique operates and what customers experience when they arrive.</p>
                </div>

                {/* Store Mode */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Truck className="h-3 w-3" /> Store Mode
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {STORE_MODES.map(m => {
                      const isSelected = form.store_mode === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => set("store_mode", m.id)}
                          className={cn(
                            "p-5 rounded-3xl border-2 text-left transition-all duration-200",
                            isSelected ? "shadow-xl scale-[1.02]" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800"
                          )}
                          style={isSelected ? { borderColor: form.brand_color, background: form.brand_color + "10" } : {}}
                        >
                          <m.icon className="h-5 w-5 mb-2" style={isSelected ? { color: form.brand_color } : { color: "#9ca3af" }} />
                          <p className="text-sm font-black text-gray-900 dark:text-white">{m.label}</p>
                          <p className="text-[10px] text-gray-400 italic mt-0.5">{m.sub}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Availability Mode */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Buyer Accessibility
                  </Label>
                  <div className="space-y-3">
                    {AVAILABILITY_MODES.map(m => {
                      const isSelected = form.availability_mode === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => set("availability_mode", m.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all",
                            isSelected ? "shadow-lg" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800"
                          )}
                          style={isSelected ? { borderColor: form.brand_color, background: form.brand_color + "0d" } : {}}
                        >
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{m.label}</p>
                            <p className="text-[10px] text-gray-400 italic mt-0.5">{m.sub}</p>
                          </div>
                          {isSelected && <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: form.brand_color }} />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Store Announcement */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Megaphone className="h-3 w-3" /> Store Announcement Banner (optional)
                  </Label>
                  <Textarea
                    placeholder="e.g. 🔥 Weekend sale — 20% off all laptops! Limited stock."
                    value={form.announcement}
                    onChange={e => set("announcement", e.target.value)}
                    rows={2}
                    className="rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 resize-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 5 — INTELLIGENCE POWERS
            ════════════════════════════════════════════ */}
            {step === 5 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Activate Your Powers.</h2>
                  <p className="text-gray-500 font-medium italic">Choose what intelligence your boutique runs on. You can change any of these anytime from Settings.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "feat_ai_agents",    label: "AI Inventory Agents",  sub: "Agents manage products & respond to buyers.",       icon: Users },
                    { key: "feat_branded_cards", label: "Identity Card System", sub: "Your official Eagle Choice boutique card.",          icon: CreditCard },
                    { key: "feat_analytics",     label: "Market Insights",       sub: "Revenue tracking, trending products, heatmaps.",    icon: TrendingUp },
                    { key: "feat_negotiation",   label: "Price Negotiation",     sub: "Let buyers make offers on your products.",          icon: MessageSquare },
                    { key: "feat_loyalty",       label: "Loyalty Points",        sub: "Reward repeat buyers with Eagle Choice points.",    icon: Star },
                    { key: "feat_reviews",       label: "Product Reviews",       sub: "Let verified buyers rate your products.",           icon: ShieldCheck },
                    { key: "feat_live_chat",     label: "Live Chat",             sub: "Real-time buyer ↔ seller messaging in-store.",      icon: Phone },
                  ].map(({ key, label, sub, icon: Icon }) => {
                    const isOn = (form as any)[key] as boolean
                    return (
                      <button
                        key={key}
                        onClick={() => togglePower(key as any)}
                        className={cn(
                          "flex items-center gap-5 p-5 rounded-3xl border-2 text-left transition-all duration-200 group",
                          isOn ? "shadow-lg scale-[1.01]" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                        )}
                        style={isOn ? { borderColor: form.brand_color, background: form.brand_color + "10" } : {}}
                      >
                        <div
                          className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all"
                          style={isOn ? { background: form.brand_color + "20" } : { background: "#f3f4f6" }}
                        >
                          <Icon className="h-5 w-5 transition-colors" style={isOn ? { color: form.brand_color } : { color: "#9ca3af" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 dark:text-white">{label}</p>
                          <p className="text-[10px] text-gray-400 font-medium italic mt-0.5 line-clamp-1">{sub}</p>
                        </div>
                        <div
                          className={cn("h-6 w-11 rounded-full flex items-center transition-all px-0.5 shrink-0 border-2", isOn ? "justify-end" : "justify-start")}
                          style={isOn ? { background: form.brand_color, borderColor: form.brand_color } : { background: "#e5e7eb", borderColor: "#e5e7eb" }}
                        >
                          <div className="h-4 w-4 rounded-full bg-white shadow-sm transition-all" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 6 — PAYOUT SETUP
            ════════════════════════════════════════════ */}
            {step === 6 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Set Up Your Payouts.</h2>
                  <p className="text-gray-500 font-medium italic">Where should Eagle Choice send your revenue? Skip for now if you prefer — you can add this later in Settings.</p>
                </div>
                <div className="space-y-5 max-w-lg">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement Bank / Mobile Money</Label>
                    <select
                      value={form.payout_bank}
                      onChange={e => set("payout_bank", e.target.value)}
                      className="w-full h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-purple-500/10 transition-all font-sans"
                    >
                      <option value="">Select your bank or MoMo...</option>
                      {GHANA_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account / MoMo Number</Label>
                    <Input
                      value={form.payout_account_number}
                      onChange={e => set("payout_account_number", e.target.value)}
                      placeholder="0244 XXX XXX or 0000000000"
                      className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account / MoMo Name</Label>
                    <Input
                      value={form.payout_account_name}
                      onChange={e => set("payout_account_name", e.target.value)}
                      placeholder="e.g. Ama Opoku"
                      className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">
                  💡 You can skip this and add bank details later in your Settings. Your revenue will hold until payout details are added.
                </p>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 7 — TEAM
            ════════════════════════════════════════════ */}
            {step === 7 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">You & Your Crew.</h2>
                  <p className="text-gray-500 font-medium italic">Every great boutique has great support. Your team comes after launch — invite agents from your dashboard.</p>
                </div>
                <div className="p-10 rounded-[3rem] border-2 text-center space-y-6"
                  style={{ borderColor: form.brand_color + "22", background: form.brand_color + "06" }}
                >
                  <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center mx-auto shadow-sm border" style={{ borderColor: form.brand_color + "30" }}>
                    <Users className="h-10 w-10 text-gray-200" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Self-Managed Mode — Active</p>
                    <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto italic">
                      You're the primary agent of your boutique right now. Once you're live, head to your dashboard to invite team members, assign roles, and delegate orders.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-4">
                    {["Owner", "Agent", "Manager"].map(role => (
                      <div key={role} className="text-center">
                        <div className="h-10 w-10 rounded-xl mx-auto mb-1 flex items-center justify-center text-xs font-black text-white" style={{ background: form.brand_color + (role === "Owner" ? "ff" : role === "Agent" ? "80" : "40") }}>
                          {role[0]}
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                STEP 8 — TERMS & LAUNCH
            ════════════════════════════════════════════ */}
            {step === 8 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3">Ready to Launch.</h2>
                  <p className="text-gray-500 font-medium italic">Eagle Choice handles marketing, hosting, and payments. In exchange, we grow together.</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Store Name",    value: form.name || "—" },
                    { label: "Theme",         value: form.card_theme },
                    { label: "Dashboard",     value: form.dashboard_theme },
                    { label: "Store Mode",    value: form.store_mode },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white capitalize truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-8 rounded-3xl border-2 space-y-6" style={{ borderColor: form.brand_color + "33", background: form.brand_color + "08" }}>
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white" style={{ background: form.brand_color }}>
                      <Gavel className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">The 5% Partnership</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic text-sm">
                        By launching your boutique, you agree that Eagle Choice takes a <span className="font-black not-italic" style={{ color: form.brand_color }}>5% commission</span> on every successful product sale. This fee covers your storefront hosting, the GH Payments gateway, and platform marketing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: form.brand_color + "22" }}>
                    <input
                      type="checkbox"
                      id="accept_terms"
                      checked={form.accepted_terms}
                      onChange={e => set("accepted_terms", e.target.checked)}
                      className="h-6 w-6 rounded-lg border-2 cursor-pointer"
                      style={{ accentColor: form.brand_color }}
                    />
                    <Label htmlFor="accept_terms" className="text-sm font-black text-gray-800 dark:text-gray-100 cursor-pointer">
                      I accept the Storeowner Commission Terms & Privacy Policy
                    </Label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Navigation Controls ── */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={() => { setError(""); setStep(s => s - 1) }}
              disabled={step === 0}
              className="h-14 px-8 rounded-2xl font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Button>

            <div className="flex items-center gap-3">
              {/* Step counter */}
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {step + 1} / {STEPS.length}
              </span>

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => {
                    if (!canAdvance()) return
                    setError("")
                    setStep(s => s + 1)
                  }}
                  className="h-14 px-12 rounded-2xl font-black text-white shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: form.brand_color }}
                >
                  Continue <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!form.accepted_terms || loading}
                  className="h-14 px-14 rounded-2xl font-black text-white shadow-2xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  style={{ background: form.brand_color }}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />}
                  {loading ? "Launching..." : "Launch My Boutique"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
          Eagle Choice Marketplace • Ghana
        </p>
      </div>
    </div>
  )
}
