"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save, Trash2, ImageIcon, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { updateProduct, deleteProduct } from "@/lib/actions/products"

export default function ProductEditForm({ product, storeSlug, brandColor }: { product: any, storeSlug: string, brandColor: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set("is_available", String(isAvailable))

    const result = await updateProduct(product.id, formData)
    setSaving(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({ title: "Product Updated ✅", description: "Your changes have been saved." })
      router.push(`/store/${storeSlug}/products`)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return
    setDeleting(true)
    const result = await deleteProduct(product.id)
    setDeleting(false)

    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error })
    } else {
      toast({ title: "Product Deleted", description: "The product has been removed from your store." })
      router.push(`/store/${storeSlug}/products`)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/store/${storeSlug}/products`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete Product
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" defaultValue={product.name} required className="h-11" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Price (GHS) *</Label>
                  <Input id="base_price" name="base_price" type="number" step="0.01" defaultValue={product.price} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" name="stock" type="number" defaultValue={product.stock_quantity} required className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" defaultValue={product.brand || ""} placeholder="e.g. Apple" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" defaultValue={product.category} required className="h-11" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={product.description || ""} rows={5} className="resize-none" />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-4 w-4" style={{ color: brandColor }} />
                  <span className="text-sm font-bold">Status & Visibility</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
                  <Label htmlFor="is_available" className="cursor-pointer">Available for ordering</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1 font-bold text-white border-none h-12 rounded-2xl" style={{ background: brandColor }}>
              {saving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Saving...</> : <><Save className="h-5 w-5 mr-2" />Save Changes</>}
            </Button>
            <Link href={`/store/${storeSlug}/products`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-12 rounded-2xl">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
