import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShoppingBag, Briefcase, Clock, CheckCircle2, XCircle, ChevronLeft, Truck } from "lucide-react"
import Link from "next/link"
import { PayButton } from "@/components/payments/pay-button"
import { ReceiptUploader } from "@/components/payments/receipt-uploader"
import { CountdownTimer } from "@/components/orders/countdown-timer"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      products(name, images, brand),
      services(name, category),
      profiles!orders_client_id_fkey(full_name, phone, is_verified)
    `)
    .eq("id", params.id)
    .single()

  if (error || !order) notFound()
  if (order.user_id !== user.id) redirect("/user/orders")

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    agent_confirmed: "bg-teal-100 text-teal-700",
    in_progress: "bg-blue-100 text-blue-700",
    payment_pending: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const agent = order.profiles as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/user/orders" className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-700"}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          {["pending", "agent_confirmed", "payment_pending"].includes(order.status) && order.form_data?.expires_at && (
            <CountdownTimer expiresAt={order.form_data.expires_at} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  {order.order_type === "product" ? <ShoppingBag className="h-10 w-10 text-gray-300" /> : <Briefcase className="h-10 w-10 text-gray-300" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{order.products?.name || order.services?.name}</h3>
                  <p className="text-sm text-gray-500">{order.products?.brand || order.services?.category}</p>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span>Qty: {order.quantity}</span>
                    <span className="font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.form_data?.tracking && (
            <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/30 to-white dark:from-indigo-900/10 dark:to-transparent">
              <CardHeader className="pb-4 border-b border-indigo-50 dark:border-indigo-900/20">
                <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Truck className="h-5 w-5" /> Live Tracking Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {order.form_data.tracking.eta && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Estimated Arrival</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{order.form_data.tracking.eta}</p>
                    </div>
                  )}
                  {order.form_data.tracking.location && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Current Location</p>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                        <p className="font-bold text-gray-900 dark:text-gray-100">{order.form_data.tracking.location}</p>
                      </div>
                    </div>
                  )}
                  {order.form_data.tracking.bus_number && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Vehicle / Bus Number</p>
                      <p className="font-mono bg-white dark:bg-gray-800 shadow-sm px-2 py-1 rounded inline-block text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">{order.form_data.tracking.bus_number}</p>
                    </div>
                  )}
                </div>
                {order.form_data.tracking.image_url && (
                  <div className="mt-4 pt-4 border-t border-indigo-50 dark:border-indigo-900/20">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Package / Waybill Picture</p>
                    <a href={order.form_data.tracking.image_url} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative group">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium transition-opacity backdrop-blur-sm">Click to Enlarge</span>
                      </div>
                      <img src={order.form_data.tracking.image_url} alt="Vehicle picture" className="w-full h-auto object-cover max-h-64 transition-transform duration-500 group-hover:scale-105" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {Object.keys(order.form_data || {}).filter(k => k !== 'tracking').length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Form Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 text-sm">
                {Object.entries(order.form_data)
                  .filter(([key]) => key !== 'tracking')
                  .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{value as string}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base text-gray-600">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 italic">"{order.notes}"</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                 <span className="text-gray-500">Subtotal</span>
                 <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t text-blue-700">
                 <span>Total</span>
                 <span>{formatCurrency(order.total_amount)}</span>
              </div>
              
              {(order.status === "agent_confirmed" || order.status === "payment_pending") && (
                <div className="pt-4">
                   <PayButton orderId={order.id} amount={Number(order.total_amount)} />
                   <p className="mt-3 text-[10px] text-gray-400 text-center">Secure checkout by Paystack. All major cards &amp; mobile money accepted.</p>
                </div>
              )}
              {order.status === "paid" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg font-bold text-sm">
                     <CheckCircle2 className="h-4 w-4" /> Order is Paid
                  </div>
                  <a href={`/api/receipt/${order.id}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                    🧾 Download Eagle Choice Receipt
                  </a>
                  <ReceiptUploader orderId={order.id} existingProofUrl={order.form_data?.payment_proof_url} />
                </div>
              )}
              {order.status === "pending" && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium text-center">⏳ Order placed! Your agent will review and accept this order shortly.</p>
                </div>
              )}
              {order.status === "cancelled" && order.form_data?.rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 space-y-2 text-center mt-4">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                  <p className="text-sm text-red-800 dark:text-red-400 font-bold">Order Cancelled by Agent</p>
                  <p className="text-xs text-red-700 dark:text-red-300 italic max-w-[250px] mx-auto">"{order.form_data.rejection_reason}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Assigned Agent</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {agent.full_name?.split(" ")[0][0]}
                 </div>
                 <div>
                    <p className="text-sm font-semibold">{agent.full_name}</p>
                    <p className="text-xs text-gray-500">{agent.phone || "No phone listed"}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
