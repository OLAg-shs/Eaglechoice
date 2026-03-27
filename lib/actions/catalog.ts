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
    .update({ is_active: !currentlyActive })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/user/catalog")
  return { success: true }
}

export async function toggleServiceStatus(id: string, currentlyActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_active: !currentlyActive })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  revalidatePath("/admin/services")
  revalidatePath("/user/catalog")
  return { success: true }
}
