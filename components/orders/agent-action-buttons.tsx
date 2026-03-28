"use client"

import { useState } from "react"
import { confirmPaymentProof, extendOrderDeadline, acceptOrder } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { CheckCheck, FileCheck2, Loader2, CalendarClock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function AcceptOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleConfirm() {
    setLoading(true)
    const res = await acceptOrder(orderId)
    setLoading(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      toast({ title: "Order Accepted! ✅", description: "You have 1 week to negotiate before the deadline expires." })
    }
  }

  return (
    <Button onClick={handleConfirm} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      {loading ? "Accepting..." : "Accept Order"}
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

export function ExtendDeadlineButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleExtend() {
    setLoading(true)
    const res = await extendOrderDeadline(orderId)
    setLoading(false)
    if (res?.error) {
      toast({ variant: "destructive", title: "Extension Failed", description: res.error })
    } else {
      toast({ title: "Deadline Extended ⏳", description: "The customer now has 7 more days to pay." })
    }
  }

  return (
    <Button onClick={handleExtend} disabled={loading} variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
      {loading ? "Extending..." : "Extend Deadline by 7 Days"}
    </Button>
  )
}

