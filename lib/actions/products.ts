"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { productSchema } from "@/lib/validations/product"

export async function getProducts(): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getProduct(id: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return { data: null, error: error.message }
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
  if (!profile || (profile.role !== "admin" && profile.role !== "client")) {
    return { error: "Unauthorized" }
  }

  let specifications: Record<string, string> | undefined
  const specificationsRaw = formData.get("specifications") as string
  if (specificationsRaw) {
    try {
      specifications = JSON.parse(specificationsRaw)
    } catch {
      return { error: "Invalid specifications format" }
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
      images = [...images, ...JSON.parse(imagesRaw)]
    } catch {
      const split = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      images = [...images, ...split]
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") as string,
    category: formData.get("category") as string,
    brand: (formData.get("brand") as string) || undefined,
    specifications,
    images,
    stock_quantity: formData.get("stock_quantity") as string,
    is_available: formData.get("is_available") === "true",
  }

  const validated = productSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const productData = {
    ...validated.data,
    client_id: profile.role === "client" ? user.id : null
  }

  const { error } = await supabase.from("products").insert(productData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/agent/products")
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a product" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "client")) {
    return { error: "Unauthorized" }
  }

  let specifications: Record<string, string> | undefined
  const specificationsRaw = formData.get("specifications") as string
  if (specificationsRaw) {
    try {
      specifications = JSON.parse(specificationsRaw)
    } catch {
      return { error: "Invalid specifications format" }
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

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") as string,
    category: formData.get("category") as string,
    brand: (formData.get("brand") as string) || undefined,
    specifications,
    images,
    stock_quantity: formData.get("stock_quantity") as string,
    is_available: formData.get("is_available") === "true",
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
  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a product" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "admin" && profile.role !== "client")) {
    return { error: "Unauthorized" }
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
