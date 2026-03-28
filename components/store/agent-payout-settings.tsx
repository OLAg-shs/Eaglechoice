"use client"

import { useState } from "react"
import { Smartphone, Loader2, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile } from "@/lib/actions/auth"

export default function AgentPayoutSettings({ profile }: { profile: any }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [momoNumber, setMomoNumber] = useState(profile.momo_number || "")
  const [momoProvider, setMomoProvider] = useState(profile.momo_provider || "mtn")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.set("full_name", profile.full_name)
    formData.set("phone", profile.phone || "")
    formData.set("momo_number", momoNumber)
    formData.set("momo_provider", momoProvider)

    const result = await updateProfile(formData)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Update Failed", description: result.error })
    } else {
      toast({ title: "Momo Details Saved ✅", description: "You are ready to receive commissions." })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
      <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
        <Smartphone className="h-6 w-6 text-emerald-600" />
        Mobile Money Payout
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Network Provider</Label>
            <div className="grid grid-cols-3 gap-2">
              {['mtn', 'vodafone', 'airteltigo'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setMomoProvider(provider)}
                  className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${momoProvider === provider ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'border-gray-50 dark:border-gray-900 text-gray-400'}`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Momo Number</Label>
            <Input 
              value={momoNumber} 
              onChange={e => setMomoNumber(e.target.value)} 
              placeholder="024XXXXXXX" 
              className="h-12 rounded-xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" 
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-900">
          <p className="text-[10px] text-gray-400 font-medium italic">Commissions for your product sales will be sent to this number.</p>
          <Button type="submit" disabled={loading} className="px-8 rounded-xl font-black bg-emerald-600 hover:bg-black transition-all">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Momo
          </Button>
        </div>
      </form>
    </div>
  )
}
