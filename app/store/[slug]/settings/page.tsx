import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import StoreSettingsForm from "./settings-form"

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!store || store.owner_id !== user.id) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Store Settings</h1>
        <p className="text-sm text-gray-500">Configure your store's identity and branding</p>
      </div>
      
      <StoreSettingsForm store={store} />
    </div>
  )
}
