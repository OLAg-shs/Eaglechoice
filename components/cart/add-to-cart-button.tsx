"use client"

import { useState } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-context"
import { useToast } from "@/components/ui/use-toast"

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImage?: string
  className?: string
  size?: "default" | "sm" | "lg"
}

export function AddToCartButton({ productId, productName, productPrice, productImage, className, size = "default" }: AddToCartButtonProps) {
  const { addToCart, items } = useCart()
  const { toast } = useToast()
  const [added, setAdded] = useState(false)

  const isInCart = items.some(i => i.id === productId)

  function handleAddToCart() {
    addToCart({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
    })
    setAdded(true)
    toast({
      title: "Added to Cart 🛒",
      description: `${productName} has been added. Don't forget to select an agent at checkout!`,
    })
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <Button
      onClick={handleAddToCart}
      size={size}
      className={`gap-2 ${isInCart
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "gradient-primary text-white border-none"
        } ${className || ""}`}
    >
      {added ? (
        <><Check className="h-4 w-4" /> Added!</>
      ) : isInCart ? (
        <><ShoppingCart className="h-4 w-4" /> In Cart</>
      ) : (
        <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
      )}
    </Button>
  )
}
