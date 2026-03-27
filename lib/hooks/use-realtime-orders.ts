"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface OrderUpdate {
  id: string
  status: string
  updated_at: string
}

export function useRealtimeOrders(userId: string | null, role: string | null) {
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !role) return

    const filterColumn = role === "client" ? "client_id" : "user_id"

    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: role === "admin" ? undefined : `${filterColumn}=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setOrderUpdates((prev) => {
              const existing = prev.findIndex((o) => o.id === payload.new.id)
              const update = {
                id: payload.new.id as string,
                status: payload.new.status as string,
                updated_at: payload.new.updated_at as string,
              }
              if (existing >= 0) {
                const newUpdates = [...prev]
                newUpdates[existing] = update
                return newUpdates
              }
              return [...prev, update]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, role, supabase])

  return { orderUpdates, setOrderUpdates }
}
