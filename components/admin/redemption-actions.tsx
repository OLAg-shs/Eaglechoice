"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reviewRedemption } from "@/lib/actions/points"

export function AdminRedemptionActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [done, setDone] = useState(false)

  async function handle(action: "approved" | "rejected") {
    setLoading(action === "approved" ? "approve" : "reject")
    await reviewRedemption(requestId, action)
    setDone(true)
    setLoading(null)
  }

  if (done) return <p className="text-xs text-green-600">Done</p>

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="outline"
        className="text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => handle("approved")}
        disabled={loading !== null}
      >
        {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handle("rejected")}
        disabled={loading !== null}
      >
        {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      </Button>
    </div>
  )
}
