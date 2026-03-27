"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  content: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)
      if (data) setNotifications(data)
    }

    fetchNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload: { new: Notification }) => {
        setNotifications(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  async function handleMarkAllRead() {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={cn(
                    "flex gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    !n.is_read && "bg-blue-50/50"
                  )}
                >
                  {!n.is_read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                  <div className={cn("flex-1 min-w-0", n.is_read && "pl-5")}>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.content}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
