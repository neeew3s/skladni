"use client"

import { useState } from "react"
import { SceneViewer } from "@/components/3d/scene-viewer"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { EditableText } from "@/components/ui/editable-text"
import { Layers, Box, Scan, Info, Lock, Unlock, Package, Shield, Blinds } from "lucide-react"

export function EngineeringSection({ isMobile = false }: { isMobile?: boolean }) {
  const [mode, setMode] = useState<"standard" | "exploded" | "section">("standard")
  const [activeModel, setActiveModel] = useState<"bunker" | "shutters" | "container">("bunker")
  const [shutterVariant, setShutterVariant] = useState<"bifold" | "accordion">("bifold")
  const [isOpen, setIsOpen] = useState(false)
  const [areLouvresOpen, setAreLouvresOpen] = useState(false)
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [showAnnotations, setShowAnnotations] = useState(true)

  const allSpecs = {
    // Common / Bunker Specs
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

    // Shutters Specs
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

    // Container Specs
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
    <section id="engineering" className="relative w-full min-h-screen bg-background py-12 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 h-full grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-min">
        {/* Header Section */}
        <div className="lg:col-span-4 pointer-events-auto">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-2">
            <EditableText id="eng-title-1" defaultText="ИНЖЕНЕРНАЯ" /> <span className="text-primary"><EditableText id="eng-title-2" defaultText="СХЕМА" /></span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            <EditableText id="eng-desc" defaultText="Изучите многоуровневую систему защиты. Выберите модель и взаимодействуйте с механизмами." />
          </p>
        </div>

        {/* Model Selection Tabs */}
        <div className="lg:col-span-4 flex flex-wrap gap-2 bg-secondary/20 p-1 rounded-md h-fit mb-6 max-w-full">
          <Button
            variant={activeModel === "bunker" ? "default" : "ghost"}
            onClick={() => setActiveModel("bunker")}
            className="flex-1 min-w-[100px] text-xs md:text-sm px-2 md:px-4"
          >
            <Shield className="w-4 h-4 mr-1 md:mr-2 shrink-0" /> <span className="truncate"><EditableText id="eng-btn-bunker" defaultText="Бункер" /></span>
          </Button>
          <Button
            variant={activeModel === "container" ? "default" : "ghost"}
            onClick={() => setActiveModel("container")}
            className="flex-1 min-w-[100px] text-xs md:text-sm px-2 md:px-4"
          >
            <Package className="w-4 h-4 mr-1 md:mr-2 shrink-0" /> <span className="truncate"><EditableText id="eng-btn-container" defaultText="Контейнер" /></span>
          </Button>
          <Button
            variant={activeModel === "shutters" ? "default" : "ghost"}
            onClick={() => setActiveModel("shutters")}
            className="flex-1 min-w-[100px] text-xs md:text-sm px-2 md:px-4"
          >
            <Blinds className="w-4 h-4 mr-1 md:mr-2 shrink-0" /> <span className="truncate"><EditableText id="eng-btn-shutters" defaultText="Ставни" /></span>
          </Button>
        </div>

        {/* Variant Selection (Conditional) */}
        {activeModel === "shutters" ? (
          <div className="lg:col-span-4 flex gap-2 mb-6 p-1 h-fit">
            <span className="text-xs text-muted-foreground self-center mr-2"><EditableText id="eng-variant-label" defaultText="Тип:" /></span>
            <div className="flex bg-secondary/20 rounded-md p-1 w-full md:w-auto">
              <Button
                size="sm"
                variant={shutterVariant === "bifold" ? "secondary" : "ghost"}
                onClick={() => setShutterVariant("bifold")}
                className="text-xs h-7 whitespace-nowrap flex-1 md:flex-none"
              >
                <EditableText id="eng-btn-fold" defaultText="Складные" />
              </Button>
              <Button
                size="sm"
                variant={shutterVariant === "accordion" ? "secondary" : "ghost"}
                onClick={() => setShutterVariant("accordion")}
                className="text-xs h-7 whitespace-nowrap flex-1 md:flex-none"
              >
                <EditableText id="eng-btn-accordion" defaultText="Гармошка" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block lg:col-span-4" />
        )}

        {/* Controls Section */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 mb-4 md:mb-12 h-fit">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider"><EditableText id="eng-mode-label" defaultText="Режим просмотра" /></span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mode === "standard" ? "outline" : "ghost"}
                onClick={() => setMode("standard")}
                className="flex-1 px-2"
              >
                <Box className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={mode === "exploded" ? "outline" : "ghost"}
                onClick={() => setMode("exploded")}
                className="flex-1 px-2"
              >
                <Layers className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={mode === "section" ? "outline" : "ghost"}
                onClick={() => setMode("section")}
                className="flex-1 px-2"
              >
                <Scan className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider"><EditableText id="eng-status-label" defaultText="Состояние" /></span>
            <div className="flex gap-1">
              <Button
                variant={isOpen ? "destructive" : "secondary"}
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1"
              >
                {isOpen ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" /> <EditableText id="eng-status-open" defaultText="ОТКРЫТО" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> <EditableText id="eng-status-closed" defaultText="ЗАКРЫТО" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Viewer Side */}
        <div className="lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:row-span-6 h-[400px] md:h-[500px] lg:h-[700px] relative rounded-sm overflow-hidden border border-white/5">
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end pointer-events-none">
            <div className="bg-black/50 backdrop-blur px-3 py-1 text-[10px] md:text-xs font-mono text-primary border-l-2 border-primary uppercase">
              ОБЪЕКТ:{" "}
              {activeModel === "bunker"
                ? "БУНКЕР-А1"
                : activeModel === "shutters"
                  ? shutterVariant === "bifold"
                    ? "СТАВНИ-B4 (FOLD)"
                    : "СТАВНИ-A7 (ACCORD)"
                  : "КОНТЕЙНЕР-C4"}
            </div>
            <div className="bg-black/50 backdrop-blur px-3 py-1 text-[10px] md:text-xs font-mono text-accent border-l-2 border-accent uppercase">
              СТАТУС: {isOpen ? "ДОСТУП РАЗРЕШЕН" : "ЗАБЛОКИРОВАНО"}
            </div>
          </div>
          <SceneViewer
            mode={mode}
            modelType={activeModel}
            shutterVariant={shutterVariant}
            isOpen={isOpen}
            areLouvresOpen={areLouvresOpen}
            onPartHover={setHoveredPart}
            showAnnotations={showAnnotations}
            hoveredPart={hoveredPart}
            specs={allSpecs}
            isMobile={isMobile}
          />

          {/* Decorative UI Elements */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] md:text-[10px] text-white/30 font-mono pointer-events-none">
            <span>КООРД: 34.0522° N, 118.2437° W</span>
            <span>СИСТ: ОНЛАЙН</span>
            <span>УРОВЕНЬ: 5</span>
          </div>
          <div className="absolute inset-0 border border-white/5 pointer-events-none" />
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50" />
        </div>

        {/* Annotations Toggle Slider */}
        <div className="lg:col-span-4 flex items-center justify-between bg-secondary/10 p-4 border border-white/5 mb-8 md:mb-12 h-fit">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <EditableText id="eng-labels-toggle" defaultText="Метки деталей" />
            </span>
            <span className="text-[10px] text-muted-foreground"><EditableText id="eng-labels-desc" defaultText="Показать информацию при наведении" /></span>
          </div>
          <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} />
        </div>
      </div>
    </section>
  )
}
