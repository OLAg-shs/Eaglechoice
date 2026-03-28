import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ShoppingBag, ArrowLeft, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceOrderForm } from "@/components/orders/place-order-form"
import type { Metadata } from "next"
import { ShareButton } from "@/components/share-button"
import { InquiryButton } from "@/components/messages/inquiry-button"

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
    .select("name, description, price, images, specifications, profiles!client_id(full_name)")
    .eq("id", id)
    .single()

  if (!product) return { title: "Product - Eagle Choice" }

  const imageUrl = product.images?.[0]
  const agentName = (product.profiles as any)?.full_name

  const ogImageUrl = new URL(`${currentUrl}/api/og`)
  ogImageUrl.searchParams.set("id", id)
  ogImageUrl.searchParams.set("type", "product")
  ogImageUrl.searchParams.set("ext", ".png") // Forces WhatsApp scraper to recognize it as an image
  
  if (agentName) ogImageUrl.searchParams.set("badge", `Expert: ${agentName}`)

  return {
    title: `${product.name} — Eagle Choice`,
    description: product.description || `Premium product available on Eagle Choice for GH₵ ${product.price}`,
    openGraph: {
      title: product.name,
      description: product.description || `Available on Eagle Choice for GH₵ ${product.price}`,
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: product.name, type: "image/png" }],
      type: "website",
      siteName: "Eagle Choice",
      url: `${currentUrl}/catalog/product/${id}`,
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
        <ShareButton 
          url={shareUrl} 
          title={product.name} 
          id={product.id}
          type="product"
        />
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        {product.images?.[0] && (
          <div className="aspect-video overflow-hidden rounded-t-xl">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{product.name}</h1>
              {product.brand && <p className="text-gray-500 dark:text-gray-400 font-medium">By {product.brand}</p>}
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-black text-amber-500 tracking-tight">{formatCurrency(product.price)}</p>
              {product.stock_quantity > 0 ? (
                <Badge className="mt-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:bg-green-500/20">
                  {product.stock_quantity} units in stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-1">Out of stock</Badge>
              )}
            </div>
          </div>

          {/* Place Order Block - Front loaded for mobile conversion */}
          <div className="mb-8 p-4 bg-gray-50/80 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
            {user ? (
              <PlaceOrderForm
                type="product"
                itemId={product.id}
                itemPrice={product.price}
                clients={clients || []}
                preAssignedClientId={product.client_id}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">You must be logged in to order this premium item.</p>
                <Button asChild className="gradient-primary w-full max-w-sm">
                  <Link href="/login">Log in to Order Now</Link>
                </Button>
              </div>
            )}
          </div>

          {product.profiles && (
             <div className="flex flex-wrap items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/10 mb-6">
               <div className="h-12 w-12 shrink-0 rounded-full bg-white dark:bg-black/50 shadow-sm flex items-center justify-center border border-amber-200 dark:border-amber-500/20 text-xl font-bold text-amber-500">
                 {product.profiles.avatar_url ? (
                   <img src={product.profiles.avatar_url} alt="Agent" className="h-full w-full rounded-full object-cover" />
                 ) : (
                   product.profiles.full_name.charAt(0).toUpperCase()
                 )}
               </div>
               <div className="flex-1 min-w-[120px]">
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expert Handler</p>
                 <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1 flex-wrap">
                   <span className="truncate">{product.profiles.full_name}</span>
                   {product.profiles.is_verified && <BadgeCheck className="w-4 h-4 shrink-0 text-amber-500" />}
                 </p>
               </div>
               <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0 flex gap-2 items-center flex-wrap">
                 <InquiryButton agentId={product.profiles.id} isAuthenticated={!!user} />
                 <Badge variant="outline" className="w-full justify-center sm:w-auto text-[10px] border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400">Verified Professional</Badge>
               </div>
             </div>

          )}

          {product.description && (
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Product Details</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-sm font-bold dark:text-white">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
