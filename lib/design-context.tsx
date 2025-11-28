"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface DesignColors {
  primary: string
  primaryForeground: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  ring: string
}

export interface DesignSettings {
  colors: DesignColors
  borderRadius: number
}

// Тип сообщения для postMessage
export const DESIGN_MESSAGE_TYPE = "DESIGN_UPDATE"

// Стандартные настройки (текущая тёмная тема)
export const DEFAULT_DESIGN: DesignSettings = {
  colors: {
    primary: "#f97316",
    primaryForeground: "#ffffff",
    background: "#0a0a0a",
    foreground: "#fafafa",
    card: "#171717",
    cardForeground: "#fafafa",
    muted: "#262626",
    mutedForeground: "#a3a3a3",
    accent: "#f97316",
    accentForeground: "#ffffff",
    border: "#262626",
    ring: "#f97316",
  },
  borderRadius: 8,
}

// Пресеты дизайна
export const DESIGN_PRESETS: Record<string, DesignSettings> = {
  default: DEFAULT_DESIGN,
  light: {
    colors: {
      primary: "#f97316",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0a0a0a",
      card: "#f5f5f5",
      cardForeground: "#0a0a0a",
      muted: "#e5e5e5",
      mutedForeground: "#737373",
      accent: "#f97316",
      accentForeground: "#ffffff",
      border: "#e5e5e5",
      ring: "#f97316",
    },
    borderRadius: 8,
  },
  blue: {
    colors: {
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      background: "#0a0a0a",
      foreground: "#fafafa",
      card: "#171717",
      cardForeground: "#fafafa",
      muted: "#262626",
      mutedForeground: "#a3a3a3",
      accent: "#3b82f6",
      accentForeground: "#ffffff",
      border: "#262626",
      ring: "#3b82f6",
    },
    borderRadius: 8,
  },
  green: {
    colors: {
      primary: "#22c55e",
      primaryForeground: "#ffffff",
      background: "#0a0a0a",
      foreground: "#fafafa",
      card: "#171717",
      cardForeground: "#fafafa",
      muted: "#262626",
      mutedForeground: "#a3a3a3",
      accent: "#22c55e",
      accentForeground: "#ffffff",
      border: "#262626",
      ring: "#22c55e",
    },
    borderRadius: 8,
  },
  purple: {
    colors: {
      primary: "#a855f7",
      primaryForeground: "#ffffff",
      background: "#0a0a0a",
      foreground: "#fafafa",
      card: "#171717",
      cardForeground: "#fafafa",
      muted: "#262626",
      mutedForeground: "#a3a3a3",
      accent: "#a855f7",
      accentForeground: "#ffffff",
      border: "#262626",
      ring: "#a855f7",
    },
    borderRadius: 8,
  },
  lightBlue: {
    colors: {
      primary: "#0ea5e9",
      primaryForeground: "#ffffff",
      background: "#f8fafc",
      foreground: "#0f172a",
      card: "#ffffff",
      cardForeground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      accent: "#0ea5e9",
      accentForeground: "#ffffff",
      border: "#e2e8f0",
      ring: "#0ea5e9",
    },
    borderRadius: 12,
  },
}

export interface DesignBackup {
  id: string
  name: string
  settings: DesignSettings
  createdAt: string
}

interface DesignContextType {
  settings: DesignSettings
  backups: DesignBackup[]
  applySettings: (settings: DesignSettings) => void
  resetToDefault: () => void
  createBackup: (name: string) => void
  restoreBackup: (id: string) => void
  deleteBackup: (id: string) => void
}

const DesignContext = createContext<DesignContextType | undefined>(undefined)

const DESIGN_STORAGE_KEY = "security1_design"
const BACKUPS_STORAGE_KEY = "security1_design_backups"

// Применить CSS переменные к документу
function applyDesignToDocument(settings: DesignSettings) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const { colors, borderRadius } = settings

  // Применяем к :root с важным приоритетом через inline style
  const cssVars = `
    --primary: ${colors.primary} !important;
    --primary-foreground: ${colors.primaryForeground} !important;
    --background: ${colors.background} !important;
    --foreground: ${colors.foreground} !important;
    --card: ${colors.card} !important;
    --card-foreground: ${colors.cardForeground} !important;
    --muted: ${colors.muted} !important;
    --muted-foreground: ${colors.mutedForeground} !important;
    --accent: ${colors.accent} !important;
    --accent-foreground: ${colors.accentForeground} !important;
    --border: ${colors.border} !important;
    --input: ${colors.muted} !important;
    --ring: ${colors.ring} !important;
    --radius: ${borderRadius}px !important;
    --popover: ${colors.card} !important;
    --popover-foreground: ${colors.cardForeground} !important;
    --secondary: ${colors.muted} !important;
    --secondary-foreground: ${colors.foreground} !important;
    --sidebar: ${colors.card} !important;
    --sidebar-foreground: ${colors.foreground} !important;
    --sidebar-primary: ${colors.primary} !important;
    --sidebar-primary-foreground: ${colors.primaryForeground} !important;
    --sidebar-accent: ${colors.accent} !important;
    --sidebar-accent-foreground: ${colors.accentForeground} !important;
    --sidebar-border: ${colors.border} !important;
    --sidebar-ring: ${colors.ring} !important;
  `
  
  // Удаляем старый style элемент если есть
  const existingStyle = document.getElementById("design-vars")
  if (existingStyle) {
    existingStyle.remove()
  }
  
  // Создаём новый style элемент
  const styleEl = document.createElement("style")
  styleEl.id = "design-vars"
  styleEl.textContent = `:root, .dark { ${cssVars} }`
  document.head.appendChild(styleEl)
  
  // Также устанавливаем через style для немедленного применения
  root.style.setProperty("--primary", colors.primary)
  root.style.setProperty("--primary-foreground", colors.primaryForeground)
  root.style.setProperty("--background", colors.background)
  root.style.setProperty("--foreground", colors.foreground)
  root.style.setProperty("--card", colors.card)
  root.style.setProperty("--card-foreground", colors.cardForeground)
  root.style.setProperty("--muted", colors.muted)
  root.style.setProperty("--muted-foreground", colors.mutedForeground)
  root.style.setProperty("--accent", colors.accent)
  root.style.setProperty("--accent-foreground", colors.accentForeground)
  root.style.setProperty("--border", colors.border)
  root.style.setProperty("--ring", colors.ring)
  root.style.setProperty("--radius", `${borderRadius}px`)
}

export function DesignProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DesignSettings>(DEFAULT_DESIGN)
  const [backups, setBackups] = useState<DesignBackup[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Загрузка настроек при монтировании
  useEffect(() => {
    const storedSettings = localStorage.getItem(DESIGN_STORAGE_KEY)
    const storedBackups = localStorage.getItem(BACKUPS_STORAGE_KEY)

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings)
        setSettings(parsed)
        applyDesignToDocument(parsed)
      } catch (e) {
        console.error("Failed to parse design settings:", e)
        applyDesignToDocument(DEFAULT_DESIGN)
      }
    } else {
      applyDesignToDocument(DEFAULT_DESIGN)
    }

    if (storedBackups) {
      try {
        setBackups(JSON.parse(storedBackups))
      } catch (e) {
        console.error("Failed to parse design backups:", e)
      }
    }

    setIsInitialized(true)
  }, [])

  // Слушатель postMessage для превью в iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === DESIGN_MESSAGE_TYPE && event.data?.settings) {
        // Применяем стили только визуально, без сохранения
        applyDesignToDocument(event.data.settings)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Сохранение настроек
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(settings))
    }
  }, [settings, isInitialized])

  // Сохранение бэкапов
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(BACKUPS_STORAGE_KEY, JSON.stringify(backups))
    }
  }, [backups, isInitialized])

  const applySettings = (newSettings: DesignSettings) => {
    setSettings(newSettings)
    applyDesignToDocument(newSettings)
  }

  const resetToDefault = () => {
    setSettings(DEFAULT_DESIGN)
    applyDesignToDocument(DEFAULT_DESIGN)
  }

  const createBackup = (name: string) => {
    const backup: DesignBackup = {
      id: Date.now().toString(),
      name,
      settings: { ...settings },
      createdAt: new Date().toISOString(),
    }
    setBackups((prev) => [backup, ...prev].slice(0, 5)) // Максимум 5 бэкапов
  }

  const restoreBackup = (id: string) => {
    const backup = backups.find((b) => b.id === id)
    if (backup) {
      setSettings(backup.settings)
      applyDesignToDocument(backup.settings)
    }
  }

  const deleteBackup = (id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <DesignContext.Provider
      value={{
        settings,
        backups,
        applySettings,
        resetToDefault,
        createBackup,
        restoreBackup,
        deleteBackup,
      }}
    >
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const context = useContext(DesignContext)
  if (context === undefined) {
    throw new Error("useDesign must be used within a DesignProvider")
  }
  return context
}

