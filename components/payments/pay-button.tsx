"use client"

import { useState } from "react"
import { Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPaymentIntent } from "@/lib/actions/payments"

export function PayButton({ orderId, amount }: { orderId: string, amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handlePay() {
    setLoading(true)
    setError("")

    const result = await createPaymentIntent(orderId)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.authorization_url) {
      // Redirect to Paystack checkout
      window.location.href = result.authorization_url
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button 
        onClick={handlePay} 
        disabled={loading} 
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing Payment...</>
        ) : (
          <><CreditCard className="mr-2 h-4 w-4" />Pay GHS {amount.toFixed(2)} with Paystack</>
        )}
      </Button>
    </div>
  )
}
