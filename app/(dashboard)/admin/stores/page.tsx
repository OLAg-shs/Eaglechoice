import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAllStores } from "@/lib/actions/stores"
import { Store, ShieldCheck, ExternalLink, MoreVertical, Search, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function AdminStoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  const stores = await getAllStores()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Marketplace Stores</h1>
          <p className="text-gray-500 mt-1">Manage all registered sellers and official stores on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search stores..." className="pl-9 w-full md:w-64 rounded-xl border-gray-200 dark:border-gray-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-600 text-white border-none shadow-xl">
          <CardContent className="p-6">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Stores</p>
            <p className="text-3xl font-black">{stores.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Official Stores</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {stores.filter((s: any) => s.is_official).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Commission Rate</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">5%</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Platform Revenue</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-500 select-none">GH₵ 0.00</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Store</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Owner / Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {stores.map((store: any) => (
                <tr key={store.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt="" className="h-10 w-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-sm" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ background: store.brand_color || '#2563eb' }}>
                          {store.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{store.name}</p>
                          {store.is_official && <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono tracking-tighter">/{store.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{store.owner?.full_name || 'System Auto'}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{store.owner?.email || 'official@eaglechoice'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {store.is_active ? (
                        <Badge className="bg-green-100 text-green-700 border-none w-fit text-[10px] font-bold">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-none w-fit text-[10px] font-bold">Suspended</Badge>
                      )}
                      {store.is_official && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 dark:border-blue-900/40 w-fit text-[10px] font-bold">Official Store</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 tabular-nums">
                    {formatDate(store.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white tabular-nums">GH₵ 0.00</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">0 Sales</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/stores/${store.slug}`} target="_blank" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
