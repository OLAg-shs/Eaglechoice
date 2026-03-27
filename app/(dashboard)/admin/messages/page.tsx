import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      p1:profiles!conversations_participant_1_fkey(id, full_name, role),
      p2:profiles!conversations_participant_2_fkey(id, full_name, role),
      messages(content, created_at, sender_id, is_read)
    `)
    .order("last_message_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Messages</h1>
        <p className="text-sm text-gray-500 mt-1">All conversations across the platform</p>
      </div>

      {!conversations?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <MessageSquare className="mb-4 h-16 w-16 text-gray-200" />
          <p className="text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => {
            const lastMsg = conv.messages?.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            const p1 = conv.p1
            const p2 = conv.p2
            const initials1 = p1?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            const initials2 = p2?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            return (
              <Link key={conv.id} href={`/admin/messages/${conv.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{initials1}</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">{initials2}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {p1?.full_name} ↔ {p2?.full_name}
                          </p>
                          {lastMsg && <p className="text-xs text-gray-400">{formatRelativeTime(lastMsg.created_at)}</p>}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {lastMsg ? lastMsg.content : "No messages yet"}
                        </p>
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
