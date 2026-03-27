import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  payment_pending: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  completed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      user_profile:profiles!orders_user_id_fkey(full_name, email),
      client_profile:profiles!orders_client_id_fkey(full_name),
      products(name),
      services(name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">All Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{orders?.length ?? 0} total orders</p>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="mb-4 h-16 w-16 text-gray-200" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <Card className="hover-lift cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white transition-colors">{order.order_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize transition-colors ${statusColors[order.status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">
                        {order.user_profile?.full_name} → Agent: {order.client_profile?.full_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">
                        {order.products?.name || order.services?.name} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white transition-colors">{formatCurrency(order.total_amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize transition-colors">{order.order_type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
