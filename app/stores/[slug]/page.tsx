import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Tag, ShieldCheck, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"

export default async function StorePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store, error } = await supabase
    .from("stores")
    .select("*, owner:profiles!stores_owner_id_fkey(full_name, is_verified)")
    .eq("slug", slug)
    .single()

  if (error || !store || !store.is_active) notFound()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_available", true)
    .order("created_at", { ascending: false })

  const brandColor = store.brand_color || "#2563eb"
  const owner = store.owner as any

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Store Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden" style={{ background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}66)` }}>
        {store.banner_url && (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover absolute inset-0 mix-blend-overlay" />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${brandColor}cc, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: brandColor }} />
      </div>

      {/* Store Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-5 -mt-10 pb-6 border-b border-gray-200 dark:border-gray-800">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name}
              className="h-20 w-20 rounded-2xl object-cover border-4 border-white dark:border-gray-900 shadow-xl shrink-0" />
          ) : (
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white dark:border-gray-900 shadow-xl shrink-0"
              style={{ background: brandColor }}>
              {store.name[0]}
            </div>
          )}
          <div className="pb-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{store.name}</h1>
              {store.is_official && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: brandColor }}>
                  <ShieldCheck className="h-3 w-3" /> Official
                </span>
              )}
              {owner?.is_verified && (
                <span className="text-xs text-blue-600 font-medium">✓ Verified Seller</span>
              )}
            </div>
            {store.tagline && <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">{store.tagline}</p>}
            {(store.category_tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(store.category_tags as string[]).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: brandColor, borderColor: brandColor + "44", background: brandColor + "11" }}>
                    <Tag className="h-2.5 w-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <div className="py-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{store.description}</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="py-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Products</h2>

          {!products?.length ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: any) => (
                <div key={product.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  style={{ borderColor: brandColor + "33" }}>
                  {/* Store color accent top bar */}
                  <div className="h-1" style={{ background: brandColor }} />

                  <Link href={`/catalog/product/${product.id}`}>
                    <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-200 dark:text-gray-700" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-3">
                    <Link href={`/catalog/product/${product.id}`}>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 hover:underline">{product.name}</p>
                    </Link>
                    {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
                    <p className="text-base font-extrabold mt-1.5" style={{ color: brandColor }}>{formatCurrency(product.price)}</p>

                    {/* Seller badge */}
                    <div className="flex items-center gap-1.5 mt-2 pb-1">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold shrink-0"
                        style={{ background: brandColor }}>{store.name[0]}</div>
                      <span className="text-[10px] text-gray-400 truncate">{store.name}</span>
                    </div>

                    <AddToCartButton product={product} agentId={product.client_id} className="w-full mt-2 h-8 text-xs text-white border-none font-semibold"
                      style={{ background: brandColor }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
