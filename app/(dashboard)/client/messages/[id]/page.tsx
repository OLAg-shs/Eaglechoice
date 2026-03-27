import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChatWindow } from "@/components/chat/chat-window"

export default async function ClientChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const { data: conversation } = await supabase
    .from("conversations")
    .select(`*, p1:profiles!conversations_participant_1_fkey(id, full_name), p2:profiles!conversations_participant_2_fkey(id, full_name)`)
    .eq("id", params.id)
    .single()

  if (!conversation) notFound()

  const other = conversation.p1?.id === user.id ? conversation.p2 : conversation.p1

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true })

  await supabase.from("messages").update({ is_read: true })
    .eq("conversation_id", params.id).neq("sender_id", user.id).eq("is_read", false)

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem-3rem)] -m-4 md:-m-6">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/client/messages" className="hover:text-gray-900 text-gray-400">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="font-semibold text-gray-900">{other?.full_name}</h2>
      </div>
      <ChatWindow conversationId={params.id} currentUserId={user.id} initialMessages={messages || []} />
    </div>
  )
}
