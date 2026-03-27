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
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*, profiles!orders_user_id_fkey(full_name), products(name), services(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount").eq("status", "success"),
  ])

  const totalRevenue = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0

  const stats = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "Total Orders", value: totalOrders ?? 0, icon: ClipboardList, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Pending Orders", value: pendingOrders ?? 0, icon: LayoutDashboard, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { title: "Agents", value: totalClients ?? 0, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your business</p>
        </div>
        <LiveVisitorCounter />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
            <CardContent className="p-4">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 transition-colors ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 transition-colors">
          <CardTitle className="text-base dark:text-white transition-colors">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!recentOrders?.length ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 transition-colors">No orders yet</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{order.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                      {(order.profiles as any)?.full_name} · {order.products?.name || order.services?.name || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">{formatCurrency(order.total_amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize transition-colors ${statusColors[order.status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
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
