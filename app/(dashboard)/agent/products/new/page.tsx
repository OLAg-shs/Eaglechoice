"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from "@/lib/actions/products"

export default function ClientNewProductPage() {
  const router = useRouter()
  const [category, setCategory] = useState<"laptop" | "accessory">("laptop")
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("category", category)
    formData.set("is_available", String(isAvailable))

    const result = await createProduct(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/agent/products")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/agent/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" placeholder="e.g. HP Pavilion 15" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" placeholder="e.g. HP, Dell, Lenovo" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (GH₵)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input id="stock_quantity" name="stock_quantity" type="number" min="0" defaultValue="1" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Product description..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Image URLs (comma-separated)</Label>
          <Input id="images" name="images" placeholder="https://..., https://..." />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
          <Label htmlFor="is_available">Available for ordering</Label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Product"}
          </Button>
          <Link href="/agent/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
