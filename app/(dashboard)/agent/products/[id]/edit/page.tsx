"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, UploadCloud, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { updateProduct } from "@/lib/actions/catalog"
import { createClient } from "@/lib/supabase/client"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const id = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [agents, setAgents] = useState<{ id: string; full_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [agentId, setAgentId] = useState("")

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("profiles").select("id, full_name").eq("role", "client").order("full_name"),
    ]).then(([{ data: p }, { data: a }]) => {
      if (p) {
        setProduct(p)
        setIsAvailable(p.is_available ?? true)
        setAgentId(p.client_id || "")
        setPreview(p.images?.[0] || null)
        if (p.specifications && typeof p.specifications === "object") {
          setSpecs(Object.entries(p.specifications).map(([key, value]) => ({ key, value: value as string })))
        }
      }
      setAgents(a || [])
      setLoading(false)
    })
  }, [id])

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    formData.set("id", id)
    formData.set("is_available", String(isAvailable))
    formData.set("agent_id", agentId)
    formData.set("current_image", product?.images?.[0] || "")
    formData.set("specifications", JSON.stringify(
      specs.filter(s => s.key && s.value).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
    ))

    try {
      await updateProduct(formData)
      toast({ title: "Product Updated ✅", description: "Changes saved and live on the catalog." })
      router.push("/agent/products")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  )

  if (!product) return <p className="text-center text-gray-500 py-16">Product not found.</p>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/agent/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update any details below. Changes go live immediately after saving.</p>
      </div>

      <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={product.name} placeholder="e.g. MacBook Pro M3" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Price (GHS)</Label>
                    <Input id="base_price" name="base_price" type="number" step="0.01" min="0" defaultValue={product.price} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock_quantity} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" defaultValue={product.brand || ""} placeholder="e.g. Apple, Dell, HP" />
                </div>

                <div className="space-y-2">
                  <Label>Assign Expert Agent</Label>
                  <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white/50 dark:bg-black/20 px-3 py-2 text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Unassigned (General)</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Specs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Technical Specifications</Label>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs border-dashed"
                      onClick={() => setSpecs([...specs, { key: "", value: "" }])}>
                      + Add Spec
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
                        <Input placeholder="Feature (e.g. RAM)" value={spec.key}
                          onChange={(e) => updateSpec(index, "key", e.target.value)}
                          className="flex-1 h-8 text-xs" />
                        <Input placeholder="Value (e.g. 16GB)" value={spec.value}
                          onChange={(e) => updateSpec(index, "value", e.target.value)}
                          className="flex-1 h-8 text-xs" />
                        <Button type="button" variant="ghost" size="sm"
                          onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">×</Button>
                      </div>
                    ))}
                    {specs.length === 0 && <p className="text-[11px] text-gray-400 italic">No specs yet. Click + Add Spec to add one.</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={product.description || ""} rows={3} placeholder="Product overview..." />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
                  <Label htmlFor="is_available">Available for ordering</Label>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="space-y-2 flex flex-col">
                <Label>Product Image</Label>
                <div className="relative flex-1 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <Input id="image" name="image" type="file" accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400 group-hover:text-amber-500 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-white dark:bg-black/50 shadow-sm flex items-center justify-center mb-3 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-sm">Click to upload new image</p>
                      <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-0">
                      <p className="text-white font-medium flex items-center gap-2 text-sm">
                        <ImageIcon className="h-4 w-4" /> Replace Image
                      </p>
                    </div>
                  )}
                </div>
                {product.images?.[0] && (
                  <p className="text-xs text-gray-400 mt-1">Upload a new image to replace the current one, or leave blank to keep it.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit" disabled={saving} className="gradient-primary text-white border-none min-w-[160px]">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
              <Link href="/agent/products">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
