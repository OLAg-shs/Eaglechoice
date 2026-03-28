import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Star, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { RedeemPointsForm } from "@/components/client/redeem-points-form"

export default async function ClientPointsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  const [{ data: ledger }, { data: config }, { data: redemptions }] = await Promise.all([
    supabase.from("points_ledger").select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("point_config").select("*").limit(1).single(),
    supabase.from("redemption_requests").select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(5),
  ])

  const balance = ledger?.[0]?.balance_after ?? 0
  const minRedeem = config?.min_redemption_points ?? 1000
  const conversionRate = config?.conversion_rate ?? 100
  const balanceGHS = (balance / conversionRate).toFixed(2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Points</h1>
        <p className="text-sm text-gray-500 mt-1">Earn points for every completed order</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-200">Points Balance</p>
              <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-purple-200 text-sm">
            ≈ GH₵ {balanceGHS} · {conversionRate} pts = GH₵ 1.00
          </p>
          <p className="text-purple-300 text-xs mt-1">
            Minimum for redemption: {minRedeem.toLocaleString()} pts
          </p>
        </CardContent>
      </Card>

      {/* Redeem */}
      {balance >= minRedeem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Redemption</CardTitle>
          </CardHeader>
          <CardContent>
            <RedeemPointsForm
              currentBalance={balance}
              conversionRate={conversionRate}
              minPoints={minRedeem}
            />
          </CardContent>
        </Card>
      )}

      {/* Redemption History */}
      {(redemptions?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Redemption Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {redemptions?.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{r.points_amount.toLocaleString()} pts → GH₵ {Number(r.ghs_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.created_at)}</p>
                  </div>
                  <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger */}
      <Card>
        <CardHeader><CardTitle className="text-base">Points History</CardTitle></CardHeader>
        <CardContent>
          {!ledger?.length ? (
            <p className="text-center text-sm text-gray-500 py-4">No points activity yet</p>
          ) : (
            <div className="divide-y">
              {ledger.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${entry.type === "earned" ? "bg-green-100" : "bg-red-100"}`}>
                      {entry.type === "earned" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{entry.type}</p>
                      <p className="text-xs text-gray-500">{entry.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${entry.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                      {entry.type === "earned" ? "+" : "-"}{Math.abs(entry.points).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Bal: {entry.balance_after.toLocaleString()}</p>
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
