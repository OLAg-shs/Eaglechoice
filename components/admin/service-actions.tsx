"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteService } from "@/lib/actions/services"

export function AdminServiceActions({ serviceId }: { serviceId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this service? This cannot be undone.")) return
    setLoading(true)
    await deleteService(serviceId)
    setLoading(false)
  }

  return (
    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
