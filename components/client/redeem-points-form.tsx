"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { requestRedemption } from "@/lib/actions/points"

export function RedeemPointsForm({
  currentBalance,
  conversionRate,
  minPoints,
}: {
  currentBalance: number
  conversionRate: number
  minPoints: number
}) {
  const [points, setPoints] = useState(minPoints)
  const [method, setMethod] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const ghsAmount = (points / conversionRate).toFixed(2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (points < minPoints) { setError(`Minimum ${minPoints} points required`); return }
    if (points > currentBalance) { setError("Insufficient points"); return }
    if (!method) { setError("Please select a payout method"); return }

    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("points_amount", String(points))
    formData.set("payout_method", method)
    const result = await requestRedemption(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="font-medium text-green-800">Redemption request submitted!</p>
        <p className="text-sm text-green-600 mt-1">The admin will review and process your request</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}
      <div className="space-y-2">
        <Label>Points to Redeem</Label>
        <Input
          type="number"
          min={minPoints}
          max={currentBalance}
          step={100}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
        <p className="text-xs text-gray-500">= GH₵ {ghsAmount}</p>
      </div>
      <div className="space-y-2">
        <Label>Payout Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select method..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
            <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
            <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting...</> : `Redeem ${points.toLocaleString()} pts for GH₵ ${ghsAmount}`}
      </Button>
    </form>
  )
}
