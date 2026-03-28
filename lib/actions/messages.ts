"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NOTIFICATION_TYPES } from "@/lib/constants"

export async function getConversations(): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  // Fetch conversations where user is a participant
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, email, avatar_url),
      participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, email, avatar_url)
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  // Get unread count per conversation
  if (conversations) {
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id)

        return {
          ...conv,
          unread_count: count || 0,
        }
      })
    )

    return { data: enriched, error: null }
  }

  return { data: conversations, error: null }
}

export async function getMessages(
  conversationId: string,
  limit: number = 50
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  messageType: string = "text",
  fileUrl?: string
): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  // Validate user is a participant in the conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("participant_1, participant_2")
    .eq("id", conversationId)
    .single()

  if (!conversation) {
    return { data: null, error: "Conversation not found" }
  }

  if (conversation.participant_1 !== user.id && conversation.participant_2 !== user.id) {
    return { data: null, error: "You are not a participant in this conversation" }
  }

  // Insert message
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
      file_url: fileUrl || null,
    })
    .select()
    .single()

  if (messageError) {
    return { data: null, error: messageError.message }
  }

  // Update conversation last_message_at
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)

  // Create notification for the other participant
  const otherParticipantId =
    conversation.participant_1 === user.id
      ? conversation.participant_2
      : conversation.participant_1

  // Get sender name for notification
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  await supabase.from("notifications").insert({
    user_id: otherParticipantId,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    title: "New Message",
    content: `${senderProfile?.full_name || "Someone"} sent you a message.`,
    link: `/messages/${conversationId}`,
    metadata: { conversation_id: conversationId, message_id: message.id },
  })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")

  return { data: message, error: null }
}

export async function markMessagesRead(
  conversationId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")

  return { error: null }
}

export async function getOrCreateConversation(
  participantId: string,
  orderId?: string,
  type: string = "direct"
): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  // Check if conversation already exists between the two participants
  let query = supabase
    .from("conversations")
    .select("*")
    .or(
      `and(participant_1.eq.${user.id},participant_2.eq.${participantId}),and(participant_1.eq.${participantId},participant_2.eq.${user.id})`
    )

  if (orderId) {
    query = query.eq("order_id", orderId)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    return { data: existing, error: null }
  }

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      participant_1: user.id,
      participant_2: participantId,
      conversation_type: type,
      order_id: orderId || null,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: conversation, error: null }
}

export async function initiateAdminChat(): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single()

  if (!adminProfile) return { data: null, error: "No admin found" }

  return getOrCreateConversation(adminProfile.id, undefined, "support")
}

export async function initiateInquiry(agentId: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  return getOrCreateConversation(agentId, undefined, "inquiry")
}
