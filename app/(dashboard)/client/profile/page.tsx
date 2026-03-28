import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Calendar, Shield } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function UserProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (profile?.role !== "user") redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
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
                <Calendar className="h-3 w-3" /> Member Since
              </label>
              <p className="text-sm text-gray-900">{formatDate(profile.created_at)}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3" /> Status
              </label>
              <p className="text-sm font-medium text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-900">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Want to change your password or update your info? Our support team can help you with account-level changes directly.</p>
          <div className="flex gap-3">
             <button className="text-sm font-medium text-blue-600 hover:underline">Request Account Update</button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
