"use client"

import { useState } from "react"
import { 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Globe, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { verifyStore, toggleStoreActive } from "@/lib/actions/stores"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface StoreManagementTableProps {
  initialStores: any[]
}

export function StoreManagementTable({ initialStores }: StoreManagementTableProps) {
  const [stores, setStores] = useState(initialStores)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleVerify(id: string, current: boolean) {
    setLoadingId(id)
    const res = await verifyStore(id, !current)
    if (res.success) {
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_verified: !current } : s))
      toast({ title: !current ? "Store Verified ✅" : "Verification Removed", description: "Marketplace status updated." })
    } else {
      toast({ variant: "destructive", title: "Error", description: res.error })
    }
    setLoadingId(null)
  }

  async function handleToggleActive(id: string, current: boolean) {
    setLoadingId(id)
    const res = await toggleStoreActive(id, !current)
    if (res.success) {
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
      toast({ title: !current ? "Store Reactivated" : "Store Suspended ⚠️", description: "Public access updated." })
    } else {
      toast({ variant: "destructive", title: "Error", description: res.error })
    }
    setLoadingId(null)
  }

  return (
    <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Boutique Info</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Owner Detail</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Marketplace Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
            {stores.map((store) => (
              <tr key={store.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all duration-300">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-white font-black text-xl" style={{ background: store.brand_color || '#2563eb' }}>
                          {store.name[0]}
                        </div>
                      )}
                      {store.is_verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-950 shadow-lg">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-black text-gray-900 dark:text-white leading-tight tracking-tight">{store.name}</p>
                        {store.is_official && <Badge className="bg-blue-600 hover:bg-blue-600 text-[8px] h-4 uppercase tracking-tighter shadow-sm">Official</Badge>}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">/{store.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-200">{store.owner?.full_name}</p>
                    <p className="text-xs text-gray-400 font-medium italic">{store.owner?.email}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={store.is_verified} 
                      onCheckedChange={() => handleVerify(store.id, store.is_verified)}
                      disabled={loadingId === store.id}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${store.is_verified ? "text-blue-600" : "text-gray-400"}`}>
                        {store.is_verified ? "Verified Store" : "Pending Review"}
                      </span>
                      <p className="text-[9px] text-gray-400 italic">Visible on marketplace</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={store.is_active} 
                      onCheckedChange={() => handleToggleActive(store.id, store.is_active)}
                      disabled={loadingId === store.id}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${store.is_active ? "text-emerald-600" : "text-red-600"}`}>
                        {store.is_active ? "Live & active" : "Suspended"}
                      </span>
                      <p className="text-[9px] text-gray-400 italic">Operational status</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <Link 
                      href={`/stores/${store.slug}`} 
                      target="_blank" 
                      className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-black hover:text-white dark:hover:bg-blue-600 flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                      <Globe className="h-4 w-4" />
                    </Link>
                    <button className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800 shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-all border border-gray-100 dark:border-gray-800 shadow-sm">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
