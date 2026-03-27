"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleClientActive } from "@/lib/actions/auth"

export function ToggleClientStatus({ clientId, isActive }: { clientId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleClientActive(clientId, !active)
    if (!result?.error) setActive(p => !p)
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant={active ? "outline" : "default"}
      onClick={handleToggle}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Updating..." : active ? "Deactivate Agent" : "Activate Agent"}
    </Button>
  )
}
