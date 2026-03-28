"use client"

import { useState } from "react"
import { enableOrderMessaging } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, ShieldCheck, LockKeyhole } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function CustomerMessageToggle({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleEnable() {
    setLoading(true)
    const res = await enableOrderMessaging(orderId)
    setLoading(false)
    if (res?.error) {
       toast({ variant: "destructive", title: "Setup Failed", description: res.error })
    } else if (res?.data?.conversationId) {
       toast({ title: "Chat Opened! 💬", description: "You securely granted the agent messaging access." })
       router.push(`/user/messages/${res.data.conversationId}`)
    }
  }

  return (
    <Button onClick={handleEnable} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
      {loading ? "Authorizing..." : "Allow Agent to Message You"}
    </Button>
  )
}

export function AgentMessageButton({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  if (!enabled) {
     return (
       <div className="w-full text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md py-2.5 px-3 flex items-center justify-center gap-2 mt-2">
          <LockKeyhole className="h-3.5 w-3.5" /> Messaging Locked by Buyer
       </div>
     )
  }
  return (
    <Button onClick={() => router.push(`/client/messages`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-2">
      <MessageSquare className="h-4 w-4" /> Message Customer
    </Button>
  )
}
