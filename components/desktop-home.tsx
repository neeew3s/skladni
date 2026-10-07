"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { EngineeringSection } from "@/components/engineering-section"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EditableText } from "@/components/ui/editable-text"
import { useProducts } from "@/lib/products-context"
import { useConsultations } from "@/lib/consultations-context"

export function DesktopHome() {
  const { products } = useProducts()
  const { openConsultation } = useConsultations()

  const [isSpecsOpen, setIsSpecsOpen] = useState(false)

  const specFiles = products
    .filter((p) => p.specificationFile)
    .map((p) => ({
      title: p.title,
      file: p.specificationFile as string,
    }))

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <div id="engineering">
        <EngineeringSection />
      </div>
      <div id="products">
        <ProductGrid />
      </div>

      <section id="specs" className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-8 tracking-tight uppercase">
            <EditableText id="home-specs-title" defaultText="ГОТОВЫ К УКРЕПЛЕНИЮ?" />
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            <EditableText id="home-specs-desc" defaultText="Проконсультируйтесь с нашими инженерами по безопасности для разработки индивидуального решения защиты, адаптированного к вашим конкретным требованиям." />
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-primary font-bold shadow-xl text-base px-8"
              onClick={openConsultation}
            >
              <EditableText id="home-specs-btn-consult" defaultText="ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 hover:text-white bg-transparent font-bold text-base px-8"
              onClick={() => setIsSpecsOpen(true)}
            >
              <EditableText id="home-specs-btn-download" defaultText="СКАЧАТЬ СПЕЦИФИКАЦИИ" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><EditableText id="specs-dialog-title" defaultText="Спецификации продукции" /></DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {specFiles.length === 0 && (
              <p className="text-sm text-muted-foreground"><EditableText id="specs-dialog-empty" defaultText="Спецификации пока не загружены." /></p>
            )}
            {specFiles.map((spec) => (
              <div
                key={spec.file}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
              >
                <span className="text-sm font-medium">{spec.title}</span>
                <a
                  href={spec.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  <EditableText id="specs-download-link" defaultText="Скачать" />
                </a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
