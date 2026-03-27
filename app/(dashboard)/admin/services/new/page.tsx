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
import { createService } from "@/lib/actions/services"

export default function NewServicePage() {
  const router = useRouter()
  const [category, setCategory] = useState<"ghana_card" | "birth_certificate" | "visa">("ghana_card")
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

    const result = await createService(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/admin/services")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/services" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />Back to Services
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input id="name" name="name" placeholder="e.g. Ghana Card Application" required />
        </div>

        <div className="space-y-2">
          <Label>Service Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ghana_card">Ghana Card Registration</SelectItem>
              <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
              <SelectItem value="visa">Visa Application</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_price">Base Price (GH₵)</Label>
            <Input id="base_price" name="base_price" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processing_time_days">Processing Time (days)</Label>
            <Input id="processing_time_days" name="processing_time_days" type="number" min="1" placeholder="e.g. 14" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Service description..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="required_documents">Required Documents (comma-separated)</Label>
          <Input id="required_documents" name="required_documents" placeholder="e.g. Birth Certificate, Passport Photo" />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} />
          <Label htmlFor="is_available">Available for ordering</Label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add Service"}
          </Button>
          <Link href="/admin/services">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
