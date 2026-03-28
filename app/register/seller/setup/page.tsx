"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Palette, Users, ChevronRight, ChevronLeft, Loader2, Sparkles, ShieldCheck, Tag, CreditCard, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStore } from "@/lib/actions/stores"
import { useToast } from "@/components/ui/use-toast"

const STEPS = [
  { id: 1, title: "Identity", icon: Store },
  { id: 2, title: "Vibe", icon: Palette },
  { id: 3, title: "Agents", icon: Users },
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

  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [theme, setTheme] = useState("modern")
  const [font, setFont] = useState("sans")
  const [agentEmail, setAgentEmail] = useState("")
  
  // Payout State
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")

  async function handleLaunch() {
    setLoading(true)
    const formData = new FormData()
    formData.set("name", name)
    formData.set("slug", slug || name.toLowerCase().replace(/\s+/g, '-'))
    formData.set("theme_id", theme)
    formData.set("font_preset", font)
    formData.set("payout_bank_name", bankName)
    formData.set("payout_account_number", accountNumber)
    formData.set("payout_account_name", accountName)
    
    const result = await createStore(formData)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Launch Failed", description: result.error })
    } else {
      toast({ title: "Welcome to Eagle Choice 🚀", description: "Your boutique is now live!" })
      router.push(`/store/${slug}/products/new`)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black font-sans selection:bg-blue-600 selection:text-white flex items-center justify-center p-6">
      
      {/* ── SETUP WIZARD CONTAINER ── */}
      <div className="w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-white dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Panel: Progress Sidebar */}
        <div className="w-full md:w-80 bg-blue-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-3xl flex items-center justify-center mb-10 shadow-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight mb-8">
              Build your <span className="text-blue-200">Boutique.</span>
            </h1>
            
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step >= s.id ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${step === s.id ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white'}`}>
                    {step > s.id ? <ShieldCheck className="h-5 w-5" /> : s.id}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 0{s.id}</p>
                    <p className="text-sm font-black tracking-tight">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">Eagle Choice Standard</p>
        </div>

        {/* Right Panel: Step Content */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Your Identity.</h2>
                <p className="text-gray-400 font-medium italic">What will the world call your boutique?</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store Name</Label>
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Ivory Tech Studio" 
                    className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xl font-bold px-6 focus:ring-4 focus:ring-blue-600/10"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Store URL Prefix</Label>
                  <div className="relative">
                    <Input 
                      value={slug} 
                      onChange={e => setSlug(e.target.value)} 
                      placeholder="ivory-tech" 
                      className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-xl font-mono px-6 pl-10"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!name}
                className="w-full h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
              >
                Continue to Styling <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}

          {/* STEP 2: VIBE (STYLE STUDIO LIGHT) */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">The Vibe.</h2>
                <p className="text-gray-400 font-medium italic">How should your store feel to buyers?</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'modern', label: 'Modern', sub: 'Glassmorphic, slick, and energetic.', icon: Zap, color: 'text-blue-500' },
                  { id: 'luxury', label: 'Luxury', sub: 'Gold accents, premium black/white fonts.', icon: Sparkles, color: 'text-yellow-500' },
                  { id: 'minimal', label: 'Minimal', sub: 'Airy, clean, and focus-driven.', icon: Tag, color: 'text-gray-500' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all text-left group ${theme === t.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-900 md:hover:border-gray-100'}`}
                  >
                    <div className={`h-14 w-14 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 ${t.color}`}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">{t.label}</h3>
                      <p className="text-xs text-gray-400 font-medium">{t.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Configure Agents <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: AGENTS */}
          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Your Team.</h2>
                <p className="text-gray-400 font-medium italic">Would you like specialized agents to manage products for you?</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-6">
                <p className="text-sm font-bold text-gray-500 leading-relaxed">
                  Agents handle inquiries and negotiations. You can manage everything yourself, or invite others to your team later.
                </p>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Standard Eagle Verification Included</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Configure Payouts <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYOUT DESTINATION */}
          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Your Revenue.</h2>
                <p className="text-gray-400 font-medium italic">Where should we send your earnings via Paystack?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Settlement Bank</Label>
                  <select 
                    value={bankName} 
                    onChange={e => setBankName(e.target.value)}
                    className="w-full h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 px-6 text-xl font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all"
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
                      className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Name</Label>
                    <Input 
                      value={accountName} 
                      onChange={e => setAccountName(e.target.value)} 
                      placeholder="e.g. Ama Opoku" 
                      className="h-16 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">You can also skip this and add it later in Store Settings.</p>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(3)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={handleLaunch}
                  disabled={loading}
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all text-lg group shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Build My Store 🚀"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
