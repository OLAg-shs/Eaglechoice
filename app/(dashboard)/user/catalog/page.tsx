import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShoppingBag, Briefcase, BadgeCheck, UserCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function UserCatalogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: products }, { data: services }] = await Promise.all([
    supabase.from("products").select("*, agent:profiles!agent_id(full_name, is_verified, avatar_url)").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("services").select("*, agent:profiles!agent_id(full_name, is_verified, avatar_url)").eq("is_active", true).order("created_at", { ascending: false }),
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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Browse Catalog</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover expert-handled products and digital services.</p>
      </div>

      {/* Products */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
          <ShoppingBag className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">({products?.length ?? 0})</span>
        </div>

        {!products?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <Link key={product.id} href={`/user/catalog/product/${product.id}`} className="group">
                <Card className="hover-lift overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md border-gray-200 dark:border-gray-800 h-full flex flex-col">
                  <div className="aspect-square bg-white dark:bg-gray-900 flex items-center justify-center transition-colors border-b border-gray-100 dark:border-gray-800 overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                    )}
                  </div>
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs dark:border-gray-700 text-gray-600 dark:text-gray-300">
                        {categoryLabels[product.category] || product.category}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight flex-1 mb-3">{product.name}</p>
                    
                    {product.agent && (
                      <div className="flex items-center gap-2 mb-3 bg-amber-50 dark:bg-amber-500/10 p-1.5 rounded border border-amber-100 dark:border-amber-500/20">
                        {product.agent.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.agent.avatar_url} alt="Agent" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <UserCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        )}
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 truncate">
                          Expert: {product.agent.full_name}
                        </span>
                        {product.agent.is_verified && <BadgeCheck className="w-3 h-3 text-amber-500 ml-auto flex-shrink-0" />}
                      </div>
                    )}

                    <div className="mt-auto">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-500 tracking-wide transition-colors">{formatCurrency(product.base_price)}</p>
                      {product.stock > 0 ? (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">{product.stock} in stock</p>
                      ) : (
                        <p className="text-xs font-medium text-red-500 dark:text-red-400 mt-1">Out of stock</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Services */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
          <Briefcase className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Services</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">({services?.length ?? 0})</span>
        </div>

        {!services?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any) => (
              <Link key={service.id} href={`/user/catalog/service/${service.id}`} className="group">
                <Card className="hover-lift cursor-pointer bg-white/50 dark:bg-black/20 backdrop-blur-md border-gray-200 dark:border-gray-800 overflow-hidden h-full flex flex-col">
                  {service.image_url && (
                    <div className="h-32 w-full overflow-hidden border-b border-gray-100 dark:border-gray-800">
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <CardContent className={service.image_url ? "p-5 flex flex-col flex-1" : "p-6 flex flex-col flex-1"}>
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-500/10">
                        {categoryLabels[service.category] || service.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white transition-colors leading-tight mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{service.description}</p>
                    )}
                    
                    {service.agent && (
                      <div className="flex items-center gap-2 mb-4 bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-md border border-indigo-100 dark:border-indigo-500/20">
                        {service.agent.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={service.agent.avatar_url} alt="Agent" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-indigo-500" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Expert Handler</span>
                          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                            {service.agent.full_name}
                            {service.agent.is_verified && <BadgeCheck className="w-3 h-3 text-indigo-500" />}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Starting At</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white transition-colors">{formatCurrency(service.base_price)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
