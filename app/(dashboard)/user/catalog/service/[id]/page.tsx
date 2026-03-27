import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { Briefcase, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { PlaceOrderForm } from "@/components/orders/place-order-form"

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: service }, { data: clients }] = await Promise.all([
    supabase.from("services").select("*").eq("id", params.id).eq("is_available", true).single(),
    supabase.from("profiles").select("id, full_name, email").eq("role", "client").eq("is_active", true).order("full_name"),
  ])

  if (!service) notFound()

  const categoryLabels: Record<string, string> = {
    ghana_card: "Ghana Card Registration",
    birth_certificate: "Birth Certificate",
    visa: "Visa Application",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/user/catalog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />Back to Catalog
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">{categoryLabels[service.category] || service.category}</p>
              <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(service.base_price)}</p>
          {service.processing_time_days && (
            <p className="text-sm text-gray-500 mt-1">Processing time: {service.processing_time_days} working days</p>
          )}
          {service.description && (
            <p className="mt-4 text-gray-600">{service.description}</p>
          )}
          {service.required_documents?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Required Documents</h3>
              <ul className="space-y-1">
                {service.required_documents.map((doc: string) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply for Service</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceOrderForm
            type="service"
            itemId={service.id}
            itemPrice={service.base_price}
            clients={clients || []}
            category={service.category}
          />
        </CardContent>
      </Card>
    </div>
  )
}
