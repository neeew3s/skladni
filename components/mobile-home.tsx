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

export function MobileHome() {
  const { products } = useProducts()
  const { addConsultation } = useConsultations()

  const [isSpecsOpen, setIsSpecsOpen] = useState(false)
  const [isConsultOpen, setIsConsultOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [intent, setIntent] = useState("")

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    const withoutCountry = digits.replace(/^7|^8/, "")
    const limited = withoutCountry.slice(0, 10)

    if (!limited.length) {
      return ""
    }

    const part1 = limited.slice(0, 3)
    const part2 = limited.slice(3, 6)
    const part3 = limited.slice(6, 8)
    const part4 = limited.slice(8, 10)

    let result = "+7"
    if (part1) {
      result += `(${part1}`
      if (part1.length === 3) {
        result += ")"
      }
    }
    if (part2) {
      result += (part1 && part1.length === 3 ? "-" : "") + part2
    }
    if (part3) {
      result += (part2 ? "-" : "") + part3
    }
    if (part4) {
      result += (part3 ? "-" : "") + part4
    }

    return result
  }

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim() || !city.trim() || !intent.trim()) return

    addConsultation({
      fullName: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      intent: intent.trim(),
    })

    setFullName("")
    setPhone("")
    setCity("")
    setIntent("")

    setIsConsultOpen(false)
    setIsSuccessOpen(true)
  }

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
      <div id="engineering">
        <EngineeringSection isMobile={true} />
      </div>

      <div id="products">
        <ProductGrid />
      </div>

      <section id="specs" className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 tracking-tight uppercase">
            ГОТОВЫ К УКРЕПЛЕНИЮ?
          </h2>
          <p className="text-base text-white/90 mb-10 max-w-xl mx-auto leading-relaxed">
            Проконсультируйтесь с нашими инженерами по безопасности для разработки индивидуального решения защиты.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            <Button
              size="lg"
              className="w-full bg-white hover:bg-gray-100 text-primary font-bold shadow-xl"
              onClick={() => setIsConsultOpen(true)}
            >
              ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-white text-white hover:bg-white/20 bg-transparent font-bold"
              onClick={() => setIsSpecsOpen(true)}
            >
              СКАЧАТЬ СПЕЦИФИКАЦИИ
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <Dialog open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Спецификации продукции</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {specFiles.length === 0 && (
              <p className="text-sm text-muted-foreground">Спецификации пока не загружены.</p>
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
                  Скачать
                </a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConsultOpen}
        onOpenChange={(open) => {
          setIsConsultOpen(open)
          if (!open) {
            setFullName("")
            setPhone("")
            setCity("")
            setIntent("")
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Запись на консультацию</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitConsultation}>
            <div className="space-y-2">
              <Label htmlFor="fullName-mobile">ФИО</Label>
              <Input
                id="fullName-mobile"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-mobile">Номер телефона</Label>
              <Input
                id="phone-mobile"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7(___)-___-__-__"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-mobile">Город</Label>
              <Input
                id="city-mobile"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intent-mobile">Опишите ваши намерения</Label>
              <Textarea
                id="intent-mobile"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsConsultOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Отправить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Запись прошла успешно!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Наши сотрудники свяжутся с Вами по указанному номеру телефона в ближайшее время. Ожидайте...
          </p>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsSuccessOpen(false)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
