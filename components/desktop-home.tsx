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

export function DesktopHome() {
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
            ГОТОВЫ К УКРЕПЛЕНИЮ?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Проконсультируйтесь с нашими инженерами по безопасности для разработки индивидуального решения защиты,
            адаптированного к вашим конкретным требованиям.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-primary font-bold shadow-xl text-base px-8"
              onClick={() => setIsConsultOpen(true)}
            >
              ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 hover:text-white bg-transparent font-bold text-base px-8"
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
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7(___)-___-__-__"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intent">Опишите ваши намерения</Label>
              <Textarea
                id="intent"
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
