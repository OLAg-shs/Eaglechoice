"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react"
import { createProduct } from "@/lib/actions/catalog"

export function AddProductForm({ agents }: { agents: { id: string; full_name: string }[] }) {
  const { toast } = useToast()
  const [pending, setPending] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([])

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

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
      await createProduct(formData)
      toast({
        variant: "success",
        title: "Product Created",
        description: "The product was successfully added to the catalog and the image was secured.",
      })
      // Reset form
      const form = document.getElementById('add-product-form') as HTMLFormElement
      form.reset()
      setPreview(null)
      setSpecs([])
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
    <>
      {pending && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-amber-500 animate-spin shadow-[0_0_30px_rgba(245,158,11,0.3)]"></div>
            <div className="absolute inset-0 flex items-center justify-center text-amber-500 font-bold text-xl">
              E
            </div>
          </div>
          <div className="mt-8 text-center space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Branding your product...</h3>
            <p className="text-gray-400 text-sm animate-pulse">Securing catalog data and optimizing images</p>
          </div>
        </div>
      )}
      <Card className="mt-6 bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors ring-1 ring-black/5 dark:ring-white/5">
      <CardContent className="p-6">
        <form id="add-product-form" action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" placeholder="e.g. MacBook Pro M3" required className="bg-white/50 dark:bg-black/20" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Price (GHS)</Label>
                  <Input id="base_price" name="base_price" type="number" step="0.01" min="0" placeholder="15000" required className="bg-white/50 dark:bg-black/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Available Stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="10" required className="bg-white/50 dark:bg-black/20" />
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

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Technical Specifications (Optional)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSpecs([...specs, { key: "", value: "" }])}
                    className="h-7 px-2 text-xs border-dashed"
                  >
                    + Add Spec
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                      <Input 
                        placeholder="Feature (e.g. RAM)" 
                        value={spec.key} 
                        onChange={(e) => updateSpec(index, 'key', e.target.value)}
                        className="flex-1 h-8 text-xs bg-white/50 dark:bg-black/20"
                      />
                      <Input 
                        placeholder="Value (e.g. 16GB)" 
                        value={spec.value} 
                        onChange={(e) => updateSpec(index, 'value', e.target.value)}
                        className="flex-1 h-8 text-xs bg-white/50 dark:bg-black/20"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {specs.length === 0 && (
                    <p className="text-[10px] text-gray-500 italic">No specific specs added yet</p>
                  )}
                </div>
                <Input type="hidden" name="specifications" value={JSON.stringify(
                  specs.filter(s => s.key && s.value).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
                )} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Product details and high-level overview..." className="h-24 bg-white/50 dark:bg-black/20" />
              </div>
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <Label>Product Image (Optional)</Label>
              <div className="relative flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
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
                    <p className="font-medium text-sm">Click or drag image here</p>
                    <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                
                {preview && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Change Image
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="submit" disabled={pending} className="gradient-primary text-white border-none min-w-[150px]">
              {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Add Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  )
}
