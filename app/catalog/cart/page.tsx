"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/cart/cart-context"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { ShoppingBag, Trash2, ChevronRight, Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createOrder } from "@/lib/actions/orders"
import Link from "next/link"

interface Agent {
  id: string
  full_name: string
  email: string
}

export default function CartCheckoutPage() {
  const { items, removeFromCart, updateItemAgent, updateItemNotes, clearCart, totalPrice } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(true)

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(data => { setAgents(data.agents || []); setLoadingAgents(false) })
      .catch(() => setLoadingAgents(false))
  }, [])

  async function handleCheckout() {
    for (const item of items) {
      if (!item.agentId) {
        toast({ variant: "destructive", title: "Select an Agent", description: `Please select an agent for "${item.name}"` })
        return
      }
    }
    setLoading(true)

    try {
      const results = await Promise.all(items.map(item => {
        const fd = new FormData()
        fd.set("order_type", "product")
        fd.set("product_id", item.id)
        fd.set("client_id", item.agentId!)
        fd.set("quantity", String(item.quantity))
        fd.set("notes", item.notes || "")
        return createOrder(fd)
      }))

      const failed = results.find(r => r.error)
      if (failed) throw new Error(failed.error ?? "Order failed. Please try again.")

      clearCart()
      toast({ title: "Orders Placed! 🎉", description: "Your agent(s) will review and confirm your order(s) shortly." })
      // redirect to the first order
      const firstOrderId = results[0]?.data?.id
      router.push(firstOrderId ? `/client/orders/${firstOrderId}` : "/user/orders")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Order Failed", description: err.message })
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
          <ShoppingCart className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400">Add products from the catalog to get started.</p>
        <Button asChild className="gradient-primary text-white border-none">
          <Link href="/catalog">Browse Catalog</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select an agent for each item and add any notes before placing your order.</p>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <Card key={item.id} className="bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800">
            <CardContent className="p-5">
              <div className="flex gap-4 mb-4">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(item.price)} × {item.quantity}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Subtotal: {formatCurrency(item.price * item.quantity)}</p>
                </div>
                <Button variant="ghost" size="icon" className="self-start text-gray-400 hover:text-red-500 shrink-0"
                  onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Agent Selector */}
              <div className="space-y-2 mb-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select Agent <span className="text-red-500">*</span>
                </Label>
                {loadingAgents ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading agents...</div>
                ) : (
                  <select
                    value={item.agentId || ""}
                    onChange={e => {
                      const agent = agents.find(a => a.id === e.target.value)
                      if (agent) updateItemAgent(item.id, agent.id, agent.full_name)
                    }}
                    className="flex h-10 w-full rounded-lg border border-input bg-white dark:bg-black/40 px-3 py-2 text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <option value="">-- Choose an agent to handle this item --</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                    ))}
                  </select>
                )}
                {item.agentId && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">✓ Agent selected: {item.agentName}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes for Agent (optional)</Label>
                <Textarea
                  value={item.notes || ""}
                  onChange={e => updateItemNotes(item.id, e.target.value)}
                  placeholder="Any special instructions, color preferences, delivery info..."
                  rows={2}
                  className="resize-none bg-white/50 dark:bg-black/20"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-transparent border-amber-100 dark:border-amber-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-amber-800 dark:text-amber-400">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-amber-100 dark:border-amber-900/30 flex justify-between font-black text-lg">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-amber-600 dark:text-amber-400">{formatCurrency(totalPrice)}</span>
          </div>
          <p className="text-xs text-gray-400">Payment is collected securely via Paystack after your agent confirms the order.</p>
        </CardContent>
      </Card>

      <Button className="w-full h-14 text-lg font-bold gradient-primary text-white border-none gap-3 shadow-lg shadow-amber-500/20" onClick={handleCheckout} disabled={loading}>
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Placing Orders...</>
        ) : (
          <>Place {items.length > 1 ? `${items.length} Orders` : "Order"} <ChevronRight className="h-5 w-5" /></>
        )}
      </Button>
    </div>
  )
}
