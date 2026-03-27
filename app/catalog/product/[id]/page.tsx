import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ShoppingBag, ArrowLeft, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceOrderForm } from "@/components/orders/place-order-form"
import type { Metadata } from "next"
import { ShareButton } from "@/components/share-button"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eagle-choice.vercel.app"

import { headers } from "next/headers"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headersList = await headers()
  const domain = headersList.get("host") || "eaglechoice.vercel.app"
  const protocol = domain.includes("localhost") ? "http" : "https"
  const currentUrl = `${protocol}://${domain}`

  const supabase = await createAdminClient()
  const { data: product } = await supabase
    .from("products")
    .select("name, description, price, images, profiles!client_id(full_name)")
    .eq("id", id)
    .single()

  if (!product) return { title: "Product - Eagle Choice" }

  const imageUrl = product.images?.[0]
  const agentName = (product.profiles as any)?.full_name

  const ogImageUrl = new URL(`${currentUrl}/api/og`)
  ogImageUrl.searchParams.set("title", product.name)
  ogImageUrl.searchParams.set("price", `GH₵ ${product.price}`)
  ogImageUrl.searchParams.set("type", "product")
  if (imageUrl) ogImageUrl.searchParams.set("image", imageUrl)
  if (agentName) ogImageUrl.searchParams.set("badge", `Expert: ${agentName}`)

  return {
    title: `${product.name} — Eagle Choice`,
    description: product.description || `Premium product available on Eagle Choice for GH₵ ${product.price}`,
    openGraph: {
      title: product.name,
      description: product.description || `Available on Eagle Choice for GH₵ ${product.price}`,
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: product.name }],
      type: "website",
      siteName: "Eagle Choice",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || `Available on Eagle Choice for GH₵ ${product.price}`,
      images: [ogImageUrl.toString()],
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headersList = await headers()
  const domain = headersList.get("host") || "eaglechoice.vercel.app"
  const protocol = domain.includes("localhost") ? "http" : "https"
  const currentUrl = `${protocol}://${domain}`

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  // DELETED: if (!user) redirect("/login")

  const [{ data: product }, { data: clients }] = await Promise.all([
    adminSupabase.from("products").select("*, profiles!client_id(id, full_name, is_verified)").eq("id", id).eq("is_available", true).single(),
    adminSupabase.from("profiles").select("id, full_name, email").eq("role", "client").eq("is_active", true).order("full_name"),
  ])

  if (!product) notFound()

  const shareUrl = `${currentUrl}/catalog/product/${product.id}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/catalog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Catalog
        </Link>
        <ShareButton url={shareUrl} title={product.name} />
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        {product.images?.[0] && (
          <div className="aspect-video overflow-hidden rounded-t-xl">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          {product.profiles && (
            <div className="flex items-center gap-1 mt-2 mb-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 w-max">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sold by</span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{product.profiles.full_name}</span>
              {product.profiles.is_verified && (
                <div title="Verified Agent">
                  <BadgeCheck className="w-4 h-4 text-green-500 ml-1" />
                </div>
              )}
            </div>
          )}
          {product.brand && <p className="text-gray-500 dark:text-gray-400 mt-1">{product.brand}</p>}
          <p className="text-3xl font-bold text-amber-500 mt-3">{formatCurrency(product.price)}</p>
          {product.description && (
            <p className="mt-4 text-gray-600 dark:text-gray-300">{product.description}</p>
          )}
          {product.stock_quantity > 0 ? (
            <p className="mt-2 text-sm text-green-600 font-medium">{product.stock_quantity} in stock</p>
          ) : (
            <p className="mt-2 text-sm text-red-500 font-medium">Out of stock</p>
          )}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="rounded bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-sm font-medium dark:text-white">{val as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <PlaceOrderForm
              type="product"
              itemId={product.id}
              itemPrice={product.price}
              clients={clients || []}
              preAssignedClientId={product.client_id}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Want to place an order? Please log in to your account.</p>
              <Button asChild className="gradient-primary">
                <Link href="/login">Log in to Order</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
