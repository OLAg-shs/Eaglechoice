"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Palette, Users, ChevronRight, ChevronLeft, Loader2, Sparkles, ShieldCheck, Tag, CreditCard, Zap, Layout, Monitor, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStore } from "@/lib/actions/stores"
import { useToast } from "@/components/ui/use-toast"
import ChoiceCardPreview from "@/components/ChoiceCardPreview"

const STEPS = [
  { id: 1, title: "Identity", icon: Store },
  { id: 2, title: "Capabilities", icon: Zap },
  { id: 3, title: "Stylist", icon: Palette },
  { id: 4, title: "Payout", icon: CreditCard },
]

const GHANA_BANKS = [
  "Absa Bank Ghana", "Access Bank Ghana", "ADB Bank", "Bank of Africa", 
  "CalBank", "Ecobank Ghana", "FBN Bank", "Fidelity Bank", "First Atlantic Bank", 
  "First National Bank", "G-Money", "GCB Bank", "GTBank", "National Investment Bank", 
  "OmniBSIC Bank", "Prudential Bank", "Republic Bank", "Societe Generale Ghana", 
  "Stanbic Bank", "Standard Chartered Bank", "UBA Ghana", "Universal Merchant Bank", "Zenith Bank"
]

export default function StoreSetupWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // -- FORM STATE --
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [tagline, setTagline] = useState("")
  
  // -- FEATURES STATE --
  const [features, setFeatures] = useState({
    ai_agents: true,
    branded_cards: true,
    analytics: true
  })

  // -- SUPREME METADATA --
  const [categoryFocus, setCategoryFocus] = useState("Technology")
  const [socialLinks, setSocialLinks] = useState({ instagram: "", x: "", facebook: "" })
  const [dashboardConfig, setDashboardConfig] = useState({ theme: "system", sidebar_style: "glass", primary_color: "#2563eb" })

  // -- CARD CONFIG STATE --
  const [cardConfig, setCardConfig] = useState<{
    theme: "midnight" | "gold" | "neon" | "minimal",
    layout: "landscape" | "portrait",
    primary_color: string
  }>({
    theme: "midnight",
    layout: "landscape",
    primary_color: "#2563eb"
  })
  
  // -- PAYOUT STATE --
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  async function handleLaunch() {
    setLoading(true)
    const formData = new FormData()
    formData.set("name", name)
    formData.set("slug", slug || name.toLowerCase().replace(/\s+/g, '-'))
    formData.set("tagline", tagline)
    formData.set("features", JSON.stringify(features))
    formData.set("card_config", JSON.stringify(cardConfig))
    formData.set("dashboard_config", JSON.stringify(dashboardConfig))
    formData.set("social_links", JSON.stringify(socialLinks))
    formData.set("category_focus", categoryFocus)
    formData.set("brand_color", cardConfig.primary_color)
    
    formData.set("payout_bank_name", bankName)
    formData.set("payout_account_number", accountNumber)
    formData.set("payout_account_name", accountName)
    
    const result = await createStore(formData)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Launch Failed", description: result.error })
    } else {
      toast({ title: "Welcome to Eagle Choice 🚀", description: "Your boutique is now live!" })
      router.push(`/store/${result.slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black font-sans selection:bg-blue-600 selection:text-white flex items-center justify-center p-6">
      
      {/* ── SETUP WIZARD CONTAINER ── */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-950 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-white dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Panel: Progress Sidebar */}
        <div className="w-full md:w-80 bg-blue-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-3xl flex items-center justify-center mb-10 shadow-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight mb-8">
              Master <span className="text-blue-200">Architect.</span>
            </h1>
            
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step >= s.id ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${step === s.id ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white'}`}>
                    {step > s.id ? <ShieldCheck className="h-5 w-5" /> : s.id}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Phase 0{s.id}</p>
                    <p className="text-sm font-black tracking-tight">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic font-mono">Eagle Choice Official</p>
        </div>

        {/* Right Panel: Step Content */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center overflow-y-auto max-h-screen">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Identity.</h2>
                <p className="text-gray-400 font-medium italic">What will the world call your boutique?</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Boutique Name</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Prestige Tech Ghana" 
                    className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xl font-bold px-6 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Short Catchy Tagline</Label>
                  <Input 
                    value={tagline} 
                    onChange={e => setTagline(e.target.value)} 
                    placeholder="e.g. Your choice, our priority" 
                    className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-base font-medium px-6"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Main Product Focus</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Technology', 'Fashion', 'Beauty', 'Services', 'Home', 'Other'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFocus(cat)}
                        className={`h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${categoryFocus === cat ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.1)]' : 'border-gray-50 dark:border-gray-900 opacity-60 hover:opacity-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!name}
                className="w-full h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
              >
                Assemble Capabilities <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}

          {/* STEP 2: CAPABILITIES (INTELLIGENCE SUITE) */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Capabilities.</h2>
                <p className="text-gray-400 font-medium italic">Activate advanced modules for your store dashboard.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'ai_agents', label: 'AI Inventory Manager', sub: 'Enable specialized agents to handle products.', icon: Users, color: 'text-emerald-500' },
                  { id: 'branded_cards', label: 'Identity Card System', sub: 'Generate premium digital cards for your boutique.', icon: Monitor, color: 'text-blue-500' },
                  { id: 'analytics', label: 'Market Insights', sub: 'Activate revenue & engagement tracking.', icon: TrendingUp, color: 'text-purple-500' },
                ].map((feat) => (
                  <button
                    key={feat.id}
                    onClick={() => setFeatures(prev => ({ ...prev, [feat.id]: !(prev as any)[feat.id] }))}
                    className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all text-left ${((features as any)[feat.id]) ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-900'}`}
                  >
                    <div className={`h-12 w-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center ${feat.color}`}>
                      <feat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-black tracking-tight">{feat.label}</h3>
                      <p className="text-xs text-gray-400 font-medium">{feat.sub}</p>
                    </div>
                    {((features as any)[feat.id]) && <ShieldCheck className="h-5 w-5 text-blue-600" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Enter Stylist Studio <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: STYLIST (LIVE CARD PREVIEW) */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Stylist.</h2>
                  <p className="text-gray-400 font-medium italic">Customize your Digital Choice Card. See it update live!</p>
                </div>

                {/* THE LIVE PREVIEW */}
                <div className="py-4">
                  <ChoiceCardPreview 
                    name={name} 
                    tagline={tagline} 
                    color={cardConfig.primary_color}
                    layout={cardConfig.layout}
                    theme={cardConfig.theme}
                    socials={socialLinks}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Layout</Label>
                  <div className="flex gap-2">
                    {['landscape', 'portrait'].map((l) => (
                      <button 
                        key={l}
                        onClick={() => setCardConfig(prev => ({ ...prev, layout: l as any }))}
                        className={`flex-1 h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${cardConfig.layout === l ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-gray-50'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Theme Engine</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['midnight', 'gold', 'neon', 'minimal'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setCardConfig(prev => ({ ...prev, theme: t as any }))}
                        className={`h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${cardConfig.theme === t ? 'border-blue-600 text-blue-600' : 'border-gray-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Signature Color</Label>
                 <div className="flex gap-3">
                   {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#000000'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setCardConfig(prev => ({ ...prev, primary_color: c }))}
                       className={`h-10 w-10 rounded-full border-4 transition-transform ${cardConfig.primary_color === c ? 'border-blue-600 scale-110' : 'border-transparent'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50 dark:border-gray-900 pt-8 mt-8">
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-[.2em] text-gray-400">Instagram</Label>
                   <Input value={socialLinks.instagram} onChange={e => setSocialLinks(p => ({...p, instagram: e.target.value}))} placeholder="@username" className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-sm font-bold px-4" />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-[.2em] text-gray-400">X (Twitter)</Label>
                   <Input value={socialLinks.x} onChange={e => setSocialLinks(p => ({...p, x: e.target.value}))} placeholder="@username" className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-sm font-bold px-4" />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-[.2em] text-gray-400">Facebook</Label>
                   <Input value={socialLinks.facebook} onChange={e => setSocialLinks(p => ({...p, facebook: e.target.value}))} placeholder="Page URL/Name" className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-sm font-bold px-4" />
                 </div>
               </div>

               <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] space-y-6 mt-8">
                 <div>
                   <h3 className="text-base font-black uppercase tracking-widest text-gray-900 dark:text-white">Workspace Stylist</h3>
                   <p className="text-[10px] text-gray-400 font-medium">Customize your private seller dashboard view.</p>
                 </div>
                 <div className="flex items-center gap-8">
                   <div className="space-y-3 flex-1">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dashboard Theme</Label>
                     <div className="flex gap-2">
                       {['light', 'dark', 'system'].map(t => (
                         <button
                           key={t}
                           onClick={() => setDashboardConfig(p => ({...p, theme: t}))}
                           className={`flex-1 h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${dashboardConfig.theme === t ? 'border-blue-600 bg-white dark:bg-black text-blue-600 shadow-sm' : 'border-gray-100 dark:border-gray-800 opacity-40'}`}
                         >
                           {t}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div className="space-y-3 shrink-0">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sidebar Style</Label>
                     <div className="flex gap-2">
                       {['solid', 'glass'].map(s => (
                         <button
                           key={s}
                           onClick={() => setDashboardConfig(p => ({...p, sidebar_style: s}))}
                           className={`px-4 h-10 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${dashboardConfig.sidebar_style === s ? 'border-blue-600 bg-white dark:bg-black text-blue-600 shadow-sm' : 'border-gray-100 dark:border-gray-800 opacity-40'}`}
                         >
                           {s}
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-gray-900 mt-8">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Configure Revenue <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYOUT DESTINATION */}
          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Revenue.</h2>
                <p className="text-gray-400 font-medium italic">Final step. Where should we send your earnings via Paystack?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement Bank</Label>
                  <select 
                    value={bankName} 
                    onChange={e => setBankName(e.target.value)}
                    className="w-full h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 px-6 text-xl font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all font-sans"
                  >
                    <option value="" disabled>Select Bank...</option>
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
                      className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-black text-xl px-6" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Name</Label>
                    <Input 
                      value={accountName} 
                      onChange={e => setAccountName(e.target.value)} 
                      placeholder="e.g. Ama Opoku" 
                      className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold px-6" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(3)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={handleLaunch}
                  disabled={loading}
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Build My Boutique 🚀"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
