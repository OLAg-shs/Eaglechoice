import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Sellers land here after login — we look up their store and redirect them
export default async function SellerRootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase
    .from("stores")
    .select("slug")
    .eq("owner_id", user.id)
    .single()

  if (!store) redirect("/sell/setup")
  redirect(`/store/${store.slug}`)
}
