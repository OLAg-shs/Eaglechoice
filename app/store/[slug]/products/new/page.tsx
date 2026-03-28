"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createProduct } from "@/lib/actions/products"
import { getStoreAgents, getStoreBySlug } from "@/lib/actions/stores"

export default function SellerNewProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAvailable, setIsAvailable] = useState(true)
  const [isNegotiationEnabled, setIsNegotiationEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [agents, setAgents] = useState<any[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState("")

  useEffect(() => {
    async function loadData() {
      const { data: store } = await getStoreBySlug(slug)
      if (store) {
        setStoreId(store.id)
        const storeAgents = await getStoreAgents(store.id)
        setAgents(storeAgents)
        // Default to store owner if possible
        const owner = storeAgents.find((a: any) => a.role === "owner")
        if (owner) setSelectedAgent(owner.user_id)
      }
    }
    loadData()
  }, [slug])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.set("is_available", String(isAvailable))
    formData.set("is_negotiation_enabled", String(isNegotiationEnabled))
    if (storeId) formData.set("store_id", storeId)
    formData.set("agent_id", selectedAgent)

    try {
      const result = await createProduct(formData)
      if (result.error) throw new Error(result.error)
      
      toast({ title: "Product Added ✅", description: "Your product is now assigned and live." })
      router.push(`/store/${slug}/products`)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 py-10 px-6">
      <div>
        <Link href={`/store/${slug}/products`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors font-bold uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Add New Product.</h1>
        <p className="text-gray-500 font-medium italic">List your item and assign a handling agent.</p>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Name</Label>
            <Input id="name" name="name" placeholder="e.g. MacBook Pro M3" required className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-lg font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="base_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Price (GHS)</Label>
              <Input id="base_price" name="base_price" type="number" step="0.01" min="0" required className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Stock</Label>
              <Input id="stock" name="stock" type="number" min="0" required defaultValue={1} className="h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-bold" />
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-3">
            <Label htmlFor="agent_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Handling Agent (Inquiries)</Label>
            <div className="relative">
              <select 
                id="agent_id"
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="w-full h-14 rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 px-12 text-sm font-bold appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                required
              >
                <option value="" disabled>Select an agent...</option>
                {agents.map(agent => (
                  <option key={agent.user_id} value={agent.user_id}>
                    {agent.profile?.full_name} ({agent.role === 'owner' ? 'Owner' : 'Agent'})
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium italic ml-1">Buyers will message this person for product inquiries.</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your product highlights..." rows={4} className="rounded-2xl bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 font-medium leading-relaxed" />
          </div>

          <div className="space-y-4 border-2 border-dashed border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] bg-gray-50/30">
            <Label htmlFor="image_files" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Media</Label>
            <Input id="image_files" name="image_files" type="file" accept="image/*" multiple className="cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:px-4 file:h-10 file:font-black file:text-[10px] file:uppercase file:tracking-widest" />
          </div>

          <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <Switch id="is_available" checked={isAvailable} onCheckedChange={setIsAvailable} className="data-[state=checked]:bg-blue-600" />
              <div className="space-y-0.5">
                <Label htmlFor="is_available" className="font-black text-sm text-gray-900 dark:text-white">Public Visibility</Label>
                <p className="text-[10px] text-gray-400 font-medium">Allow customers to see this product in your store.</p>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

            <div className="flex items-center gap-4">
              <Switch id="is_negotiation" checked={isNegotiationEnabled} onCheckedChange={setIsNegotiationEnabled} className="data-[state=checked]:bg-emerald-600" />
              <div className="space-y-0.5">
                <Label htmlFor="is_negotiation" className="font-black text-sm text-gray-900 dark:text-white">Price Negotiation</Label>
                <p className="text-[10px] text-gray-400 font-medium">Allow buyers to &quot;Make an Offer&quot; on this specific item.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving || !selectedAgent} className="flex-1 h-16 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 text-lg transition-all">
              {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Listing...</> : "Launch Product"}
            </Button>
            <Link href={`/store/${slug}/products`}>
              <Button type="button" variant="ghost" className="h-16 px-10 rounded-2xl font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
