"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

export async function createStore(formData: FormData): Promise<{ error?: string; slug?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const name = (formData.get("name") as string)?.trim()
  const tagline = (formData.get("tagline") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const brand_color = (formData.get("brand_color") as string) || "#2563eb"
  const theme_id = (formData.get("theme_id") as string) || "modern"
  const font_preset = (formData.get("font_preset") as string) || "sans"
  
  const payout_bank_name = formData.get("payout_bank_name") as string
  const payout_account_number = formData.get("payout_account_number") as string
  const payout_account_name = formData.get("payout_account_name") as string

  const category_tags_raw = (formData.get("category_tags") as string) || ""
  const category_tags = category_tags_raw.split(",").map(s => s.trim()).filter(Boolean)

  if (!name) return { error: "Store name is required" }

  let slug = slugify(name)
  const adminSupabase = await createAdminClient()
  const { data: existing } = await adminSupabase.from("stores").select("slug").eq("slug", slug).single()
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
  }

  const { error } = await adminSupabase.from("stores").insert({
    name,
    slug,
    owner_id: user.id,
    brand_color,
    tagline: tagline || null,
    description: description || null,
    category_tags,
    theme_id,
    font_preset,
    payout_bank_name,
    payout_account_number,
    payout_account_name,
    commission_rate: 0.05,
    is_active: true,
    is_verified: false,
    accepted_terms: true,
  })

  if (error) return { error: error.message }

  const { data: newStore } = await adminSupabase.from("stores").select("id").eq("slug", slug).single()
  if (newStore) {
    await adminSupabase.from("store_members").insert({ 
      store_id: newStore.id, 
      user_id: user.id, 
      role: "owner" 
    })
  }

  revalidatePath("/stores")
  return { slug }
}

export async function getMyStore(): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .single()

  return { data: data || null, error: error?.message || null }
}

export async function getStoreBySlug(slug: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stores")
    .select("*, owner:profiles!stores_owner_id_fkey(full_name, email)")
    .eq("slug", slug)
    .single()

  return { data: data || null, error: error?.message || null }
}

export async function getStoreProducts(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
  return data || []
}

export async function getStoreOrders(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(`
      *,
      products(name, price),
      services(name, base_price),
      user_profile:profiles!orders_user_id_fkey(full_name, email, phone)
    `)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
  return data || []
}

export async function getStoreAgents(storeId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("store_members")
    .select("*, profile:profiles!store_members_user_id_fkey(full_name, email, phone, is_verified)")
    .eq("store_id", storeId)
  return data || []
}

export async function updateStore(storeId: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: store } = await supabase.from("stores").select("owner_id, slug").eq("id", storeId).single()
  if (!store || store.owner_id !== user.id) return { error: "Unauthorized" }

  const name = (formData.get("name") as string)?.trim()
  const tagline = (formData.get("tagline") as string)?.trim()
  const description = (formData.get("description") as string)?.trim()
  const brand_color = formData.get("brand_color") as string
  const theme_id = formData.get("theme_id") as string
  const font_preset = formData.get("font_preset") as string
  const payout_bank_name = formData.get("payout_bank_name") as string
  const payout_account_number = formData.get("payout_account_number") as string
  const payout_account_name = formData.get("payout_account_name") as string
  
  const category_tags_raw = (formData.get("category_tags") as string) || ""
  const category_tags = category_tags_raw.split(",").map(s => s.trim()).filter(Boolean)

  let logo_url: string | undefined
  const logoFile = formData.get("logo") as File
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split(".").pop()
    const path = `stores/${store.slug}/logo-${Date.now()}.${ext}`
    const { error: uploadError } = await adminSupabase.storage.from("files").upload(path, logoFile, { upsert: false })
    if (!uploadError) {
      const { data: { publicUrl } } = adminSupabase.storage.from("files").getPublicUrl(path)
      logo_url = publicUrl
    }
  }

  const updates: any = { 
    name, tagline, description, brand_color, category_tags, theme_id, font_preset,
    payout_bank_name, payout_account_number, payout_account_name
  }
  if (logo_url) updates.logo_url = logo_url

  const { error } = await supabase.from("stores").update(updates).eq("id", storeId)
  if (error) return { error: error.message }

  revalidatePath(`/stores/${store.slug}`)
  revalidatePath(`/store/${store.slug}`)
  return { success: true }
}

export async function inviteStoreAgent(storeId: string, email: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: store } = await supabase.from("stores").select("owner_id").eq("id", storeId).single()
  if (!store || store.owner_id !== user.id) return { error: "Unauthorized" }

  const { data: targetProfile } = await adminSupabase.from("profiles").select("id, role").eq("email", email).single()
  if (!targetProfile) return { error: "No account found with that email address" }

  const { error } = await adminSupabase.from("store_members").insert({
    store_id: storeId,
    user_id: targetProfile.id,
    role: "agent",
  })

  if (error) {
    if (error.code === "23505") return { error: "This person is already a member of your store" }
    return { error: error.message }
  }

  return { success: true }
}

export async function getAllStores(onlyVerified = true) {
  const supabase = await createClient()
  let query = supabase
    .from("stores")
    .select(`
      *,
      owner:profiles!stores_owner_id_fkey(full_name, email),
      stats:store_stats(total_negotiations, successful_deals, avg_response_seconds)
    `)
    .order("created_at", { ascending: false })

  if (onlyVerified) {
    query = query.eq("is_active", true).eq("is_verified", true)
  }

  const { data } = await query
  
  // Flatten stats for easier UI consumption
  const stores = data?.map(s => ({
    ...s,
    successful_deals: s.stats?.[0]?.successful_deals || 0,
    avg_response_seconds: s.stats?.[0]?.avg_response_seconds || 86400 // Default to 24h if no stats
  })) || []

  return stores
}

export async function verifyStore(storeId: string, verified: boolean): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from("stores")
    .update({ is_verified: verified })
    .eq("id", storeId)

  if (error) return { error: error.message }
  
  revalidatePath("/admin/stores")
  return { success: true }
}

export async function toggleStoreActive(storeId: string, active: boolean): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from("stores")
    .update({ is_active: active })
    .eq("id", storeId)

  if (error) return { error: error.message }

  revalidatePath("/admin/stores")
  return { success: true }
}
