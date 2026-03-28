"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Mail, Loader2, UserPlus, ShieldCheck, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { inviteStoreAgent } from "@/lib/actions/stores"

export default function AgentsPageClient({
  storeId,
  slug,
  agents,
  brandColor,
}: {
  storeId: string
  slug: string
  agents: any[]
  brandColor: string
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleInvite() {
    if (!email.trim()) return
    setLoading(true)
    const result = await inviteStoreAgent(storeId, email.trim())
    setLoading(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Failed", description: result.error })
    } else {
      toast({ title: "Agent Added ✅", description: `${email} has been added as a store agent.` })
      setEmail("")
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
        <p className="text-sm text-gray-500 mt-1">Add agents to manage products and orders on your behalf</p>
      </div>

      {/* Invite form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="h-4 w-4" style={{ color: brandColor }} />
          Add an Agent
        </h2>
        <p className="text-xs text-gray-500">The person must already have an Eagle Choice account. Enter their registered email address.</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="agent_email" className="sr-only">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="agent_email"
                type="email"
                placeholder="agent@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
                className="pl-9"
              />
            </div>
          </div>
          <Button onClick={handleInvite} disabled={loading || !email.trim()} className="text-white border-none" style={{ background: brandColor }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Agent"}
          </Button>
        </div>
      </div>

      {/* Agents list */}
      <div className="space-y-3">
        {!agents.length ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <Users className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No agents yet — you're managing everything yourself.</p>
            <p className="text-gray-400 text-xs mt-1">Add an agent above to delegate order management.</p>
          </div>
        ) : (
          agents.map((member: any) => (
            <div key={member.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: brandColor }}>
                {member.profile?.full_name?.[0] ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.profile?.full_name}</p>
                  {member.profile?.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white capitalize" style={{ background: brandColor }}>
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{member.profile?.email}</p>
                {member.profile?.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />{member.profile.phone}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
