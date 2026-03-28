"use client"

import { useState } from "react"
import { rejectOrder } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { XCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export function RejectOrderDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleReject() {
    if (!reason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please explain why you are rejecting this order." })
      return
    }

    setLoading(true)
    const res = await rejectOrder(orderId, reason.trim())
    setLoading(false)

    if (res?.error) {
      toast({ variant: "destructive", title: "Action Failed", description: res.error })
    } else {
      toast({ title: "Order Rejected", description: "The order has been cancelled and the customer notified." })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2">
          <XCircle className="h-4 w-4" /> Reject Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject this order? Please provide a reason (the customer will see this note).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="e.g., Buyer unresponsive, product out of stock..." 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            rows={3} 
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
