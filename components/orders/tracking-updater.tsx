"use client"

import { useState } from "react"
import { Truck, UploadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateOrderTracking } from "@/lib/actions/orders"

export function TrackingUpdater({ orderId, currentTracking }: { orderId: string; currentTracking: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("orderId", orderId)
    if (currentTracking?.image_url) {
      formData.append("current_image_url", currentTracking.image_url)
    }

    const { error, success } = await updateOrderTracking(formData)
    
    setLoading(false)
    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error })
    } else if (success) {
      toast({ title: "Logistics Updated Tracker", description: "The customer has been notified." })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full mt-2 text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800">
          <Truck className="h-4 w-4" />
          Update Logistics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Logistics</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Location (City/Station)</Label>
            <Input name="location" placeholder="e.g. Kumasi VIP Station" defaultValue={currentTracking?.location || ""} />
          </div>
          <div className="space-y-2">
            <Label>Estimated Time of Arrival (ETA)</Label>
            <Input name="eta" placeholder="e.g. 2 Days, or Tomorrow 4pm" defaultValue={currentTracking?.eta || ""} />
          </div>
          <div className="space-y-2">
            <Label>Bus / Vehicle Number</Label>
            <Input name="bus_number" placeholder="e.g. GW 453-21" defaultValue={currentTracking?.bus_number || ""} />
          </div>
          <div className="space-y-2">
            <Label>Vehicle or Waybill Picture</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Input type="file" name="image" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center pointer-events-none">
                <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tap to upload picture</span>
                {currentTracking?.image_url && <span className="text-xs text-green-600 mt-1">Image already attached (upload to replace)</span>}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Truck className="h-4 w-4 mr-2" />}
            Broadcast Logistics to Customer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
