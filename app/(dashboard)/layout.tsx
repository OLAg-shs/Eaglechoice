import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Footer } from "@/components/layout/footer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden">
      <Sidebar role={profile.role} profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer className="mt-8 rounded-xl border border-gray-100 dark:border-gray-800" />
        </main>
      </div>
    </div>
  )
}
