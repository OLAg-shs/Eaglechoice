"use client"

import { useState } from "react"
import { MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { initiateAdminChat } from "@/lib/actions/messages"
import { useRouter } from "next/navigation"

export function ContactAdminButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleContactAdmin() {
    setLoading(true)
    const result = await initiateAdminChat()
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else if (result.data) {
      router.push(`/agent/messages/${result.data.id}`)
    }
  }

  return (
    <Button 
      onClick={handleContactAdmin} 
      disabled={loading}
      variant="outline"
      className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
      Contact System Admin
    </Button>
  )
}
