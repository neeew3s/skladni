"use client"

import React, { useState, useEffect } from "react"
import { useContent } from "@/lib/content-context"
import { cn } from "@/lib/utils"

interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  id: string
  defaultText: string
  as?: React.ElementType
}

export function EditableText({
  id,
  defaultText,
  as: Component = "span",
  className,
  style,
  ...props
}: EditableTextProps) {
  const { isEditMode, selectedElementId, selectElement, content, updateContent } = useContent()
  const [isHovered, setIsHovered] = useState(false)

  // Initialize content if it doesn't exist
  useEffect(() => {
    if (!content[id]) {
      updateContent(id, { text: defaultText })
    }
  }, [id, defaultText, content, updateContent])

  const text = content[id]?.text || defaultText
  const contentStyle = content[id]?.style || {}
  const isSelected = selectedElementId === id

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault()
      e.stopPropagation()
      selectElement(id)
    } else if (props.onClick) {
      props.onClick(e)
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isEditMode) {
      setIsHovered(true)
    }
    props.onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isEditMode) {
      setIsHovered(false)
    }
    props.onMouseLeave?.(e)
  }

  const editStyles = isEditMode
    ? {
        cursor: "pointer",
        outline: isSelected
          ? "2px solid #3b82f6" // Blue outline for selected
          : isHovered
          ? "1px dashed #3b82f6" // Dashed blue for hover
          : "none",
        outlineOffset: "2px",
        position: "relative" as const,
        zIndex: isSelected ? 50 : "auto",
      }
    : {}

  return (
    <Component
      className={cn(className)}
      style={{ ...style, ...contentStyle, ...editStyles }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {text}
    </Component>
  )
}
