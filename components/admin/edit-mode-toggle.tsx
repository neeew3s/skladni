"use client"

import { useContent } from "@/lib/content-context"
import { Button } from "@/components/ui/button"
import { Edit3, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

export function EditModeToggle() {
  const { isEditMode, toggleEditMode } = useContent()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleEditMode}
      className={cn(
        "fixed bottom-4 right-4 z-[100] rounded-full shadow-lg transition-all duration-300",
        isEditMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background hover:bg-muted"
      )}
      title={isEditMode ? "Выйти из режима редактирования" : "Режим редактирования текста"}
    >
      {isEditMode ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
    </Button>
  )
}
