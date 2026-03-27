import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShoppingBag, ClipboardList, CreditCard, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "user") redirect("/login")

  const [
    { count: totalOrders },
    { count: activeOrders },
    { data: recentOrders },
    { data: products },
    { data: services },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["pending", "in_progress", "payment_pending", "paid", "processing"]),
    supabase.from("orders").select("*, products(name), services(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("products").select("id, name, price, images, category").eq("is_available", true).limit(4),
    supabase.from("services").select("id, name, base_price, category").eq("is_available", true).limit(4),
  ])

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
        <p className="text-sm text-gray-500 mt-1">What can we help you with today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link href="/user/catalog" className="group">
          <Card className="hover:border-blue-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Browse Catalog</p>
              <p className="text-xs text-gray-500">Laptops & services</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/user/orders" className="group">
          <Card className="hover:border-green-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">My Orders</p>
              <p className="text-xs text-gray-500">{activeOrders ?? 0} active</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/user/payments" className="group">
          <Card className="hover:border-purple-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Payments</p>
              <p className="text-xs text-gray-500">History & receipts</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/user/messages" className="group">
          <Card className="hover:border-pink-200 hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 group-hover:bg-pink-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-pink-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Messages</p>
              <p className="text-xs text-gray-500">Chat with agents</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      {(recentOrders?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/user/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.products?.name || order.services?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(order.total_amount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Products */}
      {(products?.length ?? 0) > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Featured Products</h2>
            <Link href="/user/catalog" className="text-sm text-blue-600 hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products?.map((p: any) => (
              <Link key={p.id} href={`/user/catalog/product/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="mt-1 text-sm font-bold text-blue-600">{formatCurrency(p.price)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
