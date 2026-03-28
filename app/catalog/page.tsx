import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, cn } from "@/lib/utils"
import { ShoppingBag, Briefcase, BadgeCheck, UserCircle, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CatalogPage() {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: products }, { data: services }] = await Promise.all([
    adminSupabase.from("products").select("*, agent:profiles!client_id(full_name, is_verified, avatar_url)").eq("is_available", true).order("created_at", { ascending: false }),
    adminSupabase.from("services").select("*, agent:profiles!client_id(full_name, is_verified, avatar_url)").eq("is_available", true).order("created_at", { ascending: false }),
  ])

  const categoryLabels: Record<string, string> = {
    ghana_card: "Ghana Card",
    birth_certificate: "Birth Certificate",
    visa: "Visa Application",
    laptop: "Laptop",
    accessory: "Accessory",
    product: "Product",
    service: "Service"
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20 px-4">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">Browse Catalog</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Discover expert-handled products and digital services.</p>
      </div>

      {/* Products */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-3">
          <ShoppingBag className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Products</h2>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 border-none font-bold">
            {products?.length ?? 0}
          </Badge>
        </div>

        {!products?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm">
            <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-lg font-medium text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product: any) => {
              const highlights = product.specifications && typeof product.specifications === 'object'
                ? Object.entries(product.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`)
                : []
              
              const downloadUrl = new URL("/api/og", "https://eaglechoice.vercel.app")
              downloadUrl.searchParams.set("id", product.id)
              downloadUrl.searchParams.set("type", "product")
              downloadUrl.searchParams.set("download", "1")
              
              return (
                <div key={product.id} className="group relative flex flex-col">
                  <Link href={`/catalog/product/${product.id}`} className="flex-1">
                    <Card className="hover-lift overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-xl border-gray-200 dark:border-gray-800 h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl">
                      <div className="aspect-square bg-white dark:bg-gray-950 flex items-center justify-center border-b border-gray-100 dark:border-gray-900 overflow-hidden relative">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : (
                          <ShoppingBag className="h-12 w-12 text-gray-200 dark:text-gray-800" />
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm border-none text-[10px] font-bold tracking-wider uppercase">
                            {categoryLabels[product.category] || product.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-base leading-tight mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                          {product.name}
                        </h3>
                        
                        {product.agent && (
                          <div className="flex items-center gap-2 mb-3 mt-1">
                            <div className="h-5 w-5 shrink-0 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">
                              {product.agent.avatar_url ? (
                                <img src={product.agent.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : product.agent.full_name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                              {product.agent.full_name}
                              {product.agent.is_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                            </span>
                          </div>
                        )}
                        
                        {/* Highlights/Specs */}
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {highlights.map((h, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 font-medium">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-900 flex items-end justify-between">
                          <div>
                            <p className="text-xl font-black text-amber-600 dark:text-amber-500">
                              {formatCurrency(product.price)}
                            </p>
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-widest mt-1",
                              product.stock_quantity > 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {product.stock_quantity > 0 ? `${product.stock_quantity} In Stock` : "Out of Stock"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Services */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-3">
          <Briefcase className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Services</h2>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-none font-bold">
            {services?.length ?? 0}
          </Badge>
        </div>

        {!services?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm">
            <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-lg font-medium text-gray-500">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service: any) => {
              const highlights = service.required_documents && Array.isArray(service.required_documents)
                ? service.required_documents.slice(0, 3)
                : []

              const downloadUrl = new URL("/api/og", "https://eaglechoice.vercel.app")
              downloadUrl.searchParams.set("id", service.id)
              downloadUrl.searchParams.set("type", "service")
              downloadUrl.searchParams.set("download", "1")

              return (
                <div key={service.id} className="group relative flex flex-col">
                  <Link href={`/catalog/service/${service.id}`} className="flex-1">
                    <Card className="hover-lift overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-xl border-gray-200 dark:border-gray-800 h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl">
                      {service.cover_image_url && (
                        <div className="h-40 w-full overflow-hidden border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={service.cover_image_url} 
                            alt={service.name} 
                            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" 
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm border-none text-[10px] font-bold tracking-wider uppercase">
                              {categoryLabels[service.category] || service.category}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {service.name}
                        </h3>
                        
                        {service.agent && (
                          <div className="flex items-center gap-2 mb-3 mt-1">
                            <div className="h-5 w-5 shrink-0 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                              {service.agent.avatar_url ? (
                                <img src={service.agent.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : service.agent.full_name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                              {service.agent.full_name}
                              {service.agent.is_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />}
                            </span>
                          </div>
                        )}
                        
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {highlights.map((h: string, i: number) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 rounded-full text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-900/50">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
                          {service.description}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-900 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-0.5">Starting At</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(service.base_price)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 px-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-9 text-[11px] font-bold tracking-tighter uppercase dark:border-gray-800 dark:hover:bg-gray-900 gap-2"
                      asChild
                    >
                      <a href={downloadUrl.toString()} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                        Get Card
                      </a>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 dark:border-gray-800 dark:hover:bg-gray-900"
                      asChild
                    >
                      <Link href={`/catalog/service/${service.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
