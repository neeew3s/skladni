"use client"

import type React from "react"
import { useState } from "react"

import Link from "next/link"
import { Shield, Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"

export function Navbar() {
  const { totalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToId = (id: string) => {
    const element = document.querySelector(id)
    if (element) {
      const navbarHeight = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - navbarHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollToId(id)
  }

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const hasItems = totalItems > 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" onClick={handleScrollToTop} className="flex items-center gap-2 cursor-pointer">
          <Shield className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold tracking-tighter text-white">КРЕПОСТЬ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#products"
            onClick={(e) => handleScroll(e, "#products")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            ПРОДУКЦИЯ
          </Link>
          <Link
            href="#engineering"
            onClick={(e) => handleScroll(e, "#engineering")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            ИНЖЕНЕРИЯ
          </Link>
          <Link
            href="#specs"
            onClick={(e) => handleScroll(e, "#specs")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            ХАРАКТЕРИСТИКИ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button
              variant="ghost"
              className={`relative flex items-center gap-2 transition-all duration-300 ${hasItems ? "text-primary" : "text-white"}`}
            >
              <span className="hidden sm:inline text-sm font-medium uppercase tracking-widest">Корзина</span>
              <ShoppingCart className={`size-5 ${hasItems ? "drop-shadow-primary" : ""}`} />
              {hasItems && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center animate-pulse">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="bg-background border-l border-white/10 w-64 sm:w-80 flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-white">Меню</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center pt-6 pb-8">
            <nav className="flex flex-col items-center gap-4 text-center">
              <SheetClose asChild>
                <Link
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault()
                    setTimeout(() => scrollToId("#products"), 80)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
                >
                  ПРОДУКЦИЯ
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="#engineering"
                  onClick={(e) => {
                    e.preventDefault()
                    setTimeout(() => scrollToId("#engineering"), 80)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
                >
                  ИНЖЕНЕРИЯ
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="#specs"
                  onClick={(e) => {
                    e.preventDefault()
                    setTimeout(() => scrollToId("#specs"), 80)
                  }}
                  className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
                >
                  ХАРАКТЕРИСТИКИ
                </Link>
              </SheetClose>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

