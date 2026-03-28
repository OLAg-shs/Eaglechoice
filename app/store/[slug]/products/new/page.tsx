"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/actions/products"

export default function SellerNewProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  const [isAvailable, setIsAvailable] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set("is_available", String(isAvailable))
    formData.set("store_slug", slug)

    try {
      await createProduct(formData)
      toast({ title: "Product Added ✅", description: "Your product is now live in your store." })
      router.push(`/store/${slug}/products`)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/store/${slug}/products`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" name="name" placeholder="e.g. iPhone 15 Pro Max" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Price (GHS) *</Label>
              <Input id="base_price" name="base_price" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input id="stock" name="stock" type="number" min="0" required defaultValue={1} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" placeholder="e.g. Apple, Samsung" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your product..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Online Image URL (optional)</Label>
            <Input id="images" name="images" placeholder="https://..." />
          </div>

          <div className="space-y-2 border-2 border-dashed border-gray-200 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
            <Label htmlFor="image_files" className="font-semibold text-gray-700 dark:text-gray-300">Upload from your PC</Label>
            <Input id="image_files" name="image_files" type="file" accept="image/*" multiple
              className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <p className="text-xs text-gray-500">You can select multiple images.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label htmlFor="is_available">Available for ordering</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="gradient-primary text-white border-none min-w-[140px]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Product"}
            </Button>
            <Link href={`/store/${slug}/products`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
