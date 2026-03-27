import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Briefcase, ArrowLeft, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceOrderForm } from "@/components/orders/place-order-form"
import type { Metadata } from "next"
import { ShareButton } from "@/components/share-button"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eagle-choice.vercel.app"

import { headers } from "next/headers"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const headersList = await headers()
  const domain = headersList.get("host") || "eaglechoice.vercel.app"
  const protocol = domain.includes("localhost") ? "http" : "https"
  const currentUrl = `${protocol}://${domain}`

  const supabase = await createAdminClient()
  const { data: service } = await supabase
    .from("services")
    .select("name, description, base_price, cover_image_url, required_documents")
    .eq("id", id)
    .single()

  if (!service) return { title: "Service - Eagle Choice" }

  const ogImageUrl = new URL(`${currentUrl}/api/og`)
  ogImageUrl.searchParams.set("title", service.name)
  ogImageUrl.searchParams.set("price", `GH₵ ${service.base_price}`)
  ogImageUrl.searchParams.set("type", "service")
  
  if (service.cover_image_url) ogImageUrl.searchParams.set("image", service.cover_image_url)
  
  // Pass top 3 required docs as highlights
  if (service.required_documents && Array.isArray(service.required_documents)) {
    const highlights = service.required_documents.slice(0, 3)
    highlights.forEach((doc: string, i: number) => {
      ogImageUrl.searchParams.set(`s${i+1}`, doc)
    })
  }

  return {
    title: `${service.name} — Eagle Choice`,
    description: service.description || `Professional service available on Eagle Choice starting from GH₵ ${service.base_price}`,
    openGraph: {
      title: service.name,
      description: service.description || `Starting from GH₵ ${service.base_price} — Eagle Choice`,
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: service.name, type: "image/png" }],
      type: "website",
      siteName: "Eagle Choice",
      url: `${currentUrl}/catalog/service/${id}`,
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
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headersList = await headers()
  const domain = headersList.get("host") || "eaglechoice.vercel.app"
  const protocol = domain.includes("localhost") ? "http" : "https"
  const currentUrl = `${protocol}://${domain}`

  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  // DELETED: if (!user) redirect("/login")

  const [{ data: service }, { data: clients }] = await Promise.all([
    adminSupabase.from("services").select("*, agent:profiles!agent_id(id, full_name, is_verified, avatar_url)").eq("id", id).eq("is_available", true).single(),
    adminSupabase.from("profiles").select("id, full_name, email").eq("role", "client").eq("is_active", true).order("full_name"),
  ])

  if (!service) notFound()

  const categoryLabels: Record<string, string> = {
    ghana_card: "Ghana Card Registration",
    birth_certificate: "Birth Certificate",
    visa: "Visa Application",
  }

  const shareUrl = `${currentUrl}/catalog/service/${service.id}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/catalog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Catalog
        </Link>
        <ShareButton url={shareUrl} title={service.name} />
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          {service.cover_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 mb-6 bg-gray-50/50 dark:bg-gray-900/50">
              <img src={service.cover_image_url} alt={service.name} className="w-full h-full object-contain p-4" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">{categoryLabels[service.category] || service.category}</p>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{service.name}</h1>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Starting At</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{formatCurrency(service.base_price)}</p>
            </div>
          </div>

          {service.agent && (
             <div className="flex items-center gap-3 p-4 bg-purple-50/50 dark:bg-purple-500/5 rounded-xl border border-purple-100 dark:border-purple-500/10 mb-6">
               <div className="h-12 w-12 rounded-full bg-white dark:bg-black/50 shadow-sm flex items-center justify-center border border-purple-200 dark:border-purple-500/20">
                 {service.agent.avatar_url ? (
                   <img src={service.agent.avatar_url} alt="Agent" className="h-full w-full rounded-full object-cover" />
                 ) : (
                   <Briefcase className="h-6 w-6 text-purple-500" />
                 )}
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expert Handler</p>
                 <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                   {service.agent.full_name}
                   {service.agent.is_verified && <BadgeCheck className="w-4 h-4 text-purple-500" />}
                 </p>
               </div>
               <div className="ml-auto">
                 <Badge variant="outline" className="text-[10px] border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400">Verified Expert</Badge>
               </div>
             </div>
          )}

          {service.processing_time_days && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Time:</span>
               <span className="text-sm font-bold dark:text-white">{service.processing_time_days} working days</span>
            </div>
          )}

          {service.description && (
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Service Overview</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{service.description}</p>
            </div>
          )}

          {service.required_documents?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-[10px] mb-4">Documentation Needed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.required_documents.map((doc: string) => (
                  <div key={doc} className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50/30 dark:bg-white/5 border border-indigo-100/50 dark:border-white/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium dark:text-white">{doc}</span>
                  </div>
                ))}
              </div>
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
