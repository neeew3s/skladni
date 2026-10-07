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
import { useProducts } from "@/lib/products-context"
import { useConsultations } from "@/lib/consultations-context"
import { EditableText } from "@/components/ui/editable-text"

export function MobileHome() {
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
      {/* Mobile optimized Hero Section - simplified for performance if needed */}
      <HeroSection />

      {/* Note: In a real mobile-specific file, you might want to hide heavy 3D elements like EngineeringSection 
          or replace them with static images */}
      <div id="mobile-engineering" className="scroll-mt-24">
        <EngineeringSection isMobile={true} />
      </div>

      <div id="mobile-products" className="scroll-mt-24">
        <ProductGrid />
      </div>

      <section id="mobile-specs" className="py-20 bg-primary relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 tracking-tight uppercase">
            <EditableText id="mobile-home-cta-title" defaultText="ГОТОВЫ К УКРЕПЛЕНИЮ?" />
          </h2>
          <p className="text-base text-white/90 mb-10 max-w-xl mx-auto leading-relaxed">
            <EditableText id="mobile-home-cta-desc" defaultText="Проконсультируйтесь с нашими инженерами по безопасности для разработки индивидуального решения защиты." />
          </p>
          <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            <Button
              size="lg"
              className="w-full bg-white hover:bg-gray-100 text-primary font-bold shadow-xl"
              onClick={openConsultation}
            >
              <EditableText id="mobile-home-cta-btn-consult" defaultText="ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-white text-white hover:bg-white/20 bg-transparent font-bold"
              onClick={() => setIsSpecsOpen(true)}
            >
              <EditableText id="mobile-home-cta-btn-specs" defaultText="СКАЧАТЬ СПЕЦИФИКАЦИИ" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><EditableText id="mobile-specs-title" defaultText="Спецификации продукции" /></DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {specFiles.length === 0 && (
              <p className="text-sm text-muted-foreground"><EditableText id="mobile-specs-empty" defaultText="Спецификации пока не загружены." /></p>
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
                  <EditableText id="mobile-specs-download-link" defaultText="Скачать" />
                </a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
