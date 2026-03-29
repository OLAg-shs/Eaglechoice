"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ShoppingBag, Smartphone, Laptop, Shirt, Headphones, ChevronRight, ChevronLeft, Loader2, ShieldCheck, Zap, Monitor, Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getCategoryPriceRange, saveBuyerPreferences } from "@/lib/actions/buyer"

const CATEGORIES = [
  { id: 'phones', label: 'Mobile Phones', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'laptop', label: 'Laptops', icon: Laptop, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'fashion', label: 'Fashion & Shoes', icon: Shirt, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'accessory', label: 'Accessories', icon: Headphones, color: 'text-emerald-500', bg: 'bg-emerald-50' },
]

const STEPS = [
  { id: 1, title: "Your Needs", icon: ShoppingBag },
  { id: 2, title: "Smart Budget", icon: Zap },
  { id: 3, title: "Dash Style", icon: Monitor },
  { id: 4, title: "Ready", icon: ShieldCheck },
]

export default function BuyerDiscoveryWizard() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetchingRange, setFetchingRange] = useState(false)

  // -- FORM STATE --
  const [interests, setInterests] = useState<string[]>([])
  const [priceRanges, setPriceRanges] = useState<Record<string, { min: number, max: number, selected: number }>>({})
  
  // -- FEATURE STATE --
  const [features, setFeatures] = useState({
    priority_discovery: true,
    member_identity_card: true,
    smart_alerts: true
  })

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  // Fetch price ranges when moving to step 2
  useEffect(() => {
    if (step === 2 && interests.length > 0) {
      const fetchRanges = async () => {
        setFetchingRange(true)
        const ranges: Record<string, any> = {}
        for (const catId of interests) {
          const range = await getCategoryPriceRange([catId])
          ranges[catId] = { 
            min: range.min || 0, 
            max: range.max || 10000, 
            selected: range.max || 5000 
          }
        }
        setPriceRanges(ranges)
        setFetchingRange(false)
      }
      fetchRanges()
    }
  }, [step, interests])

  async function handleComplete() {
    setLoading(true)
    const preferences = {
      interests: interests.map(id => ({
        id,
        budget_limit: priceRanges[id]?.selected || 5000
      })),
      features,
      onboarding_complete: true
    }

    const result = await saveBuyerPreferences(preferences)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Setup Failed", description: result.error })
    } else {
      toast({ title: "Experience Built! 🪄", description: "Your personalized Choice dashboard is ready." })
      router.push("/catalog")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-blue-600 selection:text-white flex items-center justify-center p-6">
      
      {/* ── DISCOVERY WIZARD CONTAINER ── */}
      <div className="w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Panel: Progress Sidebar */}
        <div className="w-full md:w-80 bg-black p-12 text-white flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-10 shadow-xl shadow-blue-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight mb-8">
              Experience <span className="text-blue-500">Architect.</span>
            </h1>
            
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step >= s.id ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${step === s.id ? 'bg-blue-600 text-white border-blue-600' : 'border-white/30 text-white'}`}>
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
          
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic font-mono">Eagle Choice Standard</p>
        </div>

        {/* Right Panel: Step Content */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center overflow-y-auto max-h-screen">
          
          {/* PHASE 1: NEEDS */}
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Your Interests.</h2>
                <p className="text-gray-400 font-medium italic">What are you looking for today? Select all that apply.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${interests.includes(cat.id) ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-900 hover:border-gray-100'}`}
                  >
                    <div className={`h-14 w-14 rounded-2xl ${cat.bg} dark:bg-gray-800 flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                      <cat.icon className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-black tracking-tight uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={interests.length === 0}
                className="w-full h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
              >
                Set My Budget <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          )}

          {/* PHASE 2: SMART BUDGETING */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Smart Budget.</h2>
                <p className="text-gray-400 font-medium italic">Set your range for prioritized results.</p>
              </div>

              {fetchingRange ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Scanning Platform Stores...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {interests.map((catId) => {
                    const cat = CATEGORIES.find(c => c.id === catId)
                    const range = priceRanges[catId]
                    if (!cat || !range) return null
                    return (
                      <div key={catId} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-3">
                            <cat.icon className={`h-5 w-5 ${cat.color}`} />
                            <span className="text-sm font-black uppercase tracking-tight">{cat.label}</span>
                          </div>
                          <span className="text-xl font-black text-blue-600 tracking-tighter">GHS {range.selected.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range"
                          min={range.min}
                          max={range.max}
                          step={10}
                          value={range.selected}
                          onChange={(e) => setPriceRanges(prev => ({
                            ...prev,
                            [catId]: { ...prev[catId], selected: parseInt(e.target.value) }
                          }))}
                          className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>Min: GHS {range.min}</span>
                          <span>Max: GHS {range.max}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={interests.length === 0}
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Configure My Dash <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* PHASE 3: DASHBOARD ARCHITECT (NEW) */}
          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Dash Style.</h2>
                <p className="text-gray-400 font-medium italic">Activate smart modules for your member dashboard.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'priority_discovery', label: 'Priority Discovery', sub: 'Always show products in my budget first.', icon: Heart, color: 'text-rose-500' },
                  { id: 'member_identity_card', label: 'Member Identity Card', sub: 'Generate my unique Choice Digital ID.', icon: Monitor, color: 'text-blue-500' },
                  { id: 'smart_alerts', label: 'Smart Order IQ', sub: 'AI notifications for price drops & deals.', icon: Bell, color: 'text-amber-500' },
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
                <Button variant="ghost" onClick={() => setStep(2)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-black transition-all text-lg group shadow-xl shadow-blue-500/10"
                >
                  Confirm Setup <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {/* PHASE 4: FINAL */}
          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Complete.</h2>
                <p className="text-gray-400 font-medium italic">Your personalized system has been built.</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 space-y-6">
                <p className="text-sm font-bold text-gray-500 leading-relaxed italic">
                  "Perfect. Based on your inputs, we've enabled {Object.values(features).filter(Boolean).length} capabilities. Your market experience is now autonomous."
                </p>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Member ID: XXXXXX-2024</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setStep(3)} className="h-16 px-8 rounded-2xl font-bold text-gray-400">Back</Button>
                <Button 
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all text-lg group shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Launch My Choice 🚀"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
