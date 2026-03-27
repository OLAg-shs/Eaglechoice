"use client"

import { useState } from "react"
import { Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { initializePayment } from "@/lib/actions/payments"

export function InitiatePaymentButton({
  orderId,
  amount,
  email,
}: {
  orderId: string
  amount: number
  email: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handlePay() {
    setLoading(true)
    setError("")

    const result = await initializePayment(orderId)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.authorization_url) {
      window.location.href = result.authorization_url
    }
  }

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button onClick={handlePay} disabled={loading} size="sm">
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing...</>
        ) : (
          <><CreditCard className="mr-2 h-4 w-4" />Pay Now</>
        )}
      </Button>
    </div>
  )
}
