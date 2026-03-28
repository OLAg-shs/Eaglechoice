import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChatWindow } from "@/components/chat/chat-window"

export default async function AdminChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: conversation }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    adminSupabase.from("conversations")
      .select(`*, p1:profiles!conversations_participant_1_fkey(id, full_name), p2:profiles!conversations_participant_2_fkey(id, full_name)`)
      .eq("id", id).single(),
  ])

  if (profile?.role !== "admin") redirect("/login")
  if (!conversation) notFound()

  const { data: messages } = await adminSupabase
    .from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true })

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem-3rem)] -m-4 md:-m-6">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <Link href="/admin/messages" className="hover:text-gray-900 text-gray-400">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="font-semibold text-gray-900">
          {conversation.p1?.full_name} ↔ {conversation.p2?.full_name}
        </h2>
        <span className="text-xs text-gray-400">Admin view (read-only access)</span>
      </div>
      <ChatWindow conversationId={id} currentUserId={user.id} initialMessages={messages || []} />
    </div>
  )
}
