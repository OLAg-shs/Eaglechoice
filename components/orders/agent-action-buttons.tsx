"use client"

import { useState } from "react"
import { updateOrderStatus, confirmPaymentProof } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { CheckCheck, FileCheck2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleConfirm() {
    setLoading(true)
    const res = await updateOrderStatus(orderId, "agent_confirmed")
    setLoading(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      toast({ title: "Order Confirmed! ✅", description: "The customer can now proceed to payment." })
    }
  }

  return (
    <Button onClick={handleConfirm} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      {loading ? "Confirming..." : "Confirm Order"}
    </Button>
  )
}

export function VerifyPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleVerify() {
    setLoading(true)
    const res = await confirmPaymentProof(orderId)
    setLoading(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      toast({ title: "Payment Verified! 🎉", description: "The order is now processing." })
    }
  }

  return (
    <Button onClick={handleVerify} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
      {loading ? "Verifying..." : "Verify & Confirm Payment"}
    </Button>
  )
}
