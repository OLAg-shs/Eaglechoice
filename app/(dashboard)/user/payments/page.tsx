import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InitiatePaymentButton } from "@/components/payments/initiate-payment-button"

export default async function UserPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "user") redirect("/login")

  const { data: payments } = await supabase
    .from("payments")
    .select("*, orders(order_number, order_type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get orders pending payment
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*, products(name), services(name)")
    .eq("user_id", user.id)
    .eq("status", "payment_pending")

  const statusColors: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    abandoned: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Your payment history</p>
      </div>

      {/* Pending Payments */}
      {(pendingOrders?.length ?? 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-800">⚡ Payment Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                <div>
                  <p className="font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{order.products?.name || order.services?.name}</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(order.total_amount)}</p>
                </div>
                <InitiatePaymentButton
                  orderId={order.id}
                  amount={order.total_amount}
                  email={user.email || ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          {!payments?.length ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CreditCard className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{payment.orders?.order_number}</p>
                    <p className="text-xs text-gray-500">Ref: {payment.paystack_reference}</p>
                    <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[payment.status] || ""}`}>
                      {payment.status}
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
