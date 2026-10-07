"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { FileUpload } from "@/components/file-upload"
import { 
  X, 
  Check, 
  RotateCcw, 
  Save, 
  History,
  Palette,
  Sun,
  Moon,
  Trash2,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  DesignSettings, 
  DesignBackup,
  AppBackup,
  ContentBackup,
  DEFAULT_DESIGN,
  DESIGN_PRESETS,
  DESIGN_MESSAGE_TYPE
} from "@/lib/design-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import { TextContent } from "@/lib/content-context"

interface DesignEditorProps {
  initialSettings: DesignSettings
  backups: AppBackup[]
  onApply: (
    settings: DesignSettings, 
    createBackup: boolean, 
    backupName?: string, 
    content?: Record<string, TextContent>, 
    backupType?: 'design' | 'content',
    previousSettings?: DesignSettings,
    previousContent?: Record<string, TextContent>
  ) => void
  onCancel: () => void
  onRestoreBackup: (id: string) => void
  onDeleteBackup: (id: string) => void
}

type ViewportSize = "desktop" | "tablet" | "mobile"

const COLOR_LABELS: Record<string, string> = {
  primary: "Основной цвет",
  primaryForeground: "Текст на основном",
  background: "Фон",
  foreground: "Текст",
  card: "Карточки",
  cardForeground: "Текст карточек",
  muted: "Приглушённый фон",
  mutedForeground: "Приглушённый текст",
  accent: "Акцент",
  accentForeground: "Текст акцента",
  border: "Границы",
  ring: "Фокус",
}

const PRESET_LABELS: Record<string, { name: string; icon: React.ReactNode }> = {
  default: { name: "Тёмная (Оранжевый)", icon: <Moon className="w-4 h-4" /> },
  light: { name: "Светлая (Оранжевый)", icon: <Sun className="w-4 h-4" /> },
  blue: { name: "Тёмная (Синий)", icon: <Moon className="w-4 h-4" /> },
  green: { name: "Тёмная (Зелёный)", icon: <Moon className="w-4 h-4" /> },
  purple: { name: "Тёмная (Фиолетовый)", icon: <Moon className="w-4 h-4" /> },
  lightBlue: { name: "Светлая (Голубой)", icon: <Sun className="w-4 h-4" /> },
}

export function DesignEditor({ 
  initialSettings, 
  backups,
  onApply, 
  onCancel,
  onRestoreBackup,
  onDeleteBackup
}: DesignEditorProps) {
  const [settings, setSettings] = useState<DesignSettings>(initialSettings)
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop")
  const [isBackupsOpen, setIsBackupsOpen] = useState(false)
  const [hasContentChanges, setHasContentChanges] = useState(false)
  const [initialContent, setInitialContent] = useState<Record<string, TextContent> | null>(null)

  // Слушаем изменения контента из iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CONTENT_CHANGED") {
        setHasContentChanges(true)
      }
    }
    
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Применить CSS переменные к iframe через postMessage
  const applyToPreview = useCallback((newSettings: DesignSettings) => {
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
    if (iframe?.contentWindow) {
      // Используем postMessage для безопасной коммуникации с iframe
      iframe.contentWindow.postMessage(
        { type: DESIGN_MESSAGE_TYPE, settings: newSettings },
        "*"
      )
    }
  }, [])

  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const settingsRef = useRef(settings)
  
  // Обновляем ref при изменении settings
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])
  
  // Применяем настройки когда iframe загружен
  useEffect(() => {
    if (iframeLoaded) {
      applyToPreview(settings)
    }
  }, [settings, applyToPreview, iframeLoaded])

  // Включаем режим редактирования текста
  useEffect(() => {
    if (iframeLoaded) {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
      iframe?.contentWindow?.postMessage({ type: "SET_EDIT_MODE", enabled: true }, "*")
    }
    
    return () => {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
      iframe?.contentWindow?.postMessage({ type: "SET_EDIT_MODE", enabled: false }, "*")
    }
  }, [iframeLoaded])
  
  // Однократная отправка сообщений при загрузке iframe
  useEffect(() => {
    if (!iframeLoaded) return
    
    // Отправляем несколько раз для надёжности
    const timeouts = [
      setTimeout(() => applyToPreview(settingsRef.current), 100),
      setTimeout(() => applyToPreview(settingsRef.current), 500),
      setTimeout(() => applyToPreview(settingsRef.current), 1000),
      setTimeout(() => applyToPreview(settingsRef.current), 2000),
    ]
    
    return () => {
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [iframeLoaded, applyToPreview])

  // Получаем начальный контент при загрузке iframe
  useEffect(() => {
    if (iframeLoaded && !initialContent) {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
      if (iframe?.contentWindow) {
         const handleInitialContent = (event: MessageEvent) => {
            if (event.data?.type === "CONTENT_DATA") {
               if (event.data.content && Object.keys(event.data.content).length > 0) {
                   setInitialContent(event.data.content)
               }
            }
         }
         
         window.addEventListener("message", handleInitialContent)
         
         // Poll for content every 500ms until we get it
         const interval = setInterval(() => {
             iframe.contentWindow?.postMessage({ type: "GET_CONTENT" }, "*")
         }, 500)
         
         // Initial request
         iframe.contentWindow.postMessage({ type: "GET_CONTENT" }, "*")
         
         return () => {
             window.removeEventListener("message", handleInitialContent)
             clearInterval(interval)
         }
      }
    }
  }, [iframeLoaded, initialContent])

  const updateColor = (key: keyof typeof settings.colors, value: string) => {
    const newSettings = {
      ...settings,
      colors: { ...settings.colors, [key]: value }
    }
    setSettings(newSettings)
    applyToPreview(newSettings)
  }

  const updateBorderRadius = (value: number) => {
    const newSettings = { ...settings, borderRadius: value }
    setSettings(newSettings)
    applyToPreview(newSettings)
  }

  const updateHero = (key: keyof DesignSettings['hero'], value: any) => {
    const currentHero = settings.hero || DEFAULT_DESIGN.hero
    const newSettings = {
      ...settings,
      hero: {
        ...currentHero,
        [key]: value
      }
    }
    setSettings(newSettings)
    applyToPreview(newSettings)
  }

  const updateHeroPosition = (axis: 'x' | 'y', value: number) => {
    const currentHero = settings.hero || DEFAULT_DESIGN.hero
    const currentPosition = currentHero.position || DEFAULT_DESIGN.hero.position
    const newSettings = {
      ...settings,
      hero: {
        ...currentHero,
        position: {
          ...currentPosition,
          [axis]: value
        }
      }
    }
    setSettings(newSettings)
    applyToPreview(newSettings)
  }

  const applyPreset = (presetKey: string) => {
    const preset = DESIGN_PRESETS[presetKey]
    if (preset) {
      setSettings(preset)
      applyToPreview(preset)
    }
  }

  const resetChanges = () => {
    setSettings(initialSettings)
    setHasContentChanges(false)
    applyToPreview(initialSettings)
    
    // Сброс контента в iframe
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: "RESET_CONTENT" }, "*")
    }
  }

  const handleApply = () => {
    // Запрашиваем контент из iframe перед сохранением
    const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
    
    if (iframe?.contentWindow) {
      // Создаем обработчик для получения ответа
      const handleContentResponse = (event: MessageEvent) => {
        if (event.data?.type === "CONTENT_DATA") {
          // Удаляем слушатель
          window.removeEventListener("message", handleContentResponse)
          
          const content = event.data.content
          const changedIds = event.data.changedIds || []
          
          const designChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings)

          // Если есть изменения в дизайне, сохраняем бэкап дизайна
          if (designChanged) {
            const backupName = `Дизайн ${new Date().toLocaleString("ru-RU")}`
            // Передаем initialSettings как previousSettings для создания бэкапа старого состояния
            onApply(settings, true, backupName, undefined, 'design', initialSettings, undefined)
          }

          // Если есть изменения в тексте, сохраняем бэкап текста
          if (hasContentChanges) {
             let backupName = `Текст ${new Date().toLocaleString("ru-RU")}`
             if (changedIds.length > 0) {
                const names = changedIds.map((id: string) => {
                    // Используем старый текст для названия бэкапа
                    const oldData = initialContent?.[id]
                    const newData = content[id]
                    const text = oldData?.text || newData?.text || ""
                    
                    // Remove HTML tags if any (though it's textarea usually) and truncate
                    const cleanText = text.replace(/<[^>]*>/g, '').substring(0, 30)
                    let name = cleanText + (text.length > 30 ? '...' : '')

                    // Добавляем информацию об изменении цвета
                    const oldColor = oldData?.style?.color
                    const newColor = newData?.style?.color

                    if (oldColor !== newColor && (oldColor || newColor)) {
                        name += ` (${oldColor || 'стандарт'} -> ${newColor || 'стандарт'})`
                    }

                    return name
                }).filter(Boolean).join(', ')
                if (names) backupName = names
             }
             
             // Передаем initialContent как previousContent для создания бэкапа старого состояния
             onApply(settings, true, backupName, content, 'content', undefined, initialContent || undefined)
          }
          
          setHasContentChanges(false)
          
          // Отправляем команду на сохранение в iframe (для надежности)
          iframe.contentWindow?.postMessage({ 
             type: "APPLY_CONTENT",
             content: content 
          }, "*")
        }
      }
      
      // Слушаем ответ
      window.addEventListener("message", handleContentResponse)
      
      // Отправляем запрос
      iframe.contentWindow.postMessage({ type: "GET_CONTENT" }, "*")
      
      // Таймаут на случай если iframe не ответит
      setTimeout(() => {
         window.removeEventListener("message", handleContentResponse)
      }, 2000)
    } else {
      // Если iframe нет (маловероятно), сохраняем только дизайн
      const backupName = `Дизайн ${new Date().toLocaleString("ru-RU")}`
      onApply(settings, true, backupName, undefined, 'design', initialSettings, undefined)
    }
  }

  const getViewportWidth = () => {
    switch (viewportSize) {
      case "mobile": return "375px"
      case "tablet": return "768px"
      default: return "100%"
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings) || hasContentChanges

  const renderBackupName = (name: string) => {
    // 1. Robust splitting respecting parentheses
    const parts: string[] = []
    let currentPart = ''
    let depth = 0
    
    for (let i = 0; i < name.length; i++) {
      const char = name[i]
      
      if (char === '(') depth++
      else if (char === ')') depth--
      
      if (char === ',' && depth === 0) {
        if (name[i+1] === ' ') {
             parts.push(currentPart)
             currentPart = ''
             i++ // skip space
             continue
        }
      }
      currentPart += char
    }
    if (currentPart) parts.push(currentPart)
    
    return (
      <span className="flex flex-wrap gap-1">
        {parts.map((part, index) => {
          let content = <span>{part}</span>
          
          // Find the last balanced (...) group
          let pDepth = 0
          let lastCloseIdx = -1
          let matchingOpenIdx = -1
          
          for (let i = part.length - 1; i >= 0; i--) {
              if (part[i] === ')') {
                  if (pDepth === 0) lastCloseIdx = i
                  pDepth++
              } else if (part[i] === '(') {
                  pDepth--
                  if (pDepth === 0 && lastCloseIdx !== -1) {
                      matchingOpenIdx = i
                      break // Found the outermost group at the end
                  }
              }
          }
          
          if (matchingOpenIdx !== -1 && lastCloseIdx !== -1) {
             const prefix = part.substring(0, matchingOpenIdx).trim()
             const inside = part.substring(matchingOpenIdx + 1, lastCloseIdx)
             
             // Split by ' -> '
             const arrowParts = inside.split(' -> ')
             if (arrowParts.length === 2) {
                 const oldColor = arrowParts[0].trim()
                 const newColor = arrowParts[1].trim()
                 
                 content = (
                   <span className="flex items-center flex-wrap gap-1.5">
                     <span>{prefix}</span>
                     <span className="flex items-center gap-1.5 bg-zinc-950/50 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground whitespace-nowrap border border-zinc-800">
                       {oldColor === 'стандарт' ? (
                         <span>стандарт</span>
                       ) : (
                         <span 
                           className="w-3 h-3 rounded-[2px] border border-zinc-600 shadow-sm" 
                           style={{ background: oldColor }} 
                           title={oldColor}
                         />
                       )}
                       <span className="text-zinc-500">→</span>
                       {newColor === 'стандарт' ? (
                         <span>стандарт</span>
                       ) : (
                         <span 
                           className="w-3 h-3 rounded-[2px] border border-zinc-600 shadow-sm" 
                           style={{ background: newColor }} 
                           title={newColor}
                         />
                       )}
                     </span>
                   </span>
                 )
             }
          }

          return (
            <span key={index} className="flex items-center">
              {content}
              {index < parts.length - 1 && <span className="mr-1">,</span>}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Превью сайта */}
      <div className="flex-1 flex flex-col">
        {/* Панель инструментов превью */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Закрыть
            </Button>
            <div className="h-6 w-px bg-zinc-700" />
            <span className="text-sm text-muted-foreground">Редактор дизайна</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Переключатель размера экрана */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
              <Button
                variant={viewportSize === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("desktop")}
                className="h-8 px-2"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={viewportSize === "tablet" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("tablet")}
                className="h-8 px-2"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={viewportSize === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewportSize("mobile")}
                className="h-8 px-2"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIframeLoaded(false)
                setIframeKey(prev => prev + 1)
              }}
              className="h-8 px-2"
              title="Обновить превью"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetChanges}
              disabled={!hasChanges}
              className="border-zinc-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
            <Button 
              size="sm" 
              onClick={handleApply}
              disabled={!hasChanges}
              className="bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Применить
            </Button>
          </div>
        </div>

        {/* Область превью */}
        <div className="flex-1 bg-zinc-900/30 p-4 overflow-auto flex items-start justify-center">
          <motion.div
            animate={{ width: getViewportWidth() }}
            transition={{ duration: 0.3 }}
            className="h-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 shadow-2xl"
            style={{ maxWidth: "100%", minHeight: "600px" }}
          >
            <iframe
              key={iframeKey}
              id="preview-iframe"
              src="/"
              className="w-full h-full border-0"
              style={{ minHeight: "600px" }}
              onLoad={() => {
                // Устанавливаем флаг загрузки с небольшой задержкой
                // для полной инициализации React компонентов
                setTimeout(() => {
                  setIframeLoaded(true)
                  applyToPreview(settings)
                }, 300)
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Панель настроек справа */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-900/80 flex flex-col h-screen overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Настройки дизайна
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsBackupsOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
          {hasChanges && (
            <Badge variant="outline" className="mt-2 text-yellow-500 border-yellow-500/50">
              Есть несохранённые изменения
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-6 pb-8">
            {/* Пресеты */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Готовые темы</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESET_LABELS).map(([key, { name, icon }]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key)}
                    className={`justify-start text-xs h-auto py-2 px-3 border-zinc-700 hover:border-primary/50 ${
                      JSON.stringify(settings) === JSON.stringify(DESIGN_PRESETS[key])
                        ? "border-primary bg-primary/10"
                        : ""
                    }`}
                  >
                    {icon}
                    <span className="ml-2 truncate">{name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Цвета */}
            <Accordion type="multiple" defaultValue={["colors-main", "colors-ui", "hero"]} className="space-y-2">
              <AccordionItem value="colors-main" className="border border-zinc-700 rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  Основные цвета
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  {(["primary", "background", "foreground"] as const).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{COLOR_LABELS[key]}</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="color"
                            value={settings.colors[key]}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border border-zinc-600"
                          />
                        </div>
                        <Input
                          value={settings.colors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="flex-1 h-10 bg-zinc-800 border-zinc-700 font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="colors-ui" className="border border-zinc-700 rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  Элементы интерфейса
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  {(["card", "muted", "border", "accent"] as const).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{COLOR_LABELS[key]}</Label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="color"
                            value={settings.colors[key]}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border border-zinc-600"
                          />
                        </div>
                        <Input
                          value={settings.colors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="flex-1 h-10 bg-zinc-800 border-zinc-700 font-mono text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>



              <AccordionItem value="hero" className="border border-zinc-700 rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  Фон главной (Hero)
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Изображение фона</Label>
                    <FileUpload
                      type="image"
                      value={settings.hero?.backgroundImage || ""}
                      onChange={(url) => updateHero("backgroundImage", url)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Прозрачность</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.hero?.opacity ?? 0.5]}
                        onValueChange={([value]) => updateHero("opacity", value)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">
                        {Math.round((settings.hero?.opacity ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Радиус затухания (края)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.hero?.fadeWidth ?? 20]}
                        onValueChange={([value]) => updateHero("fadeWidth", value)}
                        min={0}
                        max={50}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">
                        {settings.hero?.fadeWidth ?? 20}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Позиция изображения (X / Y)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <Label className="text-[10px] text-muted-foreground">По горизонтали</Label>
                         <div className="flex items-center gap-2">
                            <Slider
                                value={[settings.hero?.position?.x ?? 50]}
                                onValueChange={([value]) => updateHeroPosition("x", value)}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono w-8 text-right">{settings.hero?.position?.x ?? 50}%</span>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <Label className="text-[10px] text-muted-foreground">По вертикали</Label>
                         <div className="flex items-center gap-2">
                            <Slider
                                value={[settings.hero?.position?.y ?? 50]}
                                onValueChange={([value]) => updateHeroPosition("y", value)}
                                min={0}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono w-8 text-right">{settings.hero?.position?.y ?? 50}%</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="other" className="border border-zinc-700 rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  Другие настройки
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Скругление углов</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[settings.borderRadius]}
                        onValueChange={([value]) => updateBorderRadius(value)}
                        min={0}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">{settings.borderRadius}px</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{COLOR_LABELS.ring}</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.colors.ring}
                          onChange={(e) => updateColor("ring", e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-zinc-600"
                        />
                      </div>
                      <Input
                        value={settings.colors.ring}
                        onChange={(e) => updateColor("ring", e.target.value)}
                        className="flex-1 h-10 bg-zinc-800 border-zinc-700 font-mono text-xs"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Превью цветов */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Превью палитры</Label>
              <div className="grid grid-cols-6 gap-1">
                {Object.entries(settings.colors).map(([key, value]) => (
                  <div
                    key={key}
                    className="aspect-square rounded border border-zinc-600"
                    style={{ backgroundColor: value }}
                    title={COLOR_LABELS[key]}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Диалог резервных копий */}
      <Dialog open={isBackupsOpen} onOpenChange={setIsBackupsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Резервные копии
            </DialogTitle>
            <DialogDescription>
              Выберите резервную копию для восстановления
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Tabs defaultValue="design" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-800">
                <TabsTrigger value="design">Дизайн</TabsTrigger>
                <TabsTrigger value="content">Текст</TabsTrigger>
              </TabsList>
              
              <TabsContent value="design" className="space-y-4">
                {backups.filter(b => b.type === 'design').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Резервных копий дизайна пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {backups.filter(b => b.type === 'design').map((backup) => (
                      <div
                        key={backup.id}
                        className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{backup.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(backup.createdAt).toLocaleString("ru-RU")}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const b = backup as DesignBackup
                                onRestoreBackup(b.id)
                                setSettings(b.settings)
                                applyToPreview(b.settings)
                                setIsBackupsOpen(false)
                              }}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              <span className="text-xs">Восстановить</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteBackup(backup.id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Превью цветовой гаммы */}
                        <div className="flex gap-1">
                          <div 
                            className="w-5 h-5 rounded border border-zinc-600" 
                            style={{ backgroundColor: (backup as DesignBackup).settings.colors.primary }}
                            title="Основной цвет"
                          />
                          <div 
                            className="w-5 h-5 rounded border border-zinc-600" 
                            style={{ backgroundColor: (backup as DesignBackup).settings.colors.background }}
                            title="Фон"
                          />
                          <div 
                            className="w-5 h-5 rounded border border-zinc-600" 
                            style={{ backgroundColor: (backup as DesignBackup).settings.colors.foreground }}
                            title="Текст"
                          />
                          <div 
                            className="w-5 h-5 rounded border border-zinc-600" 
                            style={{ backgroundColor: (backup as DesignBackup).settings.colors.accent }}
                            title="Акцент"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                {backups.filter(b => b.type === 'content').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Резервных копий текста пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {backups.filter(b => b.type === 'content').map((backup) => (
                      <div
                        key={backup.id}
                        className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 mr-4">
                            <div className="font-medium text-sm line-clamp-2" title={backup.name}>
                              {renderBackupName(backup.name)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(backup.createdAt).toLocaleString("ru-RU")}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const b = backup as ContentBackup
                                onRestoreBackup(b.id)
                                
                                // Восстановление контента
                                const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement
                                if (iframe?.contentWindow) {
                                  iframe.contentWindow.postMessage({ 
                                    type: "RESTORE_CONTENT", 
                                    content: b.content 
                                  }, "*")
                                }

                                setIsBackupsOpen(false)
                              }}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              <span className="text-xs">Восстановить</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteBackup(backup.id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupsOpen(false)} className="border-zinc-700">
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
