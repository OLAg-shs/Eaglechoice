import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MessageSquare, Clock, Search, Ghost } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default async function StoreMessagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("id, brand_color, owner_id").eq("slug", slug).single()
  if (!store || store.owner_id !== user.id) notFound()

  // For now, this is a placeholder UI for the future messaging system
  const brandColor = store.brand_color || "#2563eb"

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500">Communicate directly with your buyers</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Sidebar: Conversations List */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden relative border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search chats..." className="pl-9 h-10 rounded-xl" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <Ghost className="h-12 w-12 text-gray-300 dark:text-gray-700" />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">No messages yet</p>
              <p className="text-xs text-gray-500 max-w-[180px] mx-auto">Conversations will appear here when buyers contact you about your products.</p>
            </div>
          </div>
        </Card>

        {/* Main: Chat Window */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center animate-pulse">
              <MessageSquare className="h-10 w-10" style={{ color: brandColor }} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Select a conversation</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Welcome to your store inbox. This is where you can chat with customers, provide support, and close more deals.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chat feature coming soon</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
