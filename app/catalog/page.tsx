"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Download, ShoppingCart, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/lib/products-context"
import { useCart } from "@/lib/cart-context"

type ViewMode = "grid" | "list"
type CategoryFilter = "all" | "Жилой" | "Модульный" | "Бункер"

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const { addToCart } = useCart()
  const { products } = useProducts()

  const filteredProducts = categoryFilter === "all" ? products : products.filter((p) => p.category === categoryFilter)

  const categories: CategoryFilter[] = ["all", "Жилой", "Модульный", "Бункер"]
  const categoryLabels: Record<CategoryFilter, string> = {
    all: "Все",
    Жилой: "Жилой",
    Модульный: "Модульный",
    Бункер: "Бункер",
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">ПОЛНЫЙ КАТАЛОГ</h1>
                <p className="text-muted-foreground text-sm mt-1">{filteredProducts.length} товаров в каталоге</p>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="text-foreground"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="text-foreground"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="border-b border-border bg-card/30"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className={
                  categoryFilter === category
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-[4/3] relative overflow-hidden bg-black/20">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />

                      {/* Animated overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredProduct === product.id ? 1 : 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                      />

                      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                        {product.category}
                      </div>

                      {/* Animated number */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: hoveredProduct === product.id ? 1 : 0.3, x: 0 }}
                        className="absolute bottom-4 left-4 text-6xl font-heading font-bold text-white/20"
                      >
                        0{index + 1}
                      </motion.div>
                    </div>
                  </Link>

                  <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <span className="text-sm font-mono text-primary whitespace-nowrap shrink-0">{product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{product.description}</p>

                    {/* Specs preview */}
                    <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                      {product.specs.slice(0, 2).map((spec, i) => (
                        <div key={i} className="flex justify-between border-b border-border/50 pb-1">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="text-foreground font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />В корзину
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="border-border text-foreground hover:bg-muted bg-transparent"
                      >
                        <a href={product.specificationFile} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <Link href={`/products/${product.slug}`} className="md:w-1/3">
                      <div className="aspect-[4/3] md:aspect-auto md:h-full relative overflow-hidden bg-black/20">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                          {product.category}
                        </div>

                        {/* Animated number */}
                        <motion.div
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: hoveredProduct === product.id ? 1 : 0.3 }}
                          className="absolute bottom-4 left-4 text-6xl font-heading font-bold text-white/20"
                        >
                          0{index + 1}
                        </motion.div>
                      </div>
                    </Link>

                    <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {product.title}
                            </h3>
                          </Link>
                          <span className="text-base md:text-lg font-mono text-primary whitespace-nowrap shrink-0">{product.price}</span>
                        </div>
                        <p className="text-muted-foreground mb-6">{product.description}</p>

                        {/* Full specs */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                          {product.specs.map((spec, i) => (
                            <div key={i} className="border-l-2 border-primary/30 pl-3">
                              <div className="text-xs text-muted-foreground uppercase">{spec.label}</div>
                              <div className="text-sm text-foreground font-medium">{spec.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          onClick={() => addToCart(product)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />В корзину
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          className="border-border text-foreground hover:bg-muted bg-transparent"
                        >
                          <a href={product.specificationFile} download>
                            <Download className="w-4 h-4 mr-2" />
                            Спецификация
                          </a>
                        </Button>
                        <Button variant="ghost" asChild className="text-foreground hover:text-primary">
                          <Link href={`/products/${product.slug}`}>
                            Подробнее
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-border bg-card/50"
      >
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
            НЕ НАШЛИ ПОДХОДЯЩЕЕ РЕШЕНИЕ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Наши специалисты разработают индивидуальное решение под ваши требования безопасности.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Связаться с нами
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
