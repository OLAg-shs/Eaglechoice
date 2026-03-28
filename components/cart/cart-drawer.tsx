"use client"

import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-context"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"

export function CartDrawerButton() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Button>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  )
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white dark:bg-[#111] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">Cart</h2>
            {totalItems > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 font-bold">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Browse the catalog and add products</p>
              <Button asChild className="mt-4 gradient-primary text-white border-none" onClick={onClose}>
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                  <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">{formatCurrency(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold w-6 text-center dark:text-white">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-gray-400 hover:text-red-500"
                      onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Subtotal</span>
              <span className="font-black text-xl text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400">You'll select your agent and add notes at checkout</p>
            <Button asChild className="w-full gradient-primary text-white border-none gap-2 h-12 text-base font-bold" onClick={onClose}>
              <Link href="/catalog/cart">
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
