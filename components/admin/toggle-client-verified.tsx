"use client"

import { useState } from "react"
import { BadgeCheck, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleClientVerified } from "@/lib/actions/auth"

export function ToggleClientVerified({ clientId, isVerified }: { clientId: string; isVerified: boolean }) {
  const [verified, setVerified] = useState(isVerified)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleClientVerified(clientId, !verified)
    if (!result?.error) setVerified(p => !p)
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className={`w-full ${verified ? "text-green-600 border-green-200 hover:bg-green-50" : "text-gray-500"}`}
    >
      {verified ? (
        <><BadgeCheck className="w-4 h-4 mr-2" /> Verified Agent</>
      ) : (
        <><ShieldAlert className="w-4 h-4 mr-2" /> Unverified</>
      )}
    </Button>
  )
}
