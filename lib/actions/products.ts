"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { productSchema } from "@/lib/validations/product"

export async function getProducts(): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  // Join with stores to filter by is_verified and is_active
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      stores (
        id,
        name,
        slug,
        is_verified,
        is_active,
        brand_color
      )
    `)
    .eq("stores.is_verified", true)
    .eq("stores.is_active", true)
    .order("created_at", { ascending: false })

  // Filter out any products where the join failed (i.e. store is unverified)
  const filteredData = data?.filter(p => p.stores) || []

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: filteredData, error: null }
}

export async function getProduct(id: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      stores (
        id,
        is_verified,
        is_active,
        owner_id
      )
    `)
    .eq("id", id)
    .single()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: "Product not found" }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user && data.stores?.owner_id === user.id

  // If not owner, the store must be verified and active
  if (!isOwner && (!data.stores?.is_verified || !data.stores?.is_active)) {
    return { data: null, error: "Product currently undergoing verification." }
  }

  return { data, error: null }
}

export async function createProduct(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to create a product" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "client" && profile.role !== "seller")) {
    return { error: "Unauthorized" }
  }

  let store_id: string | null = null
  if (profile.role === "seller") {
    const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single()
    if (!store) return { error: "You must create a store first" }
    store_id = store.id
  }

  let specifications: Record<string, string> | undefined
  const specificationsRaw = formData.get("specifications") as string
  if (specificationsRaw) {
    try {
      specifications = JSON.parse(specificationsRaw)
    } catch {
      // fallback
    }
  }

  let images: string[] = []
  const files = formData.getAll("image_files") as File[]
  
  if (files && files.length > 0) {
    const adminSupabase = await createAdminClient()
    for (const file of files) {
      if (file.size === 0) continue
      const fileExt = file.name.split('.').pop()
      const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await adminSupabase.storage.from('files').upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (!uploadError) {
        const { data: { publicUrl } } = adminSupabase.storage.from('files').getPublicUrl(fileName)
        images.push(publicUrl)
      }
    }
  }

  const imagesRaw = formData.get("images") as string
  if (imagesRaw) {
    try {
      const parsed = JSON.parse(imagesRaw)
      if (Array.isArray(parsed)) images = [...images, ...parsed]
    } catch {
      const split = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      images = [...images, ...split]
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("base_price") as string || formData.get("price") as string,
    category: formData.get("category") as string || "general",
    brand: (formData.get("brand") as string) || undefined,
    specifications: specifications || {},
    images,
    stock_quantity: formData.get("stock") as string || formData.get("stock_quantity") as string,
    is_available: formData.get("is_available") === "true" || formData.get("is_available") === "on",
    is_negotiation_enabled: formData.get("is_negotiation_enabled") === "true",
    store_id: (formData.get("store_id") as string) || store_id,
    agent_id: (formData.get("agent_id") as string) || undefined,
  }

  const validated = productSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const productData = {
    ...validated.data,
    client_id: profile.role === "client" ? user.id : null,
    store_id: validated.data.store_id || store_id,
  }

  const { error } = await supabase.from("products").insert(productData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/agent/products")
  if (store_id) {
    const { data: store } = await supabase.from("stores").select("slug").eq("id", store_id).single()
    if (store) revalidatePath(`/store/${store.slug}/products`)
  }
  
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a product" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "client" && profile.role !== "seller")) {
    return { error: "Unauthorized" }
  }

  // If seller, verify ownership
  if (profile.role === "seller") {
    const { data: product } = await supabase.from("products").select("store_id").eq("id", id).single()
    const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single()
    if (!product || !store || product.store_id !== store.id) {
      return { error: "Unauthorized access to this product" }
    }
  }

  let specifications: Record<string, string> | undefined
  const specificationsRaw = formData.get("specifications") as string
  if (specificationsRaw) {
    try {
      specifications = JSON.parse(specificationsRaw)
    } catch {
      // fallback
    }
  }

  let images: string[] | undefined
  const imagesRaw = formData.get("images") as string
  if (imagesRaw) {
    try {
      images = JSON.parse(imagesRaw)
    } catch {
      images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  const rawData: any = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("base_price") as string || formData.get("price") as string,
    category: formData.get("category") as string || "general",
    brand: (formData.get("brand") as string) || undefined,
    specifications: specifications || {},
    images: images && images.length > 0 ? images : undefined,
    stock_quantity: formData.get("stock") as string || formData.get("stock_quantity") as string,
    is_available: formData.get("is_available") === "true" || formData.get("is_available") === "on",
    is_negotiation_enabled: formData.get("is_negotiation_enabled") === "true",
    agent_id: (formData.get("agent_id") as string) || undefined,
  }

  const validated = productSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from("products")
    .update(validated.data)
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/agent/products")
  const { data: updatedProduct } = await supabase.from("products").select("store_id").eq("id", id).single()
  if (updatedProduct?.store_id) {
    const { data: store } = await supabase.from("stores").select("slug").eq("id", updatedProduct.store_id).single()
    if (store) revalidatePath(`/store/${store.slug}/products`)
  }

  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a product" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "client" && profile.role !== "seller")) {
    return { error: "Unauthorized" }
  }

  // If seller, verify ownership
  if (profile.role === "seller") {
    const { data: product } = await supabase.from("products").select("store_id").eq("id", id).single()
    const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single()
    if (!product || !store || product.store_id !== store.id) {
      return { error: "Unauthorized access to this product" }
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/agent/products")
  return { success: true }
}
