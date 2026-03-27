import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LayoutDashboard, Users, ClipboardList, CreditCard, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { LiveVisitorCounter } from "@/components/live-visitor-counter"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  // Fetch stats in parallel
  const [
    { count: totalClients },
    { count: totalUsers },
    { count: totalOrders },
    { count: pendingOrders },
    { data: recentOrders },
    { data: payments },
    { data: allPaidOrders },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*, profiles!orders_user_id_fkey(full_name), products(name), services(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount").eq("status", "success"),
    // Fetch specifically to calculate trending metrics
    supabase.from("orders").select(`
      id,
      product_id,
      service_id,
      client_id,
      products(name),
      services(name)
    `).in("status", ["paid", "completed", "processing"]),
  ])

  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0

  // --- Aggregation Engine for Real-time Leaderboards ---
  const productCounts: Record<string, { name: string, count: number }> = {}
  const serviceCounts: Record<string, { name: string, count: number }> = {}
  const agentCounts: Record<string, { name: string, avatar: string, count: number }> = {}

  allPaidOrders?.forEach(order => {
    if (order.product_id && order.products) {
      if (!productCounts[order.product_id]) productCounts[order.product_id] = { name: (order.products as any).name, count: 0 }
      productCounts[order.product_id].count++
    }
    if (order.service_id && order.services) {
      if (!serviceCounts[order.service_id]) serviceCounts[order.service_id] = { name: (order.services as any).name, count: 0 }
      serviceCounts[order.service_id].count++
    }
  })

  // Sort and select top 3
  const trendingProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 3)
  const trendingServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count).slice(0, 3)
  const topAgents = Object.values(agentCounts).sort((a, b) => b.count - a.count).slice(0, 3)

  const stats = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "Total Orders", value: totalOrders ?? 0, icon: ClipboardList, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Pending Orders", value: pendingOrders ?? 0, icon: LayoutDashboard, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { title: "Verified Agents", value: totalClients ?? 0, icon: Users, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Customers", value: totalUsers ?? 0, icon: Users, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/20" },
  ]

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    payment_pending: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    completed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time overview of business performance</p>
        </div>
        <LiveVisitorCounter />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
            <CardContent className="p-4">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 transition-colors ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trending Products */}
        <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Trending Products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {!trendingProducts.length ? <p className="text-xs text-gray-500">Not enough data.</p> : (
              <div className="space-y-4">
                {trendingProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-4">{prod.name}</p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{prod.count} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Requested Services */}
        <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Trending Services
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {!trendingServices.length ? <p className="text-xs text-gray-500">Not enough data.</p> : (
              <div className="space-y-4">
                {trendingServices.map((srv, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-4">{srv.name}</p>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">{srv.count} reqs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Agents */}
        <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 transition-colors shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Top Performing Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {!topAgents.length ? <p className="text-xs text-gray-500">Not enough data.</p> : (
              <div className="space-y-4">
                {topAgents.map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {agent.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={agent.avatar} alt="Agent" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                          {agent.name.charAt(0)}
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{agent.name}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">{agent.count} deals</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 overflow-hidden transition-colors shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 transition-colors pb-4">
          <CardTitle className="text-base font-bold dark:text-white transition-colors">Recent Orders Setup</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!recentOrders?.length ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 transition-colors">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{order.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors mt-0.5">
                      <span className="font-medium">{(order.profiles as any)?.full_name}</span> · {order.products?.name || order.services?.name || "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-500 transition-colors">{formatCurrency(order.total_amount)}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider transition-colors ${statusColors[order.status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                      {order.status.replace("_", " ")}
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
