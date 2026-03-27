import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddServiceForm } from "@/components/admin/add-service-form"
import { ServiceTableClient } from "@/components/admin/service-table-client"
import { Briefcase } from "lucide-react"

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")
  
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white transition-colors">
          <Briefcase className="h-6 w-6 text-indigo-500" />
          Service Portfolio
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Ghana Card, Birth Certificate, and Visa application services along with their cover images.</p>
      </div>

      <AddServiceForm agents={agents || []} />
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Active Services</h2>
        <ServiceTableClient initialServices={services || []} />
      </div>
    </div>
  )
}
