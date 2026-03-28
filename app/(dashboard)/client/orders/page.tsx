import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClipboardList, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export default async function UserOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "user") redirect("/login")

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      client_profile:profiles!orders_client_id_fkey(full_name),
      products(name),
      services(name),
      payments(status, paid_at)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{orders?.length ?? 0} total orders</p>
        </div>
        <Link href="/client/catalog">
          <Button><Plus className="mr-2 h-4 w-4" />New Order</Button>
        </Link>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="mb-4 h-16 w-16 text-gray-200" />
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="text-sm text-gray-500 mb-4">Browse our catalog to place your first order</p>
          <Link href="/client/catalog">
            <Button>Browse Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
            {orders.map((order: any) => (
            <Link key={order.id} href={`/client/orders/${order.id}`}>
              <Card className="hover-lift cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white transition-colors">{order.order_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize transition-colors ${statusColors[order.status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">
                        {order.products?.name || order.services?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">
                        Agent: {order.client_profile?.full_name} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white transition-colors">{formatCurrency(order.total_amount)}</p>
                      {order.status === "payment_pending" && (
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">⚡ Payment needed</span>
                      )}
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
