"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useProducts, Product } from "@/lib/products-context"
import { Product3DViewer } from "@/components/product-3d-viewer"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Check, Download, Loader2 } from "lucide-react"

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const { getProductBySlug } = useProducts()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)

  useEffect(() => {
    const foundProduct = getProductBySlug(slug)
    setProduct(foundProduct || null)
  }, [slug, getProductBySlug])

  // Загрузка
  if (product === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Товар не найден
  if (product === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Товар не найден</h1>
        <p className="text-muted-foreground mb-6">Запрашиваемый товар не существует или был удалён.</p>
        <Button asChild>
          <Link href="/catalog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться в каталог
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/catalog" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Назад к каталогу</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold text-white">КРЕПОСТЬ</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Product Info (was right) */}
          <div className="space-y-8">
            {/* Title & Price */}
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{product.title}</h1>
              <div className="text-3xl font-mono text-primary font-bold">{product.price}</div>
            </div>

            {/* Short Description */}
            <p className="text-lg text-muted-foreground">{product.description}</p>

            {/* Add to Cart */}
            <AddToCartButton product={product} />

            {/* Full Description */}
            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-bold text-white mb-4">Описание</h3>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{product.fullDescription}</div>
            </div>

            {/* Specifications */}
            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-bold text-white mb-4">Характеристики</h3>
              <div className="space-y-3">
                {product.specs.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="bg-card border border-border p-6">
                <h3 className="text-lg font-bold text-white mb-4">Преимущества</h3>
                <ul className="space-y-3">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact CTA */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 py-6 border-white/20 hover:bg-white/5 bg-transparent">
                Запросить консультацию
              </Button>
              {product.specificationFile && (
                <Button variant="outline" className="flex-1 py-6 border-white/20 hover:bg-white/5 bg-transparent" asChild>
                  <a href={product.specificationFile} download={`${product.slug}-specification.pdf`}>
                    <Download className="w-4 h-4 mr-2" />
                    Скачать спецификацию
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Images & 3D (was left) */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden border border-border">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
                {product.category}
              </div>
            </div>

            {/* 3D Model Viewer with full controls */}
            {product.has3DModel && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-primary" />
                  3D Модель
                </h3>
                <Product3DViewer productSlug={product.slug} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
