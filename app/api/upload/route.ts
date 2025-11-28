import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

// Разрешённые типы файлов
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif"
]

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet"
]

// Максимальные размеры файлов (в байтах)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string // "image" или "document"

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      )
    }

    if (!type || !["image", "document"].includes(type)) {
      return NextResponse.json(
        { error: "Неверный тип файла" },
        { status: 400 }
      )
    }

    // Проверка типа файла
    const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES
    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE
    const uploadDir = type === "image" ? "uploads/images" : "uploads/documents"

    // Проверяем MIME тип
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Недопустимый формат файла. Разрешены: ${type === "image" ? "изображения (PNG, JPG, WEBP и др.)" : "документы (PDF, DOCX, TXT и др.)"}` },
        { status: 400 }
      )
    }

    // Проверяем размер
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Создаём директорию если не существует
    const publicPath = path.join(process.cwd(), "public", uploadDir)
    if (!existsSync(publicPath)) {
      await mkdir(publicPath, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${timestamp}-${randomStr}-${originalName}`

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(publicPath, fileName)
    
    await writeFile(filePath, buffer)

    // Возвращаем публичный URL
    const publicUrl = `/${uploadDir}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Ошибка при загрузке файла" },
      { status: 500 }
    )
  }
}

