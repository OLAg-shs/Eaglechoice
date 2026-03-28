import Link from "next/link"
import { Store, ArrowRight, ShieldCheck, Tag, Sparkles, Zap } from "lucide-react"
import { getAllStores } from "@/lib/actions/stores"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Verified Boutiques — Eagle Choice",
  description: "Browse premium, independent stores managed by verified agents across Ghana.",
}

export default async function StoresDirectoryPage() {
  const stores = await getAllStores()

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        {/* Animated Background Splashes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-blue-400 blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-500 blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Trusted Multi-Vendor Ecosystem
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            Verified <span className="text-blue-600">Boutiques.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium italic leading-relaxed">
            Enter independent stores managed by specialized agents across Ghana. Secure, direct, and premium.
          </p>
        </div>
      </section>

      {/* ── STORES GRID ── */}
      <main className="max-w-7xl mx-auto py-24 px-6 lg:px-8">
        {!stores || stores.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-gray-950 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-900 flex flex-col items-center justify-center space-y-6">
            <div className="h-24 w-24 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 dark:text-gray-800 border border-gray-100 dark:border-gray-800">
              <Store className="h-12 w-12" strokeWidth={1} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">No boutiques live yet.</h3>
              <p className="text-gray-400 font-medium italic">Check back soon for the official launch of our curated marketplace.</p>
            </div>
            <Link href="/register/seller">
              <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all">
                Open Your Store Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {stores.map((store: any) => (
              <div 
                key={store.id}
                className="group relative bg-white dark:bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden flex flex-col"
              >
                {/* Brand Accent Top */}
                <div className="h-3 w-full" style={{ background: store.brand_color }} />
                
                <div className="p-10 md:p-12 space-y-8 flex-1 flex flex-col">
                  {/* Store Identity */}
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl font-black text-white" style={{ background: store.brand_color }}>
                          {store.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{store.name}</h3>
                        <ShieldCheck className="h-5 w-5" style={{ color: store.brand_color }} />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{store.owner?.full_name || "Official Vendor"}</p>
                    </div>
                  </div>

                  {/* Store Vibe */}
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed italic line-clamp-2">
                    &quot;{store.tagline || "Your trusted boutique for premium items and electronics."}&quot;
                  </p>

                  {/* Categories & Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    {store.successful_deals > 10 && (
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700/50 flex items-center gap-1.5 shadow-sm animate-pulse">
                        <Sparkles className="h-3 w-3 text-yellow-600 dark:text-yellow-400 font-black" />
                        <span className="text-[9px] font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-widest">Gold Partner</span>
                      </div>
                    )}
                    {store.avg_response_seconds < 3600 && store.successful_deals > 0 && (
                      <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-blue-500" />
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Fast Responder</span>
                      </div>
                    )}
                    {(store.category_tags as string[])?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
                        {tag}
                      </span>
                    )) || (
                      <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
                        Electronics
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="pt-6 mt-auto">
                    <Link href={`/stores/${store.slug}`}>
                      <Button 
                        className="w-full h-16 rounded-[1.5rem] font-black text-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-blue-600 transition-all duration-500 group-hover:shadow-2xl flex items-center justify-between px-8"
                      >
                        Enter Boutique <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Bottom Graphic Ornament */}
                <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="max-w-7xl mx-auto py-10 px-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Eagle Choice &bull; Boutique Directory &bull; 2026</p>
        <div className="flex gap-10">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">Security First</span>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">Verified Agents</span>
        </div>
      </footer>

    </div>
  )
}
