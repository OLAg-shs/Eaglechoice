import { getAllStores } from "@/lib/actions/stores"
import Link from "next/link"
import { Store, Tag, ArrowRight } from "lucide-react"

export const metadata = {
  title: "All Stores — Eagle Choice",
  description: "Browse all stores on Eagle Choice and find what you need.",
}

export default async function StoresDirectoryPage() {
  const stores = await getAllStores()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Marketplace</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Discover stores selling across Ghana and beyond.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!stores.length ? (
          <div className="text-center py-20">
            <Store className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No stores yet</h3>
            <p className="text-gray-500 mt-1">Be the first to open a store on Eagle Choice!</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 transition-colors">
              Start Selling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stores.map((store: any) => {
              const brandColor = store.brand_color || "#2563eb"
              return (
                <Link key={store.id} href={`/stores/${store.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Banner / color bar */}
                  <div className="h-16 relative overflow-hidden" style={{ background: brandColor + "22" }}>
                    {store.banner_url
                      ? <img src={store.banner_url} alt="" className="w-full h-full object-cover" />
                      : <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${brandColor}, transparent)` }} />}
                    {/* Accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: brandColor }} />
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    {/* Logo + name */}
                    <div className="flex items-center gap-3 mb-3 -mt-6 relative z-10">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-white dark:border-gray-900 shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm border-2 border-white dark:border-gray-900"
                          style={{ background: brandColor }}>
                          {store.name[0]}
                        </div>
                      )}
                      <div className="min-w-0 mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{store.name}</h3>
                        {store.is_official && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: brandColor }}>Official</span>
                        )}
                      </div>
                    </div>

                    {store.tagline && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{store.tagline}</p>
                    )}

                    {/* Category tags */}
                    {(store.category_tags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(store.category_tags as string[]).slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                            style={{ color: brandColor, borderColor: brandColor + "44", background: brandColor + "11" }}>
                            <Tag className="h-2.5 w-2.5" />{tag}
                          </span>
                        ))}
                        {(store.category_tags?.length ?? 0) > 3 && (
                          <span className="text-[10px] text-gray-400">+{store.category_tags.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2.5 transition-all" style={{ color: brandColor }}>
                        Visit Store <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
