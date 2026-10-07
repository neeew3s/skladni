"use client"

import type React from "react"
import { useState } from "react"

import Link from "next/link"
import { Shield, Menu, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { EditableText } from "@/components/ui/editable-text"

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

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setIsMenuOpen(false)
    
    // Wait for the sheet closing animation to finish
    setTimeout(() => {
      const element = document.querySelector(id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }, 500)
  }

  const hasItems = totalItems > 0

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center px-4 md:px-6 relative">
        {/* Logo - Left aligned */}
        <div className="flex-1 flex justify-start">
          <Link href="/" onClick={handleScrollToTop} className="flex items-center gap-2 cursor-pointer">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-heading text-2xl font-bold tracking-tighter text-white"><EditableText id="nav-brand" defaultText="КРЕПОСТЬ" /></span>
          </Link>
        </div>

        {/* Navigation - Centered absolutely */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link
            href="#products"
            onClick={(e) => handleScroll(e, "#products")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            <EditableText id="nav-link-products" defaultText="ПРОДУКЦИЯ" />
          </Link>
          <Link
            href="#engineering"
            onClick={(e) => handleScroll(e, "#engineering")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            <EditableText id="nav-link-engineering" defaultText="ИНЖЕНЕРИЯ" />
          </Link>
          <Link
            href="#specs"
            onClick={(e) => handleScroll(e, "#specs")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            <EditableText id="nav-link-specs" defaultText="ХАРАКТЕРИСТИКИ" />
          </Link>
        </nav>

        {/* Cart & Menu - Right aligned */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <Link href="/cart">
            <Button
              variant="ghost"
              className={`relative flex items-center gap-2 transition-all duration-300 ${hasItems ? "text-primary" : "text-white"}`}
            >
              <span className="hidden sm:inline text-sm font-medium uppercase tracking-widest"><EditableText id="nav-cart" defaultText="Корзина" /></span>
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
            <SheetTitle className="text-white"><EditableText id="nav-menu-title" defaultText="Меню" /></SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center pt-6 pb-8">
            <nav className="flex flex-col items-center gap-4 text-center">
              <Link
                href="#products"
                onClick={(e) => handleMobileNavClick(e, "#mobile-products")}
                className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
              >
                <EditableText id="nav-link-products" defaultText="ПРОДУКЦИЯ" />
              </Link>
              <Link
                href="#engineering"
                onClick={(e) => handleMobileNavClick(e, "#mobile-engineering")}
                className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
              >
                <EditableText id="nav-link-engineering" defaultText="ИНЖЕНЕРИЯ" />
              </Link>
              <Link
                href="#specs"
                onClick={(e) => handleMobileNavClick(e, "#mobile-specs")}
                className="text-lg font-medium text-muted-foreground hover:text-primary uppercase tracking-widest"
              >
                <EditableText id="nav-link-specs" defaultText="ХАРАКТЕРИСТИКИ" />
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

