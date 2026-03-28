"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { registerSchema, loginSchema } from "@/lib/validations/auth"

export async function signUp(formData: FormData): Promise<{ error?: string; success?: boolean; role?: string }> {
  const supabase = await createClient()

  const rawData = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    password: formData.get("password") as string,
    confirm_password: formData.get("password") as string, // auto-confirm
    role: (formData.get("role") as "user" | "client") || "user",
  }

  const validated = registerSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { full_name, email, phone, password, role } = validated.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name, phone },
    },
  })

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function signIn(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const validated = loginSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { email, password } = validated.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function resetPassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const email = formData.get("email") as string
  if (!email) return { error: "Email is required" }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleClientActive(
  clientId: string,
  isActive: boolean
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", clientId)

  if (error) return { error: error.message }

  revalidatePath("/admin/clients")
  return { success: true }
}

export async function updateProfile(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const full_name = (formData.get("full_name") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim()
  const momo_number = (formData.get("momo_number") as string)?.trim()
  const momo_provider = formData.get("momo_provider") as string

  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name, 
      phone, 
      momo_number, 
      momo_provider 
    })
    .eq("id", user.id)

  if (error) return { error: error.message }
  
  revalidatePath("/", "layout")
  return { success: true }
}

export async function toggleClientVerified(
  clientId: string,
  isVerified: boolean
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ is_verified: isVerified })
    .eq("id", clientId)

  if (error) return { error: error.message }

  revalidatePath("/admin/clients")
  return { success: true }
}

import { createAdminClient } from "@/lib/supabase/admin"

export async function createAgentByAdmin(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!full_name || !email || !password) return { error: "Missing required fields" }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "client",
      full_name,
      phone
    }
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/clients")
  return { success: true }
}

export async function deleteAgentByAdmin(agentId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.auth.admin.deleteUser(agentId)

  if (error) return { error: error.message }

  revalidatePath("/admin/clients")
  return { success: true }
}

export async function updateSettings(key: string, value: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function updateAdminProfile(formData: FormData): Promise<{ error?: string; success?: boolean; message?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { error: "Unauthorized" }

  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string

  if (!full_name || !email) return { error: "Name and email are required" }

  // Update profile name
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name })
    .eq("id", user.id)

  if (profileError) return { error: profileError.message }

  // Update email if it changed
  if (email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email })
    if (authError) return { error: authError.message }
    
    revalidatePath("/admin/settings")
    return { success: true, message: "Name updated! A confirmation link has been sent to confirm your new email. It will change once you click it." }
  }

  revalidatePath("/admin/settings")
  return { success: true, message: "Profile updated successfully!" }
}

