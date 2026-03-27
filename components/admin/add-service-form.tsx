"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react"
import { createService } from "@/lib/actions/catalog"

export function AddServiceForm({ agents }: { agents: { id: string; full_name: string }[] }) {
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await createService(formData)
      toast({
        title: "Service Created",
        description: "The service offering was beautifully added to the catalog and the thumbnail was secured.",
      })
      const form = document.getElementById('add-service-form') as HTMLFormElement
      form.reset()
      setPreview(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="glass-card mt-6">
      <CardContent className="p-6">
        <form id="add-service-form" action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Ghana Card Processing" required className="bg-white/50 dark:bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="e.g. Identity, Visa, Digital" defaultValue="service" required className="bg-white/50 dark:bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_price">Starting Price (GHS)</Label>
                  <Input id="base_price" name="base_price" type="number" step="0.01" min="0" placeholder="150" required className="bg-white/50 dark:bg-black/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent_id">Assign Expert Agent (Optional)</Label>
                <select 
                  id="agent_id" 
                  name="agent_id" 
                  className="flex h-10 w-full rounded-md border border-input bg-white/50 dark:bg-black/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
                >
                  <option value="" className="text-gray-900">Unassigned (General)</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id} className="text-gray-900">{agent.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description</Label>
                <Textarea id="description" name="description" placeholder="Requirements, processing time, and additional details..." className="h-24 bg-white/50 dark:bg-black/20" />
              </div>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label>Service Thumbnail (Optional)</Label>
              <div className="relative flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-white dark:bg-black/50 shadow-sm flex items-center justify-center mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">Upload service banner</p>
                    <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                
                {preview && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Change Cover
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="submit" disabled={pending} className="gradient-primary text-white border-none min-w-[150px]">
              {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Publish Service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
