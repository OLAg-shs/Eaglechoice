"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCategoryPriceRange(categories: string[]) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("price")
    .in("category", categories)
    .is("is_available", true)

  if (error || !data || data.length === 0) {
    return { min: 0, max: 20000, count: 0 }
  }

  const prices = data.map((p: any) => p.price)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    count: data.length
  }
}

export async function saveBuyerPreferences(preferences: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      preferences: { 
        ...preferences, 
        onboarding_complete: true,
        updated_at: new Date().toISOString()
      } 
    })
    .eq("id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
