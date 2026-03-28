import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClipboardList, Star, MessageSquare, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: pointsData },
    { data: recentOrders },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("client_id", user.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("client_id", user.id).eq("status", "completed"),
    supabase.from("points_ledger").select("balance_after").eq("client_id", user.id).order("created_at", { ascending: false }).limit(1),
    supabase.from("orders").select("*, profiles!orders_user_id_fkey(full_name), products(name), services(name)").eq("client_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false).neq("sender_id", user.id),
  ])

  const pointsBalance = pointsData?.[0]?.balance_after ?? 0
  const pointsGHS = (pointsBalance / 100).toFixed(2)

  const stats = [
    { title: "Assigned Orders", value: totalOrders ?? 0, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Pending", value: pendingOrders ?? 0, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-50" },
    { title: "Completed", value: completedOrders ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { title: "Points Balance", value: `${pointsBalance.toLocaleString()} pts`, icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    payment_pending: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.full_name?.split(" ")[0]}!</h1>
        <p className="text-sm text-gray-500 mt-1">Your agent dashboard</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {pointsBalance > 0 && (
        <Card className="border-purple-100 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">
                  {pointsBalance.toLocaleString()} points ≈ GH₵ {pointsGHS}
                </p>
                <p className="text-xs text-purple-600">100 points = GH₵ 1.00 · Min 1,000 pts to redeem</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentOrders?.length ? (
            <p className="text-center text-sm text-gray-500 py-4">No orders assigned yet</p>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {(order.profiles as any)?.full_name} · {order.products?.name || order.services?.name}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
