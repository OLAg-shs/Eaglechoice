import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Users, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { ToggleClientStatus } from "@/components/admin/toggle-client-status"
import { ToggleClientVerified } from "@/components/admin/toggle-client-verified"
import { DeleteAgentButton } from "@/components/admin/delete-agent-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/login")

  const { data: clients } = await supabase
    .from("profiles")
    .select("*, orders!orders_client_id_fkey(id)")
    .eq("role", "client")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your sales agents</p>
        </div>
        <Link href="/admin/agents/new">
          <Button>Add New Agent</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!clients?.length ? (
          <p className="col-span-3 text-center py-10 text-gray-500">No agents registered yet</p>
        ) : clients.map((client: any) => {
          const initials = client.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
          const orderCount = client.orders?.length ?? 0
          return (
            <Card key={client.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{client.full_name}</p>
                      <Badge variant={client.is_active ? "default" : "secondary"} className="shrink-0">
                        {client.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                    {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                    <p className="mt-2 text-xs text-gray-500">{orderCount} total orders · Joined {formatDate(client.created_at)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1">
                    <ToggleClientStatus clientId={client.id} isActive={client.is_active} />
                  </div>
                  <div className="flex-1">
                    <ToggleClientVerified clientId={client.id} isVerified={client.is_verified || false} />
                  </div>
                </div>
                <DeleteAgentButton agentId={client.id} agentName={client.full_name} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
