import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAllStores } from "@/lib/actions/stores"
import { Info, ShieldCheck, Search, Plus, Sparkles, Gavel, LayoutGrid } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StoreManagementTable } from "@/components/admin/store-management-table"

export default async function AdminStoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  // Fetch all stores (including unverified) for the admin board
  const stores = await getAllStores(false)

  return (
    <div className="space-y-10 py-10 px-8 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-900 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" /> Global Marketplace Console
          </div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
            Boutique <span className="text-blue-600">Verification.</span>
          </h1>
          <p className="text-gray-500 font-medium italic max-w-lg">Review new stores, verify marketplace partners, and enforce platform commission compliance.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="Search by SLUG or OWNER..." 
              className="pl-12 w-full md:w-80 h-14 rounded-2xl bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-medium" 
            />
          </div>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Marketplace Size", value: stores.length, sub: "Registered Boutiques", icon: LayoutGrid, color: "bg-blue-600" },
          { label: "Awaiting Review", value: stores.filter((s: any) => !s.is_verified).length, sub: "Pending Verification", icon: Info, color: "bg-orange-500" },
          { label: "Active Partners", value: stores.filter((s: any) => s.is_active).length, sub: "Operational Stores", icon: ShieldCheck, color: "bg-emerald-600" },
          { label: "Commission Logic", value: "5%", sub: "Standard Revenue Share", icon: Gavel, color: "bg-gray-900" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-4 group hover:border-blue-500/20 transition-all duration-500">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase italic">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN MANAGEMENT TABLE ── */}
      <div className="pt-4">
        <StoreManagementTable initialStores={stores} />
      </div>

      {/* ── FOOTER FOOTPRINT ── */}
      <footer className="text-center pt-20 pb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 dark:text-gray-800">
          Eagle Choice Global Infrastructure &bull; Central Admin Control &bull; 2026
        </p>
      </footer>

    </div>
  )
}
