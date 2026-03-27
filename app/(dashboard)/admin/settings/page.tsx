import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Settings, Info } from "lucide-react"
import { AdminSettingsForm } from "@/components/admin/settings-form"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  // Fetch current platform settings
  const { data: settings } = await supabase.from("settings").select("*")
  const adminPayoutNumber = settings?.find(s => s.key === "admin_payout_number")?.value || ""

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global platform behavior and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" /> Payment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminSettingsForm initialPayoutNumber={adminPayoutNumber} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" />Admin Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-orange-600"><Info className="h-5 w-5" /> Commission Logic</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <p>The platform is currently configured with a <strong>5% agent commission</strong> on all vendor-listed products.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customer pays 100% of the price via Paystack.</li>
            <li>System automatically calculates 5% and credits it to the Agent's Ledger.</li>
            <li>Agents can view their earnings and request redemption in their dashboard.</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle className="text-base">Developer Notes</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Paystack Webhook:</strong> Ensure <code>{process.env.NEXT_PUBLIC_APP_URL}/api/paystack/webhook</code> is set in your Paystack dashboard.</p>
          <p>• <strong>Service Role:</strong> The backend uses a service role key for commission settlement to bypass RLS.</p>
        </CardContent>
      </Card>
    </div>
  )
}
