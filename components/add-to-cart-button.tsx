"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart, Check } from "lucide-react"

interface AddToCartButtonProps {
  product: {
    id: number
    title: string
    price: string
    image: string
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart()

  const isInCart = items.some((item) => item.id === product.id)

  const handleAddToCart = () => {
    if (!isInCart) {
      addToCart(product)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`w-full text-lg py-6 transition-all duration-300 ${
        isInCart
          ? "bg-zinc-800 hover:bg-zinc-800 border-2 border-primary text-primary"
          : "bg-primary hover:bg-primary/90"
      }`}
      disabled={isInCart}
    >
      {isInCart ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Добавлено в корзину
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Добавить в корзину
        </>
      )}
    </Button>
  )
}
