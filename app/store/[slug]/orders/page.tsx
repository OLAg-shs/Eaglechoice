import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ClipboardList } from "lucide-react"
import { AcceptOrderButton, VerifyPaymentButton, ExtendDeadlineButton } from "@/components/orders/agent-action-buttons"
import { RejectOrderDialog } from "@/components/orders/reject-order-dialog"
import { CountdownTimer } from "@/components/orders/countdown-timer"
import { TrackingUpdater } from "@/components/orders/tracking-updater"
import { OrderStatusUpdater } from "@/components/orders/order-status-updater"
import { AgentMessageButton } from "@/components/orders/messaging-toggle"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  agent_confirmed: "bg-teal-100 text-teal-700",
  in_progress: "bg-blue-100 text-blue-700",
  payment_pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
}

export default async function SellerOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase.from("stores").select("id, brand_color, name").eq("slug", slug).eq("owner_id", user.id).single()
  if (!store) redirect("/store")

  const { data: orders } = await supabase
    .from("orders")
    .select(`*, products(name, price), services(name, base_price), user_profile:profiles!orders_user_id_fkey(full_name, email, phone)`)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  const brandColor = store.brand_color || "#2563eb"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} total orders</p>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center py-20 text-center">
          <ClipboardList className="h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</h3>
          <p className="text-sm text-gray-500 mt-1">Orders from your store will show up here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            let expiryStr = order.form_data?.expires_at
            if (!expiryStr && order.status === "agent_confirmed") {
              expiryStr = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
            const isTimeUp = expiryStr ? new Date(expiryStr).getTime() <= new Date().getTime() : false
            const isTimerActive = ["pending", "agent_confirmed", "payment_pending"].includes(order.status) && expiryStr

            return (
              <Card key={order.id} className="border-l-4" style={{ borderLeftColor: brandColor }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{order.order_number}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {order.status === "agent_confirmed" ? "Accepted" : order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Customer: <span className="font-medium">{order.user_profile?.full_name}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.products?.name || order.services?.name} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {isTimerActive && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time remaining:</p>
                        <CountdownTimer expiresAt={expiryStr} />
                      </div>
                    )}

                    {order.status === "pending" && <AcceptOrderButton orderId={order.id} />}

                    {["paid", "processing", "completed", "in_progress"].includes(order.status) && (
                      <>
                        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} role="client" />
                        <TrackingUpdater orderId={order.id} currentTracking={order.form_data?.tracking} />
                      </>
                    )}

                    {order.status === "agent_confirmed" && isTimeUp && (
                      <div className="grid grid-cols-2 gap-2">
                        <ExtendDeadlineButton orderId={order.id} />
                        <RejectOrderDialog orderId={order.id} />
                      </div>
                    )}

                    {order.status !== "pending" && order.status !== "cancelled" && (
                      <AgentMessageButton enabled={!!order.form_data?.messaging_enabled} />
                    )}

                    {order.form_data?.payment_proof_url && order.status === "paid" && (
                      <div className="space-y-2">
                        <a href={order.form_data.payment_proof_url} target="_blank" rel="noreferrer" className="text-xs underline font-medium" style={{ color: brandColor }}>
                          View Payment Proof ↗
                        </a>
                        <VerifyPaymentButton orderId={order.id} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
