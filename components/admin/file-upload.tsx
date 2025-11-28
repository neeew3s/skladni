"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2, FileText, Image as ImageIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface FileUploadProps {
  type: "image" | "document"
  value?: string
  onChange: (url: string) => void
  className?: string
  placeholder?: string
}

export function FileUpload({ type, value, onChange, className, placeholder }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptTypes = type === "image" 
    ? "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/avif"
    : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.odt,.ods"

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Ошибка загрузки")
      }

      onChange(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки файла")
    } finally {
      setIsUploading(false)
    }
  }, [type, onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const clearFile = () => {
    onChange("")
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const isImage = type === "image"
  const Icon = isImage ? ImageIcon : FileText

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {!value && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
            dragOver 
              ? "border-primary bg-primary/10" 
              : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Загрузка...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {placeholder || (isImage ? "Загрузить изображение" : "Загрузить документ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isImage 
                    ? "PNG, JPG, WEBP, GIF, SVG до 10MB"
                    : "PDF, DOCX, XLSX, TXT до 50MB"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative">
          {isImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={clearFile}
                className="absolute top-2 right-2 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {value.split("/").pop()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Файл загружен
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="flex-shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual URL input */}
      {!value && !isUploading && (
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 border-t border-zinc-700"></div>
            <span>или укажите URL</span>
            <div className="flex-1 border-t border-zinc-700"></div>
          </div>
          <input
            type="text"
            placeholder={isImage ? "/путь/к/изображению.jpg" : "/путь/к/документу.pdf"}
            className="w-full mt-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value)
              }
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

