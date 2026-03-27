"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatus } from "@/lib/actions/orders"

const TRANSITIONS: Record<string, string[]> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["payment_pending", "cancelled"],
  payment_pending: [],
  paid: ["processing"],
  processing: ["completed"],
  completed: [],
  cancelled: [],
}

const ADMIN_TRANSITIONS: Record<string, string[]> = {
  pending: ["in_progress", "payment_pending", "cancelled"],
  in_progress: ["payment_pending", "completed", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["processing", "completed"],
  processing: ["completed"],
  completed: [],
  cancelled: ["pending"],
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  payment_pending: "Payment Pending",
  paid: "Paid",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  role,
}: {
  orderId: string
  currentStatus: string
  role: "admin" | "client"
}) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState("")

  const available = (role === "admin" ? ADMIN_TRANSITIONS : TRANSITIONS)[currentStatus] ?? []

  if (available.length === 0) return null

  async function handleUpdate() {
    if (!selected) return
    setLoading(true)
    await updateOrderStatus(orderId, selected)
    setSelected("")
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Update status..." />
        </SelectTrigger>
        <SelectContent>
          {available.map((s) => (
            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleUpdate} disabled={!selected || loading} size="sm">
        {loading ? "Updating..." : "Update"}
      </Button>
    </div>
  )
}
