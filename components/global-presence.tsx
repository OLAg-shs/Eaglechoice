"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function GlobalPresence() {
  const [onlineCount, setOnlineCount] = useState(1) // Start at 1 (representing yourself)
  const supabase = createClient()

  useEffect(() => {
    // Generate a random ID for the current anonymous session
    const sessionId = Math.random().toString(36).substring(7)
    
    const channel = supabase.channel('eagle_choice_online_presence', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        // Count total active unique sessions in the channel
        const count = Object.keys(newState).length
        setOnlineCount(count === 0 ? 1 : count)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user as online immediately
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex items-center justify-center animate-in slide-in-from-bottom-5 fade-in duration-1000">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-full px-4 py-2 flex items-center gap-2.5 transition-all hover:scale-105 cursor-default group">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors" />
          <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-gray-700 dark:text-gray-200">
            {onlineCount} Online
          </span>
        </div>
      </div>
    </div>
  )
}
