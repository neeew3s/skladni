"use client"

import { useCart } from "@/lib/cart-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()

  const totalPrice = items.reduce((sum, item) => {
    const price = Number.parseInt(item.price.replace(/[^\d]/g, ""))
    return sum + price * item.quantity
  }, 0)

  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU") + " ₽"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">КОРЗИНА</h1>
          {totalItems > 0 && (
            <span className="text-muted-foreground">
              ({totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"})
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Корзина пуста</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Добавьте товары из нашего каталога, чтобы оформить заказ
            </p>
            <Link href="/#products">
              <Button variant="industrial" size="lg">
                Перейти к продукции
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                      <p className="text-primary font-bold text-xl mt-1">{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-white"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-white"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="ghost" className="text-muted-foreground hover:text-red-500" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить корзину
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 sticky top-28">
                <h2 className="font-heading text-xl font-bold text-white mb-6">Итого</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Товары ({totalItems})</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Доставка</span>
                    <span>Рассчитывается</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-white font-bold text-xl">
                      <span>К оплате</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <Button variant="industrial" className="w-full py-6 text-lg mb-4">
                  Оформить заказ
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Нажимая кнопку, вы соглашаетесь с условиями оферты
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
