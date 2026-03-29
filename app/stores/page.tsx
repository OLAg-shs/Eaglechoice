import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { getAllStores } from "@/lib/actions/stores"
import { StoreDirectoryGrid } from "@/components/store/store-directory-grid"

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
        <StoreDirectoryGrid stores={stores} />
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
