import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getStoreAgents } from "@/lib/actions/stores"
import AgentsPageClient from "./agents-client"

export default async function SellerAgentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("id, brand_color").eq("slug", slug).eq("owner_id", user.id).single()
  if (!store) redirect("/store")

  const agents = await getStoreAgents(store.id)

  return (
    <AgentsPageClient
      storeId={store.id}
      slug={slug}
      agents={agents}
      brandColor={store.brand_color || "#2563eb"}
    />
  )
}
