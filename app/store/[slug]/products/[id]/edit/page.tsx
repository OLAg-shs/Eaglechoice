import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import ProductEditForm from "./edit-form"

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("id, brand_color, owner_id").eq("slug", slug).single()
  if (!store || store.owner_id !== user.id) notFound()

  const { data: product } = await supabase.from("products").select("*").eq("id", id).eq("store_id", store.id).single()
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
        <p className="text-sm text-gray-500">Update product details and availability</p>
      </div>

      <ProductEditForm
        product={product}
        storeSlug={slug}
        brandColor={store.brand_color || "#2563eb"}
      />
    </div>
  )
}
