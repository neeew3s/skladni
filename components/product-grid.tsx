"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { EditableText } from "@/components/ui/editable-text"
import { useProducts } from "@/lib/products-context"

export function ProductGrid() {
  const { homepageProducts } = useProducts()

  return (
    <section id="products" className="py-24 bg-[#161616]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2"><EditableText id="prod-grid-title" defaultText="ЛИНЕЙКА ПРОДУКЦИИ" /></h2>
            <p className="text-muted-foreground"><EditableText id="prod-grid-desc" defaultText="Оборонные решения для любого уровня угроз." /></p>
          </div>
          {/* Desktop: кнопка остается справа от заголовка */}
          <Button variant="link" className="hidden md:inline-flex text-primary mt-4 md:mt-0" asChild>
            <Link href="/catalog">
              <EditableText id="prod-grid-link-catalog" defaultText="Полный Каталог" /> <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mobile: кнопка справа над первой карточкой */}
          <Button
            variant="link"
            className="md:hidden text-primary absolute -top-[34px] right-0"
            asChild
          >
            <Link href="/catalog">
              <EditableText id="prod-grid-link-catalog" defaultText="Полный Каталог" /> <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          {homepageProducts.map((product) => (
            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              className="group relative bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-black/20">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                  {product.category}
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <span className="text-sm font-mono text-accent whitespace-nowrap shrink-0">{product.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{product.description}</p>
                <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10">
                  <EditableText id="prod-grid-btn-config" defaultText="Конфигурация" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
