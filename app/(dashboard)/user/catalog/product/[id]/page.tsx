import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { ShoppingBag, ArrowLeft, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { PlaceOrderForm } from "@/components/orders/place-order-form"

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: product }, { data: clients }] = await Promise.all([
    supabase.from("products").select("*, profiles!client_id(id, full_name, is_verified)").eq("id", params.id).eq("is_available", true).single(),
    supabase.from("profiles").select("id, full_name, email").eq("role", "client").eq("is_active", true).order("full_name"),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/user/catalog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />Back to Catalog
      </Link>

      <Card>
        {product.images?.[0] && (
          <div className="aspect-video overflow-hidden rounded-t-xl">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          {product.profiles && (
            <div className="flex items-center gap-1 mt-2 mb-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 w-max">
              <span className="text-sm text-gray-500">Sold by</span>
              <span className="text-sm font-semibold text-blue-700">{product.profiles.full_name}</span>
              {product.profiles.is_verified && (
                <div title="Verified Agent">
                  <BadgeCheck className="w-4 h-4 text-green-500 ml-1" />
                </div>
              )}
            </div>
          )}
          {product.brand && <p className="text-gray-500 mt-1">{product.brand}</p>}
          <p className="text-3xl font-bold text-blue-600 mt-3">{formatCurrency(product.price)}</p>
          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}
          {product.stock_quantity > 0 ? (
            <p className="mt-2 text-sm text-green-600 font-medium">{product.stock_quantity} in stock</p>
          ) : (
            <p className="mt-2 text-sm text-red-500 font-medium">Out of stock</p>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="rounded bg-gray-50 p-2">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-sm font-medium">{val as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceOrderForm
            type="product"
            itemId={product.id}
            itemPrice={product.price}
            clients={clients || []}
            preAssignedClientId={product.client_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
