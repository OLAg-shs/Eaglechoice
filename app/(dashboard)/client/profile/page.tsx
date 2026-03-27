import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Calendar, Shield, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

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
          <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
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
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
              <p className="text-sm text-gray-500 capitalize">Exclusive Business Partner</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </label>
              <p className="text-sm text-gray-900">{profile.email}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone
              </label>
              <p className="text-sm text-gray-900">{profile.phone || "Not provided"}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Business Started
              </label>
              <p className="text-sm text-gray-900">{formatDate(profile.created_at)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" /> Account Status
              </label>
              <p className="text-sm font-medium text-green-600">{profile.is_active ? "Active" : "Under Review"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-900">Business Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.is_verified ? (
            <p className="text-sm text-gray-600">Your account is fully verified. Customers can see your verified badge on all your product listings.</p>
          ) : (
            <p className="text-sm text-gray-500 mb-4">Your account is currently waiting for admin verification. Once verified, a trust badge will appear on your listings to boost your sales.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
