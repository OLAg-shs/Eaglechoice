"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { sendMessage } from "@/lib/actions/messages"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
  message_type: string
}

export function ChatWindow({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Message }) => {
        if (payload.new.sender_id !== currentUserId) {
          setMessages(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, currentUserId])

  async function handleSend() {
    if (!input.trim()) return
    const content = input.trim()
    setInput("")
    setSending(true)

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      message_type: "text",
    }
    setMessages(prev => [...prev, optimisticMsg])

    const formData = new FormData()
    formData.set("conversation_id", conversationId)
    formData.set("content", content)
    const result = await sendMessage(formData)

    if (!result.error && result.data) {
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? result.data : m))
    } else {
      // Remove optimistic if error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
    }
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">?</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[70%]", isOwn && "items-end flex flex-col")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isOwn
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-900 rounded-tl-sm"
                  )}
                >
                  {msg.content}
                </div>
                <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 resize-none"
          />
          <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
