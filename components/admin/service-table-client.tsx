"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Eye, EyeOff, Trash2, Loader2, Share2 } from "lucide-react"
import { toggleServiceStatus, deleteService } from "@/lib/actions/catalog"
import { useToast } from "@/components/ui/use-toast"
import { ShareButton } from "@/components/share-button"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://eagle-choice.vercel.app"

export function ServiceTableClient({ initialServices }: { initialServices: any[] }) {
  const [baseUrl, setBaseUrl] = useState("")
  
  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const { toast } = useToast()
  const [services, setServices] = useState(initialServices)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleToggleStatus = async (id: string, currentlyActive: boolean) => {
    setLoadingId(id)
    try {
      await toggleServiceStatus(id, currentlyActive)
      setServices(services.map(s => s.id === id ? { ...s, is_available: !currentlyActive } : s))
      toast({
        title: currentlyActive ? "Service Hidden" : "Service Published",
        description: "The service visibility status has been updated.",
      })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    setDeletingId(id)
    try {
      await deleteService(id)
      setServices(services.filter(s => s.id !== id))
      toast({
        title: "Service Deleted",
        description: "The service has been removed from the catalog.",
      })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setDeletingId(null)
    }
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No services yet</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't added any services (like Visa or Ghana Card processing) yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
          <TableRow className="border-gray-200 dark:border-gray-800">
            <TableHead className="w-[100px] text-gray-900 dark:text-gray-300">Thumbnail</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-300">Service Name</TableHead>
            <TableHead className="text-gray-900 dark:text-gray-300">Category</TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-300">Base Price (GHS)</TableHead>
            <TableHead className="text-center text-gray-900 dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right text-gray-900 dark:text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className="border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <TableCell>
                {service.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={service.cover_image_url} alt={service.name} className="h-12 w-12 rounded-md object-cover border border-gray-200 dark:border-gray-700 shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <Briefcase className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{service.name}</TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400 capitalize">{service.category}</TableCell>
              <TableCell className="text-right font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
                {formatCurrency(service.base_price)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={service.is_available ? "border-green-500/50 text-green-600 dark:text-green-400" : "border-gray-400 text-gray-500 dark:text-gray-400"}>
                  {service.is_available ? "Published" : "Hidden"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <ShareButton 
                  url={`${baseUrl}/user/catalog/service/${service.id}`} 
                  title={service.name}
                  variant="ghost"
                  size="icon"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={service.is_available ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"}
                  onClick={() => handleToggleStatus(service.id, service.is_available)}
                  disabled={loadingId === service.id}
                >
                  {loadingId === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (service.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)}
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                >
                  {deletingId === service.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
