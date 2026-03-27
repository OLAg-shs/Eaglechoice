import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function AdminPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      orders(order_number, order_type),
      profiles!payments_user_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })

  const successfulPayments = payments?.filter(p => p.status === "success") || []
  const totalSuccessful = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const successCount = successfulPayments.length
  
  const productsSold = successfulPayments.filter(p => (p.orders as any)?.order_type === "product").length
  const servicesOffered = successfulPayments.filter(p => (p.orders as any)?.order_type === "service").length

  // Calculate total paid to agents by summing all earned commissions in the points ledger
  const { data: earnedPoints } = await supabase
    .from("points_ledger")
    .select("points")
    .eq("type", "earned")
    
  const totalAgentPoints = earnedPoints?.reduce((sum, p) => sum + p.points, 0) || 0
  const totalPaidToAgents = totalAgentPoints / 100 // 100 points = 1 GHS

  const statusColors: Record<string, string> = {
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    abandoned: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Payments & Payouts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed breakdown of revenue, sales, and agent commissions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{formatCurrency(totalSuccessful)}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{formatCurrency(totalPaidToAgents)}</p>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">Total Paid to Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="font-bold text-blue-600 dark:text-blue-400">P</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{productsSold}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Products Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">S</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{servicesOffered}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Services Offered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {!payments?.length ? (
            <p className="text-center text-sm text-gray-500 py-4">No payments yet</p>
          ) : (
            <div className="divide-y">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{payment.orders?.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {(payment.profiles as any)?.full_name} · Ref: {payment.paystack_reference}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[payment.status] || "bg-gray-100 text-gray-700"}`}>
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
