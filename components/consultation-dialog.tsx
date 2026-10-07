"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EditableText } from "@/components/ui/editable-text"
import { useConsultations } from "@/lib/consultations-context"
import { CheckCircle2 } from "lucide-react"

export function ConsultationDialog() {
  const { addConsultation, isConsultationOpen, closeConsultation } = useConsultations()
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

    closeConsultation()
    setIsSuccessOpen(true)
  }

  return (
    <>
      <Dialog
        open={isConsultationOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeConsultation()
            setFullName("")
            setPhone("")
            setCity("")
            setIntent("")
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle><EditableText id="consult-dialog-title" defaultText="Запись на консультацию" /></DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmitConsultation}>
            <div className="space-y-2">
              <Label htmlFor="fullName"><EditableText id="consult-label-name" defaultText="ФИО" /></Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone"><EditableText id="consult-label-phone" defaultText="Номер телефона" /></Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+7(___)-___-__-__"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city"><EditableText id="consult-label-city" defaultText="Город" /></Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intent"><EditableText id="consult-label-intent" defaultText="Цель обращения" /></Label>
              <Textarea
                id="intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Опишите, что вас интересует..."
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <EditableText id="consult-btn-submit" defaultText="Отправить заявку" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md text-center py-10">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl"><EditableText id="consult-success-title" defaultText="Заявка отправлена" /></DialogTitle>
            <p className="text-muted-foreground">
              <EditableText id="consult-success-desc" defaultText="Наш менеджер свяжется с вами в ближайшее время." />
            </p>
            <Button onClick={() => setIsSuccessOpen(false)} className="mt-4">
              <EditableText id="consult-success-btn" defaultText="Закрыть" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
