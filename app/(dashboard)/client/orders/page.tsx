import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClipboardList, CheckCheck, FileCheck2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { OrderStatusUpdater } from "@/components/orders/order-status-updater"
import { TrackingUpdater } from "@/components/orders/tracking-updater"
import { AcceptOrderButton, VerifyPaymentButton, ExtendDeadlineButton } from "@/components/orders/agent-action-buttons"
import { RejectOrderDialog } from "@/components/orders/reject-order-dialog"
import { CountdownTimer } from "@/components/orders/countdown-timer"
import { AgentMessageButton } from "@/components/orders/messaging-toggle"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  agent_confirmed: "bg-teal-100 text-teal-700",
  in_progress: "bg-blue-100 text-blue-700",
  payment_pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  processing: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
}

export default async function ClientOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      user_profile:profiles!orders_user_id_fkey(full_name, email, phone),
      products(name, price),
      services(name, base_price)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{orders?.length ?? 0} orders</p>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="mb-4 h-16 w-16 text-gray-200" />
          <p className="text-gray-500">No orders assigned to you yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{order.order_number}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {order.user_profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.products?.name || order.services?.name} · {formatDate(order.created_at)}
                    </p>
                    {order.notes && (
                      <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded p-2">{order.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-gray-900">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {/* Logistics & Status Updaters — shown only AFTER payment */}
                  {["paid", "processing", "completed", "in_progress"].includes(order.status) && (
                    <>
                      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} role="client" />
                      <TrackingUpdater orderId={order.id} currentTracking={order.form_data?.tracking} />
                    </>
                  )}
                  {/* Countdown Timer (Negotiation/Payment Phase) */}
                  {["pending", "agent_confirmed", "payment_pending"].includes(order.status) && order.form_data?.expires_at && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Time remaining for customer payment action:</p>
                      <CountdownTimer expiresAt={order.form_data.expires_at} />
                    </div>
                  )}

                  {/* Accept Order — shown when status is pending */}
                  {order.status === "pending" && (
                    <AcceptOrderButton orderId={order.id} />
                  )}

                  {/* Extend/Reject — shown when status is agent_confirmed */}
                  {order.status === "agent_confirmed" && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <ExtendDeadlineButton orderId={order.id} />
                       <RejectOrderDialog orderId={order.id} />
                    </div>
                  )}

                  {/* Messaging Access Visualizer */}
                  {order.status !== "pending" && order.status !== "cancelled" && (
                     <AgentMessageButton enabled={!!order.form_data?.messaging_enabled} />
                  )}

                  {/* Verify Receipt — shown when customer uploaded proof */}
                  {order.form_data?.payment_proof_url && order.status === "paid" && (
                    <div className="space-y-2">
                      <a href={order.form_data.payment_proof_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 underline font-medium">
                        <FileCheck2 className="h-4 w-4" /> View Customer Receipt Proof
                      </a>
                      <VerifyPaymentButton orderId={order.id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
