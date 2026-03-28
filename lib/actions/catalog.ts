"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const stock_quantity = Number(formData.get("stock")) || 0
  const price = Number(formData.get("base_price")) || 0
  const brand = formData.get("brand") as string || null
  const file = formData.get("image") as File
  const agent_id = formData.get("agent_id") as string
  const specifications = formData.get("specifications") as string || "{}"
  
  let imagePublicUrl: string | null = null
  
  // Handle optional image upload — use admin client to bypass storage RLS
  if (file && file.size > 0) {
    const adminSupabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`
    
    const { error: uploadError } = await adminSupabase.storage
      .from('files')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
      
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
    
    const { data: { publicUrl } } = adminSupabase.storage
      .from('files')
      .getPublicUrl(filePath)
      
    imagePublicUrl = publicUrl
  }
  
  const { error } = await supabase
    .from('products')
    .insert({
      name,
      category: 'laptop',
      description: description || null,
      brand,
      stock_quantity,
      price,
      images: imagePublicUrl ? [imagePublicUrl] : [],
      agent_id: agent_id || null,
      specifications: JSON.parse(specifications),
      is_available: true,
    })
    
  if (error) throw new Error(`Database error: ${error.message}`)
  
  revalidatePath("/admin/products")
  revalidatePath("/user/catalog")
  return { success: true }
}

export async function createService(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const base_price = Number(formData.get("base_price")) || 0
  const category = formData.get("category") as string || 'service'
  const file = formData.get("image") as File
  const agent_id = formData.get("agent_id") as string
  const required_documents = formData.get("required_documents") as string || "[]"
  
  let image_url = null
  
  // Handle optional image upload — use admin client to bypass storage RLS
  if (file && file.size > 0) {
    const adminSupabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
    const filePath = `services/${fileName}`
    
    const { error: uploadError } = await adminSupabase.storage
      .from('files')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
      
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
    
    const { data: { publicUrl } } = adminSupabase.storage
      .from('files')
      .getPublicUrl(filePath)
      
    image_url = publicUrl
  }
  
  const { error } = await supabase
    .from('services')
    .insert({
      name,
      category: category || 'ghana_card',
      description: description || null,
      base_price,
      cover_image_url: image_url,
      agent_id: agent_id || null,
      required_documents: JSON.parse(required_documents),
      is_available: true,
    })
    
  if (error) throw new Error(`Database error: ${error.message}`)
  
  revalidatePath("/admin/services")
  revalidatePath("/user/catalog")
  return { success: true }
}

export async function toggleProductStatus(id: string, currentlyActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ is_available: !currentlyActive })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  return { success: true }
}

export async function toggleServiceStatus(id: string, currentlyActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_available: !currentlyActive })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/catalog")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/catalog")
  return { success: true }
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const stock_quantity = Number(formData.get("stock")) || 0
  const price = Number(formData.get("base_price")) || 0
  const brand = formData.get("brand") as string || null
  const file = formData.get("image") as File
  const agent_id = formData.get("agent_id") as string
  const specifications = formData.get("specifications") as string || "{}"
  const is_available = formData.get("is_available") === "true"
  const current_image = formData.get("current_image") as string

  let imagePublicUrl: string | null = current_image || null

  // Handle optional new image upload
  if (file && file.size > 0) {
    const adminSupabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`
    
    const { error: uploadError } = await adminSupabase.storage
      .from('files')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })
      
    if (!uploadError) {
      const { data: { publicUrl } } = adminSupabase.storage
        .from('files')
        .getPublicUrl(filePath)
      imagePublicUrl = publicUrl
    }
  }

  let parsedSpecs = {}
  try { parsedSpecs = JSON.parse(specifications) } catch {}

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description: description || null,
      brand: brand || null,
      stock_quantity,
      price,
      images: imagePublicUrl ? [imagePublicUrl] : [],
      client_id: agent_id || null,
      specifications: parsedSpecs,
      is_available,
    })
    .eq('id', id)
    
  if (error) throw new Error(`Update failed: ${error.message}`)
  
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath(`/catalog/product/${id}`)
  return { success: true }
}
