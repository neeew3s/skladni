"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface Consultation {
  id: number
  fullName: string
  phone: string
  city: string
  intent: string
  createdAt: string
}

interface ConsultationsContextType {
  consultations: Consultation[]
  addConsultation: (data: Omit<Consultation, "id" | "createdAt">) => void
  deleteConsultation: (id: number) => void
  isConsultationOpen: boolean
  openConsultation: () => void
  closeConsultation: () => void
}

const ConsultationsContext = createContext<ConsultationsContextType | undefined>(undefined)

const STORAGE_KEY = "security1_consultations"

export function ConsultationsProvider({ children }: { children: ReactNode }) {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConsultationOpen, setIsConsultationOpen] = useState(false)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Consultation[]
        setConsultations(parsed)
      } catch (e) {
        console.error("Failed to parse stored consultations", e)
      }
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations))
    }
  }, [consultations, isInitialized])

  const addConsultation = (data: Omit<Consultation, "id" | "createdAt">) => {
    setConsultations((prev) => {
      const newId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1
      const newConsultation: Consultation = {
        id: newId,
        createdAt: new Date().toISOString(),
        ...data,
      }
      return [newConsultation, ...prev]
    })
  }

  const deleteConsultation = (id: number) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id))
  }

  const openConsultation = () => setIsConsultationOpen(true)
  const closeConsultation = () => setIsConsultationOpen(false)

  return (
    <ConsultationsContext.Provider 
      value={{ 
        consultations, 
        addConsultation, 
        deleteConsultation,
        isConsultationOpen,
        openConsultation,
        closeConsultation
      }}
    >
      {children}
    </ConsultationsContext.Provider>
  )
}

export function useConsultations() {
  const ctx = useContext(ConsultationsContext)
  if (!ctx) {
    throw new Error("useConsultations must be used within a ConsultationsProvider")
  }
  return ctx
}
