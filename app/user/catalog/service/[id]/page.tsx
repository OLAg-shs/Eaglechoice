import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Briefcase, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceOrderForm } from "@/components/orders/place-order-form"
import type { Metadata } from "next"
import { ShareButton } from "@/components/share-button"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eagle-choice.vercel.app"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: service } = await supabase
    .from("services")
    .select("name, description, base_price, cover_image_url")
    .eq("id", params.id)
    .single()

  if (!service) return { title: "Service - Eagle Choice" }

  const ogImageUrl = new URL(`${APP_URL}/api/og`)
  ogImageUrl.searchParams.set("title", service.name)
  ogImageUrl.searchParams.set("price", `GH₵ ${service.base_price}`)
  ogImageUrl.searchParams.set("type", "service")
  if (service.cover_image_url) ogImageUrl.searchParams.set("image", service.cover_image_url)

  return {
    title: `${service.name} — Eagle Choice`,
    description: service.description || `Professional service available on Eagle Choice starting from GH₵ ${service.base_price}`,
    openGraph: {
      title: service.name,
      description: service.description || `Starting from GH₵ ${service.base_price} — Eagle Choice`,
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: service.name }],
      type: "website",
      siteName: "Eagle Choice",
    },
    twitter: {
      card: "summary_large_image",
      title: service.name,
      description: service.description || `Starting from GH₵ ${service.base_price}`,
      images: [ogImageUrl.toString()],
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // DELETED: if (!user) redirect("/login")

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

  const shareUrl = `${APP_URL}/user/catalog/service/${service.id}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/user/catalog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Catalog
        </Link>
        <ShareButton url={shareUrl} title={service.name} />
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{categoryLabels[service.category] || service.category}</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(service.base_price)}</p>
          {service.processing_time_days && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Processing time: {service.processing_time_days} working days</p>
          )}
          {service.description && (
            <p className="mt-4 text-gray-600 dark:text-gray-300">{service.description}</p>
          )}
          {service.required_documents?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Required Documents</h3>
              <ul className="space-y-1">
                {service.required_documents.map((doc: string) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Apply for Service</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <PlaceOrderForm
              type="service"
              itemId={service.id}
              itemPrice={service.base_price}
              clients={clients || []}
              category={service.category}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">Interested in this service? Please log in to your account to apply.</p>
              <Button asChild className="gradient-primary">
                <Link href="/login">Log in to Apply</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
