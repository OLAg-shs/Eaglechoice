"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createOrder } from "@/lib/actions/orders"
import { formatCurrency } from "@/lib/utils"

interface Client {
  id: string
  full_name: string
  email: string
}

interface PlaceOrderFormProps {
  type: "product" | "service"
  itemId: string
  itemPrice: number
  clients: Client[]
  category?: string
  preAssignedClientId?: string | null
}

// Service-specific form fields
const SERVICE_FIELDS: Record<string, { key: string; label: string; required?: boolean }[]> = {
  ghana_card: [
    { key: "birth_certificate_no", label: "Birth Certificate Number", required: true },
    { key: "applicant_name", label: "Full Name as on Birth Certificate", required: true },
    { key: "date_of_birth", label: "Date of Birth", required: true },
    { key: "region", label: "Region of Birth" },
  ],
  birth_certificate: [
    { key: "hospital_name", label: "Hospital / Place of Birth", required: true },
    { key: "child_name", label: "Child's Full Name", required: true },
    { key: "parent_name", label: "Parent(s) Name(s)", required: true },
    { key: "date_of_birth", label: "Date of Birth", required: true },
  ],
  visa: [
    { key: "destination_country", label: "Destination Country", required: true },
    { key: "visa_type", label: "Visa Type (Tourist/Business/Student)", required: true },
    { key: "travel_date", label: "Intended Travel Date" },
    { key: "passport_number", label: "Passport Number", required: true },
  ],
}

export function PlaceOrderForm({ type, itemId, itemPrice, clients, category, preAssignedClientId }: PlaceOrderFormProps) {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState(preAssignedClientId || "")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [formFields, setFormFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const serviceFields = category ? SERVICE_FIELDS[category] || [] : []
  const totalPrice = itemPrice * quantity

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient) { setError("Please select an agent"); return }
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("order_type", type)
    formData.set(type === "product" ? "product_id" : "service_id", itemId)
    formData.set("client_id", selectedClient)
    formData.set("quantity", String(quantity))
    formData.set("notes", notes)
    if (serviceFields.length > 0) {
      formData.set("form_data", JSON.stringify(formFields))
    }

    const result = await createOrder(formData)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/client/orders/${result.data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

      {!preAssignedClientId && (
        <div className="space-y-2">
          <Label>Select Agent</Label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an agent to handle your order" />
            </SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <SelectItem value="none" disabled>No agents available</SelectItem>
              ) : (
                clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "product" && (
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      )}

      {serviceFields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label>
            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={formFields[field.key] || ""}
            onChange={(e) => setFormFields(prev => ({ ...prev, [field.key]: e.target.value }))}
            required={field.required}
          />
        </div>
      ))}

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional information for the agent..."
          rows={3}
        />
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex justify-between">
          <span className="font-medium text-gray-900">Total</span>
          <span className="text-xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Payment will be requested after the agent reviews your order</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading || clients.length === 0}>
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order...</> : "Place Order"}
      </Button>
    </form>
  )
}
