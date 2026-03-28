import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { StoreClientWrapper } from "@/components/store/store-client-wrapper"

export default async function StorePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch store details with owner info
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*, owner:profiles!stores_owner_id_fkey(full_name, email, is_verified)")
    .eq("slug", slug)
    .single()

  if (storeError || !store || !store.is_active) notFound()

  // Fetch products for this store with their assigned agents
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      agent:profiles!products_agent_id_fkey(id, full_name, is_verified)
    `)
    .eq("store_id", store.id)
    .eq("is_available", true)
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("Error fetching store products:", productsError)
  }

  return <StoreClientWrapper store={store} products={products || []} />
}
