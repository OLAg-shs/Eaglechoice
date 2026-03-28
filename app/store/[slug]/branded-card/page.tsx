import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BrandedCardClient from "./branded-card-client"

export default async function BrandedCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("*").eq("slug", slug).eq("owner_id", user.id).single()
  if (!store) redirect("/store")

  const [{ count: productCount }, { count: agentCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("store_members").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("role", "agent"),
  ])

  return (
    <BrandedCardClient
      store={store}
      productCount={productCount ?? 0}
      agentCount={agentCount ?? 0}
    />
  )
}
