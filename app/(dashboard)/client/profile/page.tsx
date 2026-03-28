import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Calendar, Shield, CheckCircle, BadgeDollarSign } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

async function saveAgentSettings(formData: FormData) {
  "use server"
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("profiles").update({
    phone: formData.get("phone") as string,
    paystack_subaccount_code: formData.get("paystack_subaccount_code") as string || null,
    commission_rate: Number(formData.get("commission_rate")) || 15,
  }).eq("id", user.id)

  revalidatePath("/client/profile")
}

export default async function ClientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "client") redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Your business information on Eagle Choice</p>
        </div>
        {profile.is_verified && (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-tight">Verified Agent</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xl">
              {profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.full_name}</h3>
              <p className="text-sm text-gray-500">Exclusive Business Partner</p>
            </div>
          </div>

          <form action={saveAgentSettings} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <p className="text-sm text-gray-900 dark:text-gray-200">{profile.email}</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Input id="phone" name="phone" defaultValue={profile.phone || ""} placeholder="0244000000" className="h-9" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="paystack_subaccount_code" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <BadgeDollarSign className="h-3 w-3" /> Paystack Subaccount Code (for commission)
              </Label>
              <Input id="paystack_subaccount_code" name="paystack_subaccount_code" defaultValue={profile.paystack_subaccount_code || ""} placeholder="ACCT_xxxxxxxxxxxxxxx" className="h-9 font-mono text-sm" />
              <p className="text-xs text-gray-400">Paste your Paystack Subaccount code here. Your commission will be sent here automatically after each payment.</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="commission_rate" className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <BadgeDollarSign className="h-3 w-3" /> Your Commission Rate (%)
              </Label>
              <Input id="commission_rate" name="commission_rate" type="number" min="1" max="50" defaultValue={profile.commission_rate || 15} className="h-9" />
              <p className="text-xs text-gray-400">The % of each order amount you receive. Admin gets the rest.</p>
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <Button type="submit" className="gradient-primary text-white border-none">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">Business Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.is_verified ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Your account is fully verified. Customers can see your verified badge on all your product listings.</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Your account is currently waiting for admin verification. Once verified, a trust badge will appear on your listings to boost your sales.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


