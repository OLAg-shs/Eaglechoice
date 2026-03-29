"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Palette, Tag, ImageIcon, Loader2, Save, Globe, CreditCard, Zap, ShieldCheck, Monitor, LayoutDashboard, Share2, AtSign, Phone, Truck, Lock, Megaphone, Shield, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateStore } from "@/lib/actions/stores"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"

const CATEGORY_PRESETS = [
  "Electronics", "Fashion", "Food & Drinks", "Health & Beauty",
  "Home & Living", "Sports", "Books", "Auto Parts",
  "Computers", "Phones & Tablets", "Clothing", "Services",
]

const GHANA_BANKS = [
  "Absa Bank Ghana", "Access Bank Ghana", "ADB Bank", "Bank of Africa", 
  "CalBank", "Ecobank Ghana", "FBN Bank", "Fidelity Bank", "First Atlantic Bank", 
  "First National Bank", "G-Money", "GCB Bank", "GTBank", "National Investment Bank", 
  "OmniBSIC Bank", "Prudential Bank", "Republic Bank", "Societe Generale Ghana", 
  "Stanbic Bank", "Standard Chartered Bank", "UBA Ghana", "Universal Merchant Bank", "Zenith Bank"
]

const THEMES = [
  { id: 'modern', label: 'Modern', sub: 'Glassmorphic' },
  { id: 'luxury', label: 'Luxury', sub: 'Gold & Black' },
  { id: 'minimal', label: 'Minimal', sub: 'Clean & Airy' },
]

export default function StoreSettingsForm({ store }: { store: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState(store.name)
  const [tagline, setTagline] = useState(store.tagline || "")
  const [description, setDescription] = useState(store.description || "")
  const [brandColor, setBrandColor] = useState(store.brand_color || "#2563eb")
  const [themeId, setThemeId] = useState(store.theme_id || "modern")
  
  // Master Architect State
  const [features, setFeatures] = useState(store.features || { ai_agents: true, branded_cards: true, analytics: true, negotiation: true, loyalty: true, reviews: true, live_chat: false })
  const [cardConfig, setCardConfig] = useState(store.card_config || { theme: "midnight", layout: "landscape", primary_color: brandColor })
  const [dashboardConfig, setDashboardConfig] = useState(store.dashboard_config || { theme: "dark", sidebar_style: "glass", primary_color: brandColor })
  const [storeConfig, setStoreConfig] = useState(store.store_config || { mode: "online", availability: "open", announcement: "" })
  const [socialLinks, setSocialLinks] = useState(store.social_links || { instagram: "", facebook: "", whatsapp: "", website: "" })

  // Payout State
  const [bankName, setBankName] = useState(store.payout_bank_name || "")
  const [accountNumber, setAccountNumber] = useState(store.payout_account_number || "")
  const [accountName, setAccountName] = useState(store.payout_account_name || "")

  const [selectedCategories, setSelectedCategories] = useState<string[]>(store.category_tags || [])
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo_url)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function updateSocial(key: string, val: string) {
    setSocialLinks((prev: any) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.set("name", name)
    formData.set("tagline", tagline)
    formData.set("description", description)
    formData.set("brand_color", brandColor)
    formData.set("theme_id", themeId)
    formData.set("payout_bank_name", bankName)
    formData.set("payout_account_number", accountNumber)
    formData.set("payout_account_name", accountName)
    formData.set("category_tags", selectedCategories.join(","))
    
    // Set all the new JSON chunks
    formData.set("features", JSON.stringify(features))
    formData.set("card_config", JSON.stringify(cardConfig))
    formData.set("dashboard_config", JSON.stringify(dashboardConfig))
    formData.set("store_config", JSON.stringify(storeConfig))
    formData.set("social_links", JSON.stringify(socialLinks))
    
    if (logoFile) formData.set("logo", logoFile)

    const result = await updateStore(store.id, formData)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Update Failed", description: result.error })
    } else {
      toast({ title: "Settings Saved ✅", description: "Your boutique configurations have been updated." })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Identity & Logic */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <Globe className="h-6 w-6 text-blue-600" />
              Public Identity
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Tagline</Label>
                <Input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Premium Tech Boutique" className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Tell your story..." className="rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <Truck className="h-6 w-6 text-purple-600" />
              Store Experience
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store Mode</Label>
                <div className="flex gap-2">
                  {['online', 'physical', 'hybrid'].map((m) => (
                    <button 
                      key={m} type="button"
                      onClick={() => setStoreConfig((prev: any) => ({ ...prev, mode: m }))}
                      className={`flex-1 p-3 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${storeConfig.mode === m ? 'border-purple-600 bg-purple-50/50 text-purple-600 dark:bg-purple-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Buyer Availability</Label>
                <div className="flex gap-2">
                  {['open', 'exclusive', 'appointment'].map((a) => (
                    <button 
                      key={a} type="button"
                      onClick={() => setStoreConfig((prev: any) => ({ ...prev, availability: a }))}
                      className={`flex-1 p-3 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${storeConfig.availability === a ? 'border-purple-600 bg-purple-50/50 text-purple-600 dark:bg-purple-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Announcement Banner</Label>
                <Input value={storeConfig.announcement} onChange={e => setStoreConfig((prev: any) => ({ ...prev, announcement: e.target.value }))} placeholder="Optional flash sale text..." className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <Share2 className="h-6 w-6 text-pink-500" />
              Social Presence
            </h2>
            <div className="space-y-4">
              {[
                { key: 'instagram', label: 'Instagram', icon: AtSign, placeholder: '@yourstore' },
                { key: 'facebook', label: 'Facebook', icon: Share2, placeholder: 'facebook.com/yourstore' },
                { key: 'whatsapp', label: 'WhatsApp', icon: Phone, placeholder: '+233 XX XXX XXXX' },
                { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://...' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icon className="h-4 w-4" /></div>
                    <Input value={(socialLinks as any)[key]} onChange={e => updateSocial(key, e.target.value)} placeholder={placeholder} className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 pl-11" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Suite Toggles */}
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <Zap className="h-6 w-6 text-yellow-500" />
              Intelligence Suite
            </h2>
            <div className="space-y-3">
              {[
                { id: 'ai_agents', label: 'AI Inventory Manager', sub: 'Enable agents to handle products.' },
                { id: 'branded_cards', label: 'Identity Card System', sub: 'Generate premium digital cards.' },
                { id: 'analytics', label: 'Market Insights', sub: 'Activate revenue tracking.' },
                { id: 'negotiation', label: 'Price Negotiation', sub: 'Allow buyers to make offers.' },
                { id: 'loyalty', label: 'Loyalty Points', sub: 'Rewards for repeat buyers.' },
              ].map((feat) => (
                <button
                  key={feat.id} type="button"
                  onClick={() => setFeatures((prev: any) => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                  className={`flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all text-left ${features[feat.id] ? 'border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-black tracking-tight">{feat.label}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">{feat.sub}</p>
                  </div>
                  {features[feat.id] && <ShieldCheck className="h-5 w-5 text-yellow-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <CreditCard className="h-6 w-6 text-orange-600" />
              Payout & Revenue
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement Bank</Label>
                <select 
                  value={bankName} 
                  onChange={e => setBankName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 px-4 text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all font-sans"
                >
                  <option value="" disabled>Select your bank...</option>
                  {GHANA_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Number</Label>
                  <Input 
                    value={accountNumber} 
                    onChange={e => setAccountNumber(e.target.value)} 
                    placeholder="0000000000" 
                    className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Name</Label>
                  <Input 
                    value={accountName} 
                    onChange={e => setAccountName(e.target.value)} 
                    placeholder="e.g. Ama Opoku" 
                    className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Aesthetics */}
        <div className="space-y-6">

          {/* Card Studio Portal */}
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm group hover:border-blue-500/50 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <Shield className="h-24 w-24 -rotate-12" />
             </div>
             <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-black flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  Card Studio
                </h2>
                <Link href={`/store/${store.slug}/settings/card-studio`}>
                  <Button type="button" variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-blue-600 hover:text-white transition-all scale-90">
                    <Maximize className="h-4 w-4" /> Enter Studio
                  </Button>
                </Link>
             </div>
             
             <div className="transform scale-[0.65] origin-top opacity-80 pointer-events-none group-hover:scale-[0.7] group-hover:opacity-100 transition-all duration-700 -mb-20">
                <ChoiceCardPreview 
                  name={name}
                  tagline={tagline}
                  color={brandColor}
                  layout={cardConfig.layout}
                  theme={cardConfig.theme}
                  socials={socialLinks}
                  layoutData={cardConfig}
                />
             </div>
             
             <p className="text-[11px] text-gray-400 font-medium italic mt-4 text-center group-hover:text-blue-600 transition-colors relative z-10">
                Tap and drag to architect your identity.
             </p>
          </div>

          {/* Dashboard Vibes */}
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <LayoutDashboard className="h-6 w-6 text-teal-600" />
              Dashboard Theme
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Seller Portal Theme</Label>
                <div className="flex gap-2">
                  {['dark', 'light', 'system'].map((t) => (
                    <button 
                      key={t} type="button"
                      onClick={() => setDashboardConfig((prev: any) => ({ ...prev, theme: t }))}
                      className={`flex-1 p-3 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${dashboardConfig.theme === t ? 'border-teal-600 bg-teal-50/50 text-teal-600 dark:bg-teal-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sidebar Style</Label>
                <div className="flex gap-2">
                  {['glass', 'solid'].map((s) => (
                    <button 
                      key={s} type="button"
                      onClick={() => setDashboardConfig((prev: any) => ({ ...prev, sidebar_style: s }))}
                      className={`flex-1 p-3 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${dashboardConfig.sidebar_style === s ? 'border-teal-600 bg-teal-50/50 text-teal-600 dark:bg-teal-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Stylist Live Preview */}
          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <Palette className="h-6 w-6 text-indigo-600" />
              Identity Card (Live)
            </h2>
            
            <div className="space-y-6">
              <ChoiceCardPreview 
                name={name} 
                tagline={tagline} 
                color={cardConfig.primary_color || brandColor}
                layout={cardConfig.layout || "landscape"}
                theme={cardConfig.theme || "midnight"}
                socials={{ instagram: socialLinks.instagram, facebook: socialLinks.facebook }}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Layout</Label>
                  <div className="flex gap-2">
                    {['landscape', 'portrait'].map((l) => (
                      <button 
                        key={l} type="button"
                        onClick={() => setCardConfig((prev: any) => ({ ...prev, layout: l }))}
                        className={`flex-1 h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${cardConfig.layout === l ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-gray-50'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['midnight', 'gold', 'neon', 'minimal'].map((t) => (
                      <button 
                        key={t} type="button"
                        onClick={() => setCardConfig((prev: any) => ({ ...prev, theme: t }))}
                        className={`h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${cardConfig.theme === t ? 'border-indigo-600 text-indigo-600' : 'border-gray-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
              <ImageIcon className="h-6 w-6 text-blue-600" />
              Brand Accents
            </h2>
            
            <div className="space-y-8">
              {/* Logo Upload */}
              <div className="flex items-center gap-6">
                <label className="relative h-24 w-24 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all shrink-0 bg-gray-50 dark:bg-gray-900 group shadow-inner">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) }
                  }} />
                </label>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">Brand Mark</p>
                  <p className="text-xs text-gray-400 italic">Click to upload your store logo.</p>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Boutique Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEMES.map(t => (
                    <button
                      key={t.id} type="button" onClick={() => setThemeId(t.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${themeId === t.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800'}`}
                    >
                      <p className="text-sm font-black tracking-tight leading-none mb-1">{t.label}</p>
                      <p className="text-[9px] text-gray-400 font-medium italic">{t.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Color */}
              <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-900">
                <Label className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Signature Color</span>
                  <span className="font-mono text-xs font-bold uppercase text-gray-500">{brandColor}</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input type="color" value={brandColor} onChange={e => {
                    setBrandColor(e.target.value);
                    setCardConfig((prev: any) => ({ ...prev, primary_color: e.target.value }));
                    setDashboardConfig((prev: any) => ({ ...prev, primary_color: e.target.value }));
                  }}
                    className="h-12 w-24 rounded-xl border border-gray-100 dark:border-gray-800 bg-transparent cursor-pointer" />
                  <div className="flex-1 h-12 rounded-xl shadow-inner animate-in fade-in transition-all" style={{ background: brandColor, opacity: 0.15 }} />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-900">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Marketplace Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESETS.map(cat => (
                    <button
                      key={cat} type="button" onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${selectedCategories.includes(cat) ? "text-white border-transparent" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-200"}`}
                      style={selectedCategories.includes(cat) ? { background: brandColor } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100 dark:border-gray-900">
        <p className="text-xs text-gray-500 font-medium italic">Changes will reflect instantly on your public /{store.slug} storefront.</p>
        <Button type="submit" disabled={loading} className="px-12 font-black text-white border-none h-16 rounded-[2rem] shadow-xl text-lg hover:scale-105 transition-all" style={{ background: brandColor }}>
          {loading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
          Enforce Style
        </Button>
      </div>
    </form>
  )
}
