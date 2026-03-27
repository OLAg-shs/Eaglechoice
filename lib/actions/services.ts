"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { serviceSchema } from "@/lib/validations/product"

export async function getServices(): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getService(id: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createService(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to create a service" }
  }

  let required_documents: string[] | undefined
  const requiredDocsRaw = formData.get("required_documents") as string
  if (requiredDocsRaw) {
    try {
      required_documents = JSON.parse(requiredDocsRaw)
    } catch {
      required_documents = requiredDocsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    base_price: formData.get("base_price") as string,
    category: formData.get("category") as string,
    is_variable_pricing: formData.get("is_variable_pricing") === "true",
    required_documents,
    processing_time_days: (formData.get("processing_time_days") as string) || undefined,
    is_available: formData.get("is_available") === "true",
  }

  const validated = serviceSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase.from("services").insert(validated.data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/services")
  return { success: true }
}

export async function updateService(id: string, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to update a service" }
  }

  let required_documents: string[] | undefined
  const requiredDocsRaw = formData.get("required_documents") as string
  if (requiredDocsRaw) {
    try {
      required_documents = JSON.parse(requiredDocsRaw)
    } catch {
      required_documents = requiredDocsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    base_price: formData.get("base_price") as string,
    category: formData.get("category") as string,
    is_variable_pricing: formData.get("is_variable_pricing") === "true",
    required_documents,
    processing_time_days: (formData.get("processing_time_days") as string) || undefined,
    is_available: formData.get("is_available") === "true",
  }

  const validated = serviceSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from("services")
    .update(validated.data)
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/services")
  return { success: true }
}

export async function deleteService(id: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to delete a service" }
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/services")
  return { success: true }
}
