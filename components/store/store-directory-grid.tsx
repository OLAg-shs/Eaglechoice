"use client"

import { useState } from "react"
import Link from "next/link"
import { Store, ArrowRight, ShieldCheck, Tag, Sparkles, Zap, X, MapPin, Phone, User, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StoreDirectoryGrid({ stores }: { stores: any[] }) {
  const [selectedStore, setSelectedStore] = useState<any | null>(null)

  if (!stores || stores.length === 0) {
    return (
      <div className="text-center py-32 bg-white dark:bg-gray-950 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-900 flex flex-col items-center justify-center space-y-6">
        <div className="h-24 w-24 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 dark:text-gray-800 border border-gray-100 dark:border-gray-800">
          <Store className="h-12 w-12" strokeWidth={1} />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">No boutiques live yet.</h3>
          <p className="text-gray-400 font-medium italic">Check back soon for the official launch of our curated marketplace.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {stores.map((store: any) => (
          <div 
            key={store.id}
            onClick={() => setSelectedStore(store)}
            className="group relative bg-white dark:bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-2"
          >
            {/* Brand Accent Top */}
            <div className="h-4 w-full" style={{ background: store.brand_color || "#2563eb" }} />
            
            <div className="p-10 md:p-12 space-y-8 flex-1 flex flex-col pointer-events-none">
              {/* Store Identity */}
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl font-black text-white" style={{ background: store.brand_color || "#2563eb" }}>
                      {store.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{store.name}</h3>
                    <ShieldCheck className="h-5 w-5" style={{ color: store.brand_color || "#2563eb" }} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{store.owner?.full_name || "Official Vendor"}</p>
                </div>
              </div>

              {/* Store Vibe */}
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed italic line-clamp-2">
                &quot;{store.tagline || "Premium items and electronics."}&quot;
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                {store.successful_deals > 10 && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-200 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="h-3 w-3 text-yellow-600 font-black" />
                    <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest">Gold Partner</span>
                  </div>
                )}
                <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  {store.category_focus || "General"}
                </span>
              </div>
            </div>

            {/* Bottom Graphic Ornament */}
            <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" style={{ background: (store.brand_color || "#2563eb") + "22" }} />
          </div>
        ))}
      </div>

      {/* --- STORE IDENTITY OVERLAY DRAWER --- */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedStore(null)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-black sm:rounded-[3rem] rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 border border-gray-100 dark:border-gray-800">
            {/* Top Brand Banner */}
            <div className="h-32 w-full relative" style={{ background: selectedStore.brand_color || "#2563eb" }}>
              <button 
                onClick={() => setSelectedStore(null)}
                className="absolute top-6 right-6 h-10 w-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-10 pb-10">
              {/* Floating Avatar */}
              <div className="h-28 w-28 rounded-full border-4 border-white dark:border-black bg-gray-100 mx-auto -mt-14 overflow-hidden relative shadow-xl">
                {selectedStore.logo_url ? (
                  <img src={selectedStore.logo_url} alt={selectedStore.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-4xl font-black text-white" style={{ background: selectedStore.brand_color || "#2563eb" }}>
                    {selectedStore.name[0]}
                  </div>
                )}
              </div>

              {/* Title & Verification */}
              <div className="text-center mt-6 mb-8 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">{selectedStore.name}</h2>
                  <ShieldCheck className="h-6 w-6" style={{ color: selectedStore.brand_color || "#2563eb" }} />
                </div>
                <p className="text-sm font-medium italic text-gray-500">&quot;{selectedStore.tagline}&quot;</p>
              </div>

              {/* Quick Bio & Stats */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] p-6 space-y-5 mb-8 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Owner</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mt-1">{selectedStore.owner?.full_name}</p>
                    </div>
                  </div>
                  {/* Tenure / Member Since */}
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tenure</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mt-1">Founding Member</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                   {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Line</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mt-1">{selectedStore.owner?.phone || "Not Listed"}</p>
                    </div>
                  </div>
                  {/* Agents */}
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Agents</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mt-1">Multi-Agent Support</p>
                  </div>
                </div>
              </div>

               {/* Socials Box */}
               {selectedStore.social_links && (selectedStore.social_links.instagram || selectedStore.social_links.x) && (
                 <div className="flex items-center justify-center gap-4 mb-8">
                   {selectedStore.social_links.instagram && (
                     <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-[10px] font-black tracking-widest uppercase border border-gray-100">
                       IG: {selectedStore.social_links.instagram}
                     </div>
                   )}
                   {selectedStore.social_links.x && (
                     <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-[10px] font-black tracking-widest uppercase border border-gray-100">
                       X: {selectedStore.social_links.x}
                     </div>
                   )}
                 </div>
               )}

              {/* Action */}
              <Link href={`/stores/${selectedStore.slug}`} className="block">
                <Button 
                  className="w-full h-16 rounded-[1.5rem] font-black text-lg text-white hover:scale-[1.02] transition-transform shadow-2xl"
                  style={{ background: selectedStore.brand_color || "#2563eb", boxShadow: `0 20px 40px ${(selectedStore.brand_color || "#2563eb")}44` }}
                >
                  Enter Official Boutique <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
