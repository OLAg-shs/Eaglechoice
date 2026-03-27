import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Star, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { AdminRedemptionActions } from "@/components/admin/redemption-actions"

export default async function AdminPointsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  const [{ data: config }, { data: redemptions }] = await Promise.all([
    supabase.from("point_config").select("*").single(),
    supabase.from("redemption_requests")
      .select("*, profiles!redemption_requests_client_id_fkey(full_name, email)")
      .order("created_at", { ascending: false }),
  ])

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    paid: "bg-blue-100 text-blue-700",
  }

  const pendingCount = redemptions?.filter(r => r.status === "pending").length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Points Management</h1>
        <p className="text-sm text-gray-500 mt-1">{pendingCount} pending redemption requests</p>
      </div>

      {/* Config */}
      {config && (
        <Card>
          <CardHeader><CardTitle className="text-base">Points Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Earn Rate</p>
                <p className="text-xl font-bold text-gray-900">{config.percentage_rate}%</p>
                <p className="text-xs text-gray-400">of order value</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion</p>
                <p className="text-xl font-bold text-gray-900">{config.conversion_rate} pts</p>
                <p className="text-xs text-gray-400">= GH₵ 1.00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Min Redemption</p>
                <p className="text-xl font-bold text-gray-900">{config.min_redemption_points.toLocaleString()}</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Redemption Requests */}
      <Card>
        <CardHeader><CardTitle className="text-base">Redemption Requests</CardTitle></CardHeader>
        <CardContent>
          {!redemptions?.length ? (
            <p className="text-center text-sm text-gray-500 py-4">No redemption requests</p>
          ) : (
            <div className="divide-y">
              {redemptions.map((req: any) => (
                <div key={req.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{(req.profiles as any)?.full_name}</p>
                        <span className={`text-xs rounded-full px-2 py-0.5 ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {req.points_amount.toLocaleString()} pts → GH₵ {Number(req.ghs_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        via {req.payout_method?.replace(/_/g, " ")} · {formatDate(req.created_at)}
                      </p>
                    </div>
                    {req.status === "pending" && (
                      <AdminRedemptionActions requestId={req.id} />
                    )}
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
