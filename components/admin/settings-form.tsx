"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateSettings } from "@/lib/actions/auth"

export function AdminSettingsForm({ initialPayoutNumber }: { initialPayoutNumber: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [payoutNumber, setPayoutNumber] = useState(initialPayoutNumber)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const result = await updateSettings("admin_payout_number", payoutNumber)
    
    setLoading(false)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin_payout_number">Admin Payout Number (MoMo)</Label>
        <Input 
          id="admin_payout_number" 
          value={payoutNumber} 
          onChange={(e) => setPayoutNumber(e.target.value)}
          placeholder="e.g. 054XXXXXXX"
          required
        />
        <p className="text-xs text-gray-500">This is the number where you want to receive your share of payments.</p>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Settings</>}
        </Button>
        {success && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
      </div>
    </form>
  )
}
