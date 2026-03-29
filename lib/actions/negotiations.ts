"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Propose a new price for a product (Buyer action)
 */
export async function proposePrice(formData: FormData): Promise<{ error?: string; success?: boolean; id?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to propose a price." }

  const productId = formData.get("productId") as string
  const storeId = formData.get("storeId") as string
  const sellerId = formData.get("sellerId") as string
  const proposedPrice = parseFloat(formData.get("proposedPrice") as string)
  const originalPrice = parseFloat(formData.get("originalPrice") as string)

  if (isNaN(proposedPrice) || proposedPrice <= 0) {
    return { error: "Please enter a valid price proposal." }
  }

  // 1. Create the negotiation record
  const { data, error } = await supabase
    .from("negotiations")
    .insert({
      buyer_id: user.id,
      seller_id: sellerId,
      store_id: storeId,
      product_id: productId,
      proposed_price: proposedPrice,
      original_price: originalPrice,
      status: "pending",
      chat_history: [{
        sender_id: user.id,
        content: `Proposed a price of GHS ${proposedPrice.toLocaleString()}`,
        timestamp: new Date().toISOString()
      }]
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  // 2. Notify the seller (optional, but good practice)
  await supabase.from("notifications").insert({
    user_id: sellerId,
    type: "negotiation_update",
    title: "New Price Proposal",
    content: `A buyer has proposed GHS ${proposedPrice} for your product.`,
    link: `/store/any/negotiations/${data.id}`, // the slug is dynamic
    metadata: { negotiation_id: data.id }
  })

  revalidatePath("/", "layout")
  return { success: true, id: data.id }
}

/**
 * Accept a price proposal (Seller action)
 */
export async function acceptPrice(negotiationId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: negotiation, error: fetchError } = await supabase
    .from("negotiations")
    .select("*")
    .eq("id", negotiationId)
    .single()

  if (fetchError || !negotiation) return { error: "Negotiation not found" }
  if (negotiation.seller_id !== user.id) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("negotiations")
    .update({ 
      status: "accepted", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", negotiationId)

  if (error) return { error: error.message }

  // Notify buyer
  await supabase.from("notifications").insert({
    user_id: negotiation.buyer_id,
    type: "negotiation_update",
    title: "Proposal Accepted!",
    content: `Great news! Your price of GHS ${negotiation.proposed_price} was accepted.`,
    link: `/client/catalog/product/${negotiation.product_id}`,
    metadata: { negotiation_id: negotiationId }
  })

  revalidatePath("/", "layout")
  return { success: true }
}

/**
 * Reject a price proposal (Seller action)
 */
export async function rejectPrice(negotiationId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("negotiations")
    .update({ 
      status: "rejected", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", negotiationId)
    .eq("seller_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}

/**
 * Track an engagement event (Analytics)
 */
export async function trackEvent(type: string, entityType: string, entityId: string, metadata: any = {}): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from("events").insert({
    type,
    entity_type: entityType,
    entity_id: entityId,
    user_id: user?.id || null,
    metadata
  })
}
