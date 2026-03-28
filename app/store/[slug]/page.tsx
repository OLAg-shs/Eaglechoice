import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Package, ClipboardList, Users, TrendingUp, ArrowRight } from "lucide-react"
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
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", store.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("status", "pending"),
    supabase.from("store_members").select("*", { count: "exact", head: true }).eq("store_id", store.id).eq("role", "agent"),
    supabase.from("orders").select(`*, products(name), services(name), user_profile:profiles!orders_user_id_fkey(full_name)`)
      .eq("store_id", store.id).order("created_at", { ascending: false }).limit(5),
  ])

  const brandColor = store.brand_color || "#2563eb"
  const hasAgents = (agentCount ?? 0) > 0

  const stats = [
    { label: "Total Products", value: productCount ?? 0, icon: Package, href: `/store/${slug}/products` },
    { label: "Total Orders", value: orderCount ?? 0, icon: ClipboardList, href: `/store/${slug}/orders` },
    { label: "Pending Orders", value: pendingCount ?? 0, icon: TrendingUp, href: `/store/${slug}/orders` },
    { label: "Active Agents", value: agentCount ?? 0, icon: Users, href: `/store/${slug}/agents` },
  ]

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    agent_confirmed: "bg-teal-100 text-teal-700",
    paid: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with <span className="font-semibold" style={{ color: brandColor }}>{store.name}</span></p>
      </div>

      {/* No-agent banner */}
      {!hasAgents && (
        <div className="rounded-2xl border p-4 flex items-center justify-between gap-4"
          style={{ borderColor: brandColor + "44", background: brandColor + "11" }}>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">You're managing orders yourself</p>
            <p className="text-xs text-gray-500 mt-0.5">No agents added yet — all orders come directly to you. Add agents anytime to delegate.</p>
          </div>
          <Link href={`/store/${slug}/agents`}
            className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl text-white flex items-center gap-1"
            style={{ background: brandColor }}>
            Add Agent <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: brandColor + "22" }}>
                    <Icon className="h-4 w-4" style={{ color: brandColor }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href={`/store/${slug}/orders`} className="text-xs font-medium hover:underline" style={{ color: brandColor }}>View all →</Link>
        </div>
        <CardContent className="p-0">
          {!recentOrders?.length ? (
            <p className="text-center text-sm text-gray-500 py-10">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.user_profile?.full_name} · {order.products?.name || order.services?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
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
