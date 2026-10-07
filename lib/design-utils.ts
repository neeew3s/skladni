import { TextContent } from "./content-context"

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
  hero: {
    backgroundImage: string
    opacity: number
    fadeWidth: number
    position: {
      x: number
      y: number
    }
  }
}

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
  hero: {
    backgroundImage: "",
    opacity: 0.5,
    fadeWidth: 20,
    position: { x: 50, y: 50 }
  }
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
    hero: {
      backgroundImage: "",
      opacity: 0.5,
      fadeWidth: 20,
      position: { x: 50, y: 50 }
    }
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
    hero: {
      backgroundImage: "",
      opacity: 0.5,
      fadeWidth: 20,
      position: { x: 50, y: 50 }
    }
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
    hero: {
      backgroundImage: "",
      opacity: 0.5,
      fadeWidth: 20,
      position: { x: 50, y: 50 }
    }
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
    hero: {
      backgroundImage: "",
      opacity: 0.5,
      fadeWidth: 20,
      position: { x: 50, y: 50 }
    }
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
    hero: {
      backgroundImage: "",
      opacity: 0.5,
      fadeWidth: 20,
      position: { x: 50, y: 50 }
    }
  },
}

export type BackupType = 'design' | 'content'

export interface BaseBackup {
  id: string
  name: string
  createdAt: string
  type: BackupType
}

export interface DesignBackup extends BaseBackup {
  type: 'design'
  settings: DesignSettings
}

export interface ContentBackup extends BaseBackup {
  type: 'content'
  content: Record<string, TextContent>
}

export type AppBackup = DesignBackup | ContentBackup

// Helper function to generate CSS variables string
export function generateCssVars(settings: DesignSettings): string {
  const { colors, borderRadius, hero } = settings
  
  return `
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
    
    /* Hero Section Settings */
    --hero-image: ${hero?.backgroundImage ? `url(${hero.backgroundImage})` : "none"} !important;
    --hero-opacity: ${hero?.opacity ?? 0.5} !important;
    --hero-fade-width: ${hero?.fadeWidth ?? 20}% !important;
    --hero-pos-x: ${hero?.position?.x ?? 50}% !important;
    --hero-pos-y: ${hero?.position?.y ?? 50}% !important;
  `
}
