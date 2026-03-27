"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users } from "lucide-react"

export function LiveVisitorCounter() {
  const [count, setCount] = useState(1)
  const supabase = createClient()

  useEffect(() => {
    // Generate a unique session ID for presence tracking across anonymous users
    const sessionId = typeof window !== "undefined" && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : Math.random().toString(36).substring(2)

    const channel = supabase.channel('public:online-users', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // Count unique keys in the presence state object
        setCount(Math.max(1, Object.keys(state).length))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="flex items-center gap-2 rounded-full bg-black/20 dark:bg-amber-500/10 backdrop-blur-md px-4 py-2 border border-white/20 dark:border-amber-500/20 shadow-lg transition-all animate-fade-in hover:scale-105">
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
      </div>
      <Users className="h-4 w-4 text-white dark:text-amber-500" />
      <span className="text-sm font-semibold text-white dark:text-amber-400 tracking-wide">
        {count} {count === 1 ? 'User Online' : 'Users Online'}
      </span>
    </div>
  )
}
