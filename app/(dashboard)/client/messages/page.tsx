import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function ClientMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      p1:profiles!conversations_participant_1_fkey(id, full_name, role),
      p2:profiles!conversations_participant_2_fkey(id, full_name, role),
      messages(content, created_at, sender_id, is_read)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Conversations with customers</p>
      </div>

      {!conversations?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MessageSquare className="mb-4 h-16 w-16 text-gray-200" />
          <p className="text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const other = conv.p1?.id === user.id ? conv.p2 : conv.p1
            const lastMsg = conv.messages?.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            const unread = conv.messages?.some((m: any) => !m.is_read && m.sender_id !== user.id)
            const initials = other?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            return (
              <Link key={conv.id} href={`/client/messages/${conv.id}`}>
                <Card className={`hover:shadow-md transition-shadow cursor-pointer ${unread ? "border-blue-200 bg-blue-50/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">{initials}</AvatarFallback>
                        </Avatar>
                        {unread && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-gray-900 ${unread ? "font-semibold" : ""}`}>{other?.full_name}</p>
                          {lastMsg && <p className="text-xs text-gray-400 shrink-0">{formatRelativeTime(lastMsg.created_at)}</p>}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{lastMsg?.content || "No messages yet"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
