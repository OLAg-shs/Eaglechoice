import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Plus, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { AdminProductActions } from "@/components/admin/product-actions"
import { ShareButton } from "@/components/share-button"

export default async function ClientProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage laptops and accessories</p>
        </div>
        <Link href="/agent/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {!products?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="mb-4 h-16 w-16 text-gray-200" />
          <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first product to get started</p>
          <Link href="/agent/products/new" className="mt-4">
            <Button><Plus className="mr-2 h-4 w-4" />Add Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                  </div>
                  <Badge variant={product.is_available ? "default" : "secondary"}>
                    {product.is_available ? "Available" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-blue-600">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500">Stock: {product.stock_quantity} units</p>
                <div className="mt-3 flex gap-2">
                  {product.client_id === user.id ? (
                    <>
                      <Link href={`/agent/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Edit</Button>
                      </Link>
                      <AdminProductActions productId={product.id} />
                    </>
                  ) : (
                    <div className="flex-1">
                      <ShareButton id={product.id} type="product" title={product.name} url={`https://eagle-choice.vercel.app/catalog/product/${product.id}`} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
