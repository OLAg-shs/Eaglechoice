import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShoppingBag, Briefcase, Mail, Phone, MapPin, ExternalLink, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { revalidatePath } from "next/cache"

async function updateOrderStatus(orderId: string, status: string) {
  "use server"
  const supabase = await createClient()
  await supabase.from("orders").update({ status }).eq("id", orderId)
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      products(name, images, brand, price),
      services(name, category, base_price),
      user_profile:profiles!orders_user_id_fkey(full_name, email, phone),
      client_profile:profiles!orders_client_id_fkey(full_name, email, phone, is_verified)
    `)
    .eq("id", params.id)
    .single()

  if (error || !order) notFound()

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    payment_pending: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const customer = order.user_profile as any
  const agent = order.client_profile as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
            ← Back to orders
          </Link>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
        </div>
        <Badge className={statusColors[order.status]}>{order.status.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Order Content</CardTitle></CardHeader>
            <CardContent>
               <div className="flex gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                    {order.order_type === "product" ? <ShoppingBag className="text-gray-400" /> : <Briefcase className="text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{order.products?.name || order.services?.name}</p>
                    <p className="text-sm text-gray-500">Qty: {order.quantity} · Price: {formatCurrency(order.total_amount)}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {order.form_data?.tracking && (
            <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/30 to-white dark:from-indigo-900/10 dark:to-transparent">
              <CardHeader className="pb-3 border-b border-indigo-50 dark:border-indigo-900/20">
                <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Truck className="h-5 w-5" /> Logistics Tracking (Admin View)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {order.form_data.tracking.eta && (<div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">ETA</p><p className="font-bold">{order.form_data.tracking.eta}</p></div>)}
                  {order.form_data.tracking.location && (<div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /><p className="font-bold">{order.form_data.tracking.location}</p></div></div>)}
                  {order.form_data.tracking.bus_number && (<div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Bus / Vehicle</p><p className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border text-sm inline-block">{order.form_data.tracking.bus_number}</p></div>)}
                </div>
                {order.form_data.tracking.image_url && (
                  <div className="pt-3 border-t border-indigo-50 dark:border-indigo-900/20">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Vehicle/Waybill Picture</p>
                    <a href={order.form_data.tracking.image_url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden max-w-xs border hover:opacity-90 transition-opacity">
                      <img src={order.form_data.tracking.image_url} alt="Vehicle" className="w-full h-auto object-cover max-h-48" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {Object.keys(order.form_data || {}).filter(k => k !== 'tracking').length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Custom Form Data</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(order.form_data).filter(([k]) => k !== 'tracking').map(([k, v]) => (
                  <div key={k}>
                    <p className="text-gray-400 uppercase text-[10px] font-bold">{k.replace(/_/g, " ")}</p>
                    <p className="font-medium">{v as string}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Order Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <form action={async () => { "use server"; await updateOrderStatus(order.id, "payment_pending"); }}>
                <Button variant="outline" size="sm" disabled={order.status === "payment_pending"}>Set Payment Pending</Button>
              </form>
              <form action={async () => { "use server"; await updateOrderStatus(order.id, "in_progress"); }}>
                <Button variant="outline" size="sm" disabled={order.status === "in_progress"}>Mark In Progress</Button>
              </form>
              <form action={async () => { "use server"; await updateOrderStatus(order.id, "completed"); }}>
                <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={order.status === "completed"}>Complete Order</Button>
              </form>
              <form action={async () => { "use server"; await updateOrderStatus(order.id, "cancelled"); }}>
                <Button variant="destructive" size="sm" disabled={order.status === "cancelled"}>Cancel Order</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Customer Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{customer.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{customer.phone || "No phone"}</span></div>
              <p className="font-medium pt-2 border-t">{customer.full_name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Assigned Agent</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-bold">{agent.full_name}</p>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{agent.email}</span></div>
              {agent.is_verified && <Badge className="bg-green-100 text-green-700 border-none">Verified Agent</Badge>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
