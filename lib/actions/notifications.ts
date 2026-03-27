"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getNotifications(
  limit: number = 20
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getUnreadCount(): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { count: 0, error: "Not authenticated" }
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: count || 0, error: null }
}

export async function markAsRead(
  notificationId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { error: null }
}

export async function markAllAsRead(): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { error: null }
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  content: string,
  link?: string,
  metadata?: Record<string, unknown>
): Promise<{ error: string | null }> {
  // Try to get the regular client first; if no user session (webhook context), use admin client
  let client: any

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      client = supabase
    } else {
      client = createAdminClient()
    }
  } catch {
    // Fallback to admin client (e.g., webhook context where cookies are unavailable)
    client = createAdminClient()
  }

  const { error } = await client
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      content,
      link: link || null,
      metadata: metadata || null,
    })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
