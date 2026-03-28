"use client"

import { useState } from "react"
import { cancelOrder } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleCancel() {
    setLoading(true)
    const res = await cancelOrder(orderId)
    setLoading(false)

    if (res?.error) {
      toast({ variant: "destructive", title: "Cancellation Failed", description: res.error })
    } else {
      toast({ title: "Order Cancelled", description: "You have successfully withdrawn your order request." })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 px-3 text-xs gap-1.5" disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Order?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone, and the assigned agent will be notified.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Nevermind</Button>
          <Button 
            variant="destructive"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              handleCancel()
            }} 
            disabled={loading} 
          >
            {loading ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
