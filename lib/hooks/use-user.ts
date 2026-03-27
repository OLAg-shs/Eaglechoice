"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  role: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
}

export function useUser() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email || "" })
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single()
          if (profileData) {
            setProfile(profileData as Profile)
          }
        }
      } catch {
        // Silent fail - user not logged in
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || "" })
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (profileData) {
            setProfile(profileData as Profile)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, profile, loading }
}
