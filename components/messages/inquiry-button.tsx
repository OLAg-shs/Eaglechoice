"use client"

import { useState } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { initiateInquiry } from "@/lib/actions/messages"
import { useRouter } from "next/navigation"

export function InquiryButton({ agentId, isAuthenticated }: { agentId: string; isAuthenticated: boolean }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleInquiry() {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    setLoading(true)
    const result = await initiateInquiry(agentId)
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else if (result.data) {
      router.push(`/client/messages/${result.data.id}`)
    }
  }

  return (
    <Button 
      onClick={handleInquiry} 
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
      Ask Question
    </Button>
  )
}
