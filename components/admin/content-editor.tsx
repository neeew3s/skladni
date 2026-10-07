"use client"

import { useEffect, useState } from "react"
import { useContent } from "@/lib/content-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { X, Type, Move, Palette, Zap } from "lucide-react"

export function ContentEditor() {
  const { isEditMode, selectedElementId, selectElement, content, updateContent } = useContent()
  const [position, setPosition] = useState({ x: 20, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Global mouse up handler for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleDragEnd)
      window.addEventListener("mousemove", handleDrag as any)
    } else {
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("mousemove", handleDrag as any)
    }
    return () => {
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("mousemove", handleDrag as any)
    }
  }, [isDragging])

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleDrag = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  if (!isEditMode || !selectedElementId) return null

  const currentData = content[selectedElementId] || { text: "" }
  const style = currentData.style || {}
  
  // Check if gradient is active
  const isGradient = !!style.backgroundImage && style.backgroundImage.includes("linear-gradient")

  // Parse gradient values or use defaults
  let gradientAngle = 45
  let gradientStart = "#ffffff"
  let gradientEnd = "#000000"

  if (isGradient) {
    try {
      const match = style.backgroundImage?.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,6}),\s*(#[0-9a-fA-F]{3,6})\)/)
      if (match) {
        gradientAngle = parseInt(match[1])
        gradientStart = match[2]
        gradientEnd = match[3]
      }
    } catch (e) {
      console.error("Failed to parse gradient", e)
    }
  }

  const updateStyle = (newStyle: React.CSSProperties) => {
    updateContent(selectedElementId, { style: { ...style, ...newStyle } })
  }

  const handleColorChange = (color: string) => {
    if (isGradient) {
        // If we are in gradient mode but changing solid color, do nothing or switch off gradient?
        // User might expect to switch off gradient.
        // But let's keep it simple: Color input is for Solid Color.
        // If user uses Color input, we disable gradient.
        const newStyle = { ...style }
    delete newStyle.backgroundImage
    delete newStyle.backgroundClip
    delete newStyle.WebkitBackgroundClip
    delete newStyle.WebkitTextFillColor
    newStyle.color = color
    updateContent(selectedElementId, { style: newStyle })
    } else {
        updateStyle({ color })
    }
  }

  const handleGradientToggle = (enabled: boolean) => {
    const newStyle = { ...style }
    if (enabled) {
      newStyle.backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      newStyle.backgroundClip = "text"
      newStyle.WebkitBackgroundClip = "text"
      newStyle.WebkitTextFillColor = "transparent"
      newStyle.color = "transparent"
    } else {
      delete newStyle.backgroundImage
      delete newStyle.backgroundClip
      delete newStyle.WebkitBackgroundClip
      delete newStyle.WebkitTextFillColor
      newStyle.color = "#ffffff" // Default reset color
    }
    updateContent(selectedElementId, { style: newStyle })
  }

  const updateGradient = (angle: number, start: string, end: string) => {
    const newStyle = { ...style }
    newStyle.backgroundImage = `linear-gradient(${angle}deg, ${start}, ${end})`
    updateContent(selectedElementId, { style: newStyle })
  }

  return (
    <div
      className="fixed z-[100] w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div
        className="h-10 bg-muted/50 border-b border-border flex items-center justify-between px-3 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Move className="w-4 h-4" />
          <span>Редактор контента</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => selectElement(null)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Text Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Type className="w-4 h-4" />
            <span>Текст</span>
          </div>
          <Textarea
            value={currentData.text}
            onChange={(e) => updateContent(selectedElementId, { text: e.target.value })}
            className="min-h-[100px] resize-none bg-background"
            placeholder="Введите текст..."
          />
        </div>

        <div className="h-px bg-border" />

        {/* Appearance */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Palette className="w-4 h-4" />
            <span>Внешний вид</span>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Цвет текста</Label>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <input
                   type="color"
                   value={isGradient ? "#ffffff" : (style.color as string || "#ffffff")}
                   onChange={(e) => handleColorChange(e.target.value)}
                   disabled={isGradient}
                   className="w-10 h-10 rounded cursor-pointer border border-input disabled:opacity-50"
                 />
               </div>
               <Input
                 value={isGradient ? "Градиент" : (style.color as string || "#ffffff")}
                 onChange={(e) => handleColorChange(e.target.value)}
                 disabled={isGradient}
                 className="flex-1 h-10 bg-background font-mono text-xs"
               />
            </div>
          </div>

          {/* Gradient */}
          <div className="space-y-3 pt-2 border-t border-border/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Zap className="w-3 h-3 text-yellow-500" />
                   <Label className="text-xs text-muted-foreground">Градиент</Label>
                </div>
                <Switch 
                   checked={isGradient}
                   onCheckedChange={handleGradientToggle}
                />
             </div>

             {isGradient && (
               <div className="space-y-3 p-3 bg-muted/30 rounded-md">
                  <div className="space-y-2">
                     <Label className="text-[10px] text-muted-foreground">Начальный цвет</Label>
                     <div className="flex items-center gap-2">
                        <input
                           type="color"
                           value={gradientStart}
                           onChange={(e) => updateGradient(gradientAngle, e.target.value, gradientEnd)}
                           className="w-8 h-8 rounded cursor-pointer border border-input"
                        />
                        <Input 
                           value={gradientStart}
                           onChange={(e) => updateGradient(gradientAngle, e.target.value, gradientEnd)}
                           className="h-8 text-xs font-mono"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] text-muted-foreground">Конечный цвет</Label>
                     <div className="flex items-center gap-2">
                        <input
                           type="color"
                           value={gradientEnd}
                           onChange={(e) => updateGradient(gradientAngle, gradientStart, e.target.value)}
                           className="w-8 h-8 rounded cursor-pointer border border-input"
                        />
                        <Input 
                           value={gradientEnd}
                           onChange={(e) => updateGradient(gradientAngle, gradientStart, e.target.value)}
                           className="h-8 text-xs font-mono"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground">Угол</Label>
                        <span className="text-[10px] font-mono">{gradientAngle}°</span>
                     </div>
                     <Slider
                        value={[gradientAngle]}
                        onValueChange={([val]) => updateGradient(val, gradientStart, gradientEnd)}
                        min={0}
                        max={360}
                        step={1}
                        className="py-1"
                     />
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-md text-xs text-muted-foreground mt-4">
          <p>ID элемента: <span className="font-mono">{selectedElementId}</span></p>
        </div>
      </div>
    </div>
  )
}
