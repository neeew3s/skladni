"use client"

import { useState } from "react"
import { SceneViewer } from "@/components/3d/scene-viewer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Layers, Box, Scan, Info, Lock, Unlock } from "lucide-react"

interface Product3DViewerProps {
  productSlug: string
  isMobile?: boolean
}

export function Product3DViewer({ productSlug, isMobile = false }: Product3DViewerProps) {
  const [mode, setMode] = useState<"standard" | "exploded" | "section">("standard")
  const [shutterVariant, setShutterVariant] = useState<"bifold" | "accordion">("bifold")
  const [isOpen, setIsOpen] = useState(false)
  const [areLouvresOpen, setAreLouvresOpen] = useState(false)
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [showAnnotations, setShowAnnotations] = useState(true)

  const getModelType = (): "bunker" | "shutters" | "container" => {
    switch (productSlug) {
      case "armored-shutters":
        return "shutters"
      case "safe-cell-container":
        return "container"
      case "fortress-alpha":
        return "bunker"
      default:
        return "bunker"
    }
  }

  const modelType = getModelType()

  const allSpecs = {
    "Взрывозащитная дверь IV": {
      вес: "450 кг",
      материал: "Закаленная сталь",
      толщина: "120 мм",
      рейтинг: "10 Бар",
    },
    "Система фильтрации NBC": {
      вес: "85 кг",
      материал: "Композит",
      поток: "150 м³/ч",
      рейтинг: "HEPA H14",
    },
    "Усиленная крыша": {
      вес: "12,000 кг",
      материал: "Армированный бетон",
      толщина: "400 мм",
      рейтинг: "Ударная стойкость",
    },
    "Экранирование ядра": {
      вес: "Н/Д",
      материал: "Свинцовая сталь",
      толщина: "50 мм",
      рейтинг: "Радиация",
    },
    Фундамент: {
      вес: "25,000 кг",
      материал: "Высокоплотный бетон",
      толщина: "600 мм",
      рейтинг: "Сейсмоустойчивость",
    },
    Рама: {
      вес: "120 кг",
      материал: "Стальной профиль",
      толщина: "80 мм",
      рейтинг: "Взлом RC4",
    },
    Ламели: {
      вес: "15 кг/м²",
      материал: "Алюминиевый сплав",
      угол: "0-90 градусов",
      привод: "Электрический",
    },
    "Левая створка": {
      вес: "45 кг",
      материал: "Бронесталь",
      толщина: "20 мм",
      рейтинг: "Пулестойкость BR4",
    },
    "Правая створка": {
      вес: "45 кг",
      материал: "Бронесталь",
      толщина: "20 мм",
      рейтинг: "Пулестойкость BR4",
    },
    "Несущая рама": {
      вес: "150 кг",
      материал: "Усиленный алюминий",
      покрытие: "Порошковое",
      нагрузка: "До 500 кг",
    },
    "Верхняя панель": {
      вес: "35 кг",
      материал: "Композит/Сталь",
      привод: "Гидравлический",
      изоляция: "Пенополиуретан",
    },
    "Нижняя панель": {
      вес: "35 кг",
      материал: "Композит/Сталь",
      тип: "Складная",
      фиксация: "Магнитная",
    },
    "Направляющий рельс": {
      вес: "10 кг/м",
      материал: "Нержавеющая сталь",
      тип: "Верхний подвес",
      нагрузка: "До 1000 кг",
    },
    "Складная секция": {
      вес: "25 кг",
      материал: "Алюминий/Ткань",
      толщина: "50 мм",
      изоляция: "Акустическая",
    },
    "Запорный механизм": {
      тип: "Многоточечный",
      материал: "Титан",
      класс: "Взломостойкий",
      привод: "Ручной/Авто",
    },
    "Бронированный корпус": {
      вес: "3,500 кг",
      материал: "Кортен + Броня",
      толщина: "14 мм + 6мм",
      рейтинг: "ISO 668",
    },
    "Дверной затвор": {
      вес: "200 кг",
      материал: "Усиленная сталь",
      механизм: "Ригельный",
      рейтинг: "Герметичность",
    },
  }

  return (
    <div className="space-y-4">
      {/* Controls Panel */}
      <div className="flex flex-wrap gap-4 p-4 bg-secondary/10 border border-white/5">
        {/* View Mode */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Режим просмотра</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mode === "standard" ? "outline" : "ghost"}
              onClick={() => setMode("standard")}
              className="px-3"
            >
              <Box className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={mode === "exploded" ? "outline" : "ghost"}
              onClick={() => setMode("exploded")}
              className="px-3"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={mode === "section" ? "outline" : "ghost"}
              onClick={() => setMode("section")}
              className="px-3"
            >
              <Scan className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* State Toggle */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Состояние</span>
          <Button
            size="sm"
            variant={isOpen ? "destructive" : "secondary"}
            onClick={() => setIsOpen(!isOpen)}
            className="min-w-[120px]"
          >
            {isOpen ? (
              <>
                <Unlock className="w-4 h-4 mr-2" /> ОТКРЫТО
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" /> ЗАКРЫТО
              </>
            )}
          </Button>
        </div>

        {/* Shutter Variant (only for shutters) */}
        {modelType === "shutters" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Тип ставней</span>
            <div className="flex gap-1 bg-secondary/20 rounded-md p-1">
              <Button
                size="sm"
                variant={shutterVariant === "bifold" ? "secondary" : "ghost"}
                onClick={() => setShutterVariant("bifold")}
                className="text-xs h-7"
              >
                Складные
              </Button>
              <Button
                size="sm"
                variant={shutterVariant === "accordion" ? "secondary" : "ghost"}
                onClick={() => setShutterVariant("accordion")}
                className="text-xs h-7"
              >
                Гармошка
              </Button>
            </div>
          </div>
        )}

        {/* Annotations Toggle */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Метки</span>
          </div>
          <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} />
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="relative w-full h-[500px] lg:h-[600px] rounded-sm overflow-hidden border border-white/5">
        {/* Status Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end pointer-events-none">
          <div className="bg-black/50 backdrop-blur px-3 py-1 text-xs font-mono text-primary border-l-2 border-primary uppercase">
            ОБЪЕКТ:{" "}
            {modelType === "bunker"
              ? "БУНКЕР-А1"
              : modelType === "shutters"
                ? shutterVariant === "bifold"
                  ? "СТАВНИ-B4 (FOLD)"
                  : "СТАВНИ-A7 (ACCORD)"
                : "КОНТЕЙНЕР-C4"}
          </div>
          <div className="bg-black/50 backdrop-blur px-3 py-1 text-xs font-mono text-accent border-l-2 border-accent uppercase">
            СТАТУС: {isOpen ? "ДОСТУП РАЗРЕШЕН" : "ЗАБЛОКИРОВАНО"}
          </div>
        </div>

        <SceneViewer
          mode={mode}
          modelType={modelType}
          shutterVariant={shutterVariant}
          isOpen={isOpen}
          areLouvresOpen={areLouvresOpen}
          onPartHover={setHoveredPart}
          showAnnotations={showAnnotations}
          hoveredPart={hoveredPart}
          specs={allSpecs}
          isMobile={isMobile}
        />

        {/* Corner Decorations */}
        <div className="absolute inset-0 border border-white/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50" />

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-white/30 font-mono pointer-events-none">
          <span>КООРД: 34.0522° N, 118.2437° W</span>
          <span>СИСТ: ОНЛАЙН</span>
          <span>УРОВЕНЬ: 5</span>
        </div>
      </div>
    </div>
  )
}
