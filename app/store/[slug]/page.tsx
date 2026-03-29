import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import {
  Package, ClipboardList, Users, TrendingUp, ArrowRight,
  AtSign, Share2, Phone, Globe, Sparkles, Zap,
  CreditCard, BarChart3, Star, MessageSquare, Settings
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function SellerDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("*").eq("slug", slug).single()
  if (!store) redirect("/store")

  const [
    { count: productCount },
    { count: orderCount },
    { count: pendingCount },
    { count: agentCount },
    { data: recentOrders },
    { data: paidOrders },
    { data: payments },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("status", "pending"),
    supabase.from("store_members").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("role", "agent"),
    supabase.from("orders").select(`*, products(name), services(name), user_profile:profiles!orders_user_id_fkey(full_name)`)
      .eq("store_id", store.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select(`product_id, service_id, total_amount, products(name), services(name)`)
      .eq("store_id", store.id).in("status", ["paid", "completed", "processing"]),
    supabase.from("payments").select("amount").eq("status", "success"),
  ])

  const brandColor = store.brand_color || "#7c3aed"
  const storeFeatures = (store.features as any) || {}
  const socialLinks = (store.social_links as any) || {}
  const storeConfig = (store.store_config as any) || {}

  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0
  const hasAgents = (agentCount ?? 0) > 0

  // ── Product Heatmap Calculation ──
  const productCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  paidOrders?.forEach((order: any) => {
    if (order.product_id && order.products) {
      if (!productCounts[order.product_id]) {
        productCounts[order.product_id] = { name: order.products.name, count: 0, revenue: 0 }
      }
      productCounts[order.product_id].count++
      productCounts[order.product_id].revenue += Number(order.total_amount) || 0
    }
  })
  const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5)
  const maxCount = topProducts[0]?.count || 1

  const statusColors: Record<string, string> = {
    pending:         "bg-yellow-100 text-yellow-700",
    agent_confirmed: "bg-teal-100 text-teal-700",
    paid:            "bg-green-100 text-green-700",
    completed:       "bg-emerald-100 text-emerald-700",
    cancelled:       "bg-red-100 text-red-700",
    processing:      "bg-indigo-100 text-indigo-700",
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">

      {/* ── Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-[2rem] p-8 shadow-xl"
        style={{ background: `linear-gradient(135deg, ${brandColor}dd, ${brandColor}88)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-white/70" />
              <span className="text-white/70 text-xs font-black uppercase tracking-[0.3em]">Seller Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">{store.name}</h1>
            {store.tagline && <p className="text-white/70 text-sm font-medium italic mt-1">{store.tagline}</p>}
            {storeConfig.announcement && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white/90 max-w-md">
                📣 {storeConfig.announcement}
              </div>
            )}
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <Link href={`/store/${slug}/products`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black uppercase tracking-widest transition-all border border-white/20 backdrop-blur-sm">
              <Package className="h-4 w-4" /> Products
            </Link>
            <Link href={`/stores/${slug}`} target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-xs font-black uppercase tracking-widest transition-all hover:shadow-lg"
              style={{ color: brandColor }}>
              View Store <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Social Links in banner */}
        {(socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp) && (
          <div className="relative z-10 flex items-center gap-4 mt-5 pt-5 border-t border-white/20">
            {socialLinks.instagram && (
              <a href={`https://instagram.com/${socialLinks.instagram.replace("@", "")}`} target="_blank"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold">
                <AtSign className="h-4 w-4" /> {socialLinks.instagram}
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook.startsWith("http") ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`} target="_blank"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold">
                <Share2 className="h-4 w-4" /> Facebook
              </a>
            )}
            {socialLinks.whatsapp && (
              <a href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, "")}`} target="_blank"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold">
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── No-agent banner ── */}
      {storeFeatures.ai_agents && !hasAgents && (
        <div className="rounded-2xl border p-4 flex items-center justify-between gap-4"
          style={{ borderColor: brandColor + "44", background: brandColor + "0a" }}>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">You're managing orders yourself</p>
            <p className="text-xs text-gray-500 mt-0.5">No agents added yet. Add agents from your dashboard to delegate.</p>
          </div>
          <Link href={`/store/${slug}/agents`}
            className="shrink-0 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl text-white flex items-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: brandColor }}>
            Add Agent <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* ── Key Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue",   value: formatCurrency(totalRevenue),  icon: TrendingUp,  href: `/store/${slug}/orders`,   badge: "live" },
          { label: "Total Products",  value: productCount ?? 0,              icon: Package,     href: `/store/${slug}/products`, badge: null },
          { label: "Total Orders",    value: orderCount ?? 0,                icon: ClipboardList, href: `/store/${slug}/orders`, badge: null },
          { label: "Pending Orders",  value: pendingCount ?? 0,              icon: Zap,         href: `/store/${slug}/orders`,   badge: (pendingCount ?? 0) > 0 ? "urgent" : null },
          { label: "Active Agents",   value: agentCount ?? 0,                icon: Users,       href: `/store/${slug}/agents`,  badge: null },
        ].map(({ label, value, icon: Icon, href, badge }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer group border-gray-100 dark:border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: brandColor + "18" }}>
                    <Icon className="h-4 w-4" style={{ color: brandColor }} />
                  </div>
                  {badge === "live" && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Live</span>
                  )}
                  {badge === "urgent" && (
                    <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Product Heatmap */}
        <Card className="md:col-span-2 border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: brandColor + "18" }}>
                <BarChart3 className="h-4 w-4" style={{ color: brandColor }} />
              </div>
              <div>
                <h2 className="font-black text-sm text-gray-900 dark:text-white">Product Performance Heatmap</h2>
                <p className="text-[10px] text-gray-400 italic">Most ordered products in your boutique</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: brandColor }} />
          </div>
          <CardContent className="p-6">
            {!topProducts.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: brandColor + "12" }}>
                  <BarChart3 className="h-8 w-8" style={{ color: brandColor + "60" }} />
                </div>
                <p className="text-sm text-gray-500 font-medium">No sales data yet</p>
                <p className="text-xs text-gray-400 italic">Your product heatmap will appear once orders come in.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {topProducts.map((prod, idx) => {
                  const pct = Math.round((prod.count / maxCount) * 100)
                  const medal = ["🥇", "🥈", "🥉", "4th", "5th"][idx]
                  return (
                    <div key={prod.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-gray-400 w-6">{medal}</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{prod.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-gray-500">{formatCurrency(prod.revenue)}</span>
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-lg"
                            style={{ background: brandColor + "18", color: brandColor }}
                          >
                            {prod.count} sold
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${brandColor}99, ${brandColor})` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-100 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-black text-sm text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="text-[10px] text-gray-400 italic mt-0.5">Manage your boutique</p>
          </div>
          <CardContent className="p-4 space-y-2">
            {[
              { label: "Add Product",     icon: Package,     href: `/store/${slug}/products`, sub: "List a new item" },
              { label: "View Orders",     icon: ClipboardList, href: `/store/${slug}/orders`, sub: `${pendingCount ?? 0} pending` },
              { label: "Identity Card",   icon: CreditCard,  href: `/store/${slug}/branded-card`, sub: "Your boutique card" },
              { label: "Messages",        icon: MessageSquare, href: `/store/${slug}/messages`, sub: "Buyer chats" },
              { label: "Settings",        icon: Settings,    href: `/store/${slug}/settings`, sub: "Style & payout" },
            ].map(({ label, icon: Icon, href, sub }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: brandColor + "15" }}>
                  <Icon className="h-4 w-4" style={{ color: brandColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[9px] text-gray-400 italic">{sub}</p>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Orders ── */}
      <Card className="border-gray-100 dark:border-gray-800">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-black text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href={`/store/${slug}/orders`} className="text-xs font-bold hover:underline" style={{ color: brandColor }}>
            View all →
          </Link>
        </div>
        <CardContent className="p-0">
          {!recentOrders?.length ? (
            <p className="text-center text-sm text-gray-500 py-10 italic">No orders yet — share your store to get started!</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.user_profile?.full_name} · {order.products?.name || order.services?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
