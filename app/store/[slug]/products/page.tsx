import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Plus, Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function SellerProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("id, brand_color, name").eq("slug", slug).eq("owner_id", user.id).single()
  if (!store) redirect("/store")

  const { data: products } = await supabase.from("products").select("*").eq("store_id", store.id).order("created_at", { ascending: false })
  const brandColor = store.brand_color || "#2563eb"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products?.length ?? 0} products in your store</p>
        </div>
        <Link href={`/store/${slug}/products/new`}>
          <Button className="text-white border-none font-semibold" style={{ background: brandColor }}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {!products?.length ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Package className="h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first product to start selling</p>
          <Link href={`/store/${slug}/products/new`} className="mt-4">
            <Button className="text-white border-none" style={{ background: brandColor }}><Plus className="mr-2 h-4 w-4" />Add Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden border hover:shadow-md transition-shadow" style={{ borderTopColor: brandColor, borderTopWidth: 2 }}>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                    {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                  </div>
                  <Badge variant={product.is_available ? "default" : "secondary"}>
                    {product.is_available ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold" style={{ color: brandColor }}>{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500">Stock: {product.stock_quantity} units</p>
                <div className="mt-3 flex gap-2">
                  <Link href={`/store/${slug}/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
