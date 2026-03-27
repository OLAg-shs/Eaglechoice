"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteAgentByAdmin } from "@/lib/actions/auth"

export function DeleteAgentButton({ agentId, agentName }: { agentId: string, agentName: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ${agentName}? This might break existing orders tied to them. Consider Deactivating them instead.`)) {
      return
    }

    setLoading(true)
    await deleteAgentByAdmin(agentId)
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
      className="w-full mt-2"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? "Deleting..." : "Delete Agent"}
    </Button>
  )
}
