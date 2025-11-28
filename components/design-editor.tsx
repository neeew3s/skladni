"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface DesignEditorProps {
  initialSettings: DesignSettings
  backups: DesignBackup[]
  onApply: (settings: DesignSettings, createBackup: boolean, backupName?: string) => void
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
  const [showPreview, setShowPreview] = useState(true) // Для переключения на мобильных

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

  const applyPreset = (presetKey: string) => {
    const preset = DESIGN_PRESETS[presetKey]
    if (preset) {
      setSettings(preset)
      applyToPreview(preset)
    }
  }

  const resetChanges = () => {
    setSettings(initialSettings)
    applyToPreview(initialSettings)
  }

  const handleApply = () => {
    // Применяем сразу с автоматическим созданием резервной копии
    const backupName = `Резервная копия ${new Date().toLocaleString("ru-RU")}`
    onApply(settings, true, backupName)
  }

  const getViewportWidth = () => {
    switch (viewportSize) {
      case "mobile": return "375px"
      case "tablet": return "768px"
      default: return "100%"
    }
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings)

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-zinc-950">
      {/* Верхняя панель инструментов - всегда видна */}
      <div className="flex-shrink-0 h-14 border-b border-zinc-800 flex items-center justify-between px-2 md:px-4 bg-zinc-900/50 lg:hidden">
        <Button variant="ghost" size="sm" onClick={onCancel} className="px-2">
          <X className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Закрыть</span>
        </Button>
        
        <div className="flex items-center gap-1">
          <Button
            variant={!showPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(false)}
            className="h-8 px-2 text-xs"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Настройки</span>
          </Button>
          <Button
            variant={showPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(true)}
            className="h-8 px-2 text-xs"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Превью</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetChanges}
            disabled={!hasChanges}
            className="border-zinc-700 px-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            disabled={!hasChanges}
            className="bg-primary hover:bg-primary/90 px-2"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Применить</span>
          </Button>
        </div>
      </div>

      {/* Превью сайта - на мобильных показывается/скрывается */}
      <div className={`flex-1 flex flex-col ${showPreview ? 'flex' : 'hidden'} lg:flex`}>
        {/* Панель инструментов превью - только на десктопе */}
        <div className="hidden lg:flex h-14 border-b border-zinc-800 items-center justify-between px-4 bg-zinc-900/50">
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
        <div className="flex-1 bg-zinc-900/30 p-2 md:p-4 overflow-auto flex items-start justify-center">
          <motion.div
            animate={{ width: getViewportWidth() }}
            transition={{ duration: 0.3 }}
            className="h-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 shadow-2xl"
            style={{ maxWidth: "100%", minHeight: "400px" }}
          >
            <iframe
              key={iframeKey}
              id="preview-iframe"
              src="/"
              className="w-full h-full border-0"
              style={{ minHeight: "400px" }}
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

      {/* Панель настроек справа - на мобильных показывается/скрывается */}
      <div className={`w-full lg:w-80 border-l border-zinc-800 bg-zinc-900/80 flex flex-col h-[calc(100vh-56px)] lg:h-screen overflow-hidden ${showPreview ? 'hidden' : 'flex'} lg:flex`}>
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
            <Accordion type="multiple" defaultValue={["colors-main", "colors-ui"]} className="space-y-2">
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

              <AccordionItem value="colors-text" className="border border-zinc-700 rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  Цвета текста
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  {(["primaryForeground", "cardForeground", "mutedForeground", "accentForeground"] as const).map((key) => (
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
            
            {/* Отступ для фиксированной панели на мобильных */}
            <div className="h-16 lg:hidden" />
          </div>
        </ScrollArea>
        
        {/* Фиксированная панель действий на мобильных */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetChanges}
            disabled={!hasChanges}
            className="flex-1 border-zinc-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            disabled={!hasChanges}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Применить
          </Button>
        </div>
      </div>

      {/* Диалог резервных копий */}
      <Dialog open={isBackupsOpen} onOpenChange={setIsBackupsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Резервные копии дизайна
            </DialogTitle>
            <DialogDescription>
              Выберите резервную копию для восстановления
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Резервных копий пока нет</p>
                <p className="text-xs mt-1">Они создаются автоматически при применении изменений</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {backups.map((backup) => (
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
                            onRestoreBackup(backup.id)
                            setSettings(backup.settings)
                            applyToPreview(backup.settings)
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
                        style={{ backgroundColor: backup.settings.colors.primary }}
                        title="Основной цвет"
                      />
                      <div 
                        className="w-5 h-5 rounded border border-zinc-600" 
                        style={{ backgroundColor: backup.settings.colors.background }}
                        title="Фон"
                      />
                      <div 
                        className="w-5 h-5 rounded border border-zinc-600" 
                        style={{ backgroundColor: backup.settings.colors.foreground }}
                        title="Текст"
                      />
                      <div 
                        className="w-5 h-5 rounded border border-zinc-600" 
                        style={{ backgroundColor: backup.settings.colors.accent }}
                        title="Акцент"
                      />
                      <div 
                        className="w-5 h-5 rounded border border-zinc-600" 
                        style={{ backgroundColor: backup.settings.colors.card }}
                        title="Карточки"
                      />
                      <div 
                        className="w-5 h-5 rounded border border-zinc-600" 
                        style={{ backgroundColor: backup.settings.colors.muted }}
                        title="Приглушённый"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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

