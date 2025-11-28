"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface ProductSpec {
  label: string
  value: string
}

export type Currency = "RUB" | "USD" | "EUR"
export type PriceType = "fixed" | "from" | "range"

export interface PriceData {
  type: PriceType
  currency: Currency
  value: number
  valueTo?: number // для диапазона
}

// Стандартные преимущества
export const DEFAULT_BENEFITS = [
  "Бесплатная консультация специалиста",
  "Индивидуальный проект под ваши требования",
  "Профессиональный монтаж",
  "Гарантийное обслуживание",
  "Техническая поддержка 24/7",
]

// Символы валют
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
}

// Форматирование числа с разделителями
export function formatNumber(num: number): string {
  return num.toLocaleString("ru-RU")
}

// Форматирование цены
export function formatPrice(priceData: PriceData): string {
  const symbol = CURRENCY_SYMBOLS[priceData.currency]
  const formattedValue = formatNumber(priceData.value)
  
  switch (priceData.type) {
    case "fixed":
      return `${formattedValue}${symbol}`
    case "from":
      return `От ${formattedValue}${symbol}`
    case "range":
      const formattedValueTo = priceData.valueTo ? formatNumber(priceData.valueTo) : ""
      return `${formattedValue} - ${formattedValueTo}${symbol}`
    default:
      return `${formattedValue}${symbol}`
  }
}

export interface Product {
  id: number
  slug: string
  title: string
  category: string
  description: string
  fullDescription: string
  image: string
  price: string // отформатированная строка для отображения
  priceData: PriceData // структурированные данные цены
  specificationFile?: string
  specs: ProductSpec[]
  benefits: string[] // преимущества
  has3DModel?: boolean
  modelType?: string
  showOnHomepage: boolean
}

// Начальные товары
const initialProducts: Product[] = [
  {
    id: 1,
    slug: "armored-shutters",
    title: "Бронированные Ставни",
    category: "Жилой",
    description: "Автоматизированные стальные ставни, способные выдержать ураганный ветер и баллистические удары.",
    fullDescription: `Наши бронированные ставни — это передовое решение для защиты жилых и коммерческих объектов. 
    
Изготовленные из высокопрочной стали толщиной 6мм, они обеспечивают защиту от:
• Баллистических угроз до класса BR4
• Ураганного ветра до 250 км/ч
• Взлома и несанкционированного проникновения
• Экстремальных температур

Автоматизированная система управления позволяет открывать и закрывать ставни одним нажатием кнопки или интегрировать их в систему умного дома.`,
    image: "/steel-shutters.jpg",
    price: "От 2,500₽",
    priceData: { type: "from", currency: "RUB", value: 2500 },
    specificationFile: "/specifications/armored-shutters.pdf",
    specs: [
      { label: "Материал", value: "Сталь 6мм" },
      { label: "Класс защиты", value: "BR4" },
      { label: "Ветровая нагрузка", value: "до 250 км/ч" },
      { label: "Управление", value: "Автоматическое" },
      { label: "Гарантия", value: "10 лет" },
    ],
    benefits: [...DEFAULT_BENEFITS],
    has3DModel: true,
    modelType: "shutters",
    showOnHomepage: true,
  },
  {
    id: 2,
    slug: "safe-cell-container",
    title: "Контейнер Safe-Cell",
    category: "Модульный",
    description:
      "Модуль комнаты безопасности, который встраивается в существующие структуры или закапывается под землю.",
    fullDescription: `Safe-Cell — это модульная защитная капсула, разработанная для быстрого развертывания в любых условиях.

Контейнер может быть установлен:
• Внутри существующего здания
• Закопан под землю на глубину до 3 метров
• Установлен как отдельно стоящая структура

Особенности:
• Полностью автономная система жизнеобеспечения на 72 часа
• Фильтрация воздуха класса HEPA
• Защита от электромагнитного импульса (EMP)
• Встроенная система связи
• Запас воды и провизии`,
    image: "/shipping-container-bunker.jpg",
    price: "От 15,000₽",
    priceData: { type: "from", currency: "RUB", value: 15000 },
    specificationFile: "/specifications/safe-cell-container.pdf",
    specs: [
      { label: "Размеры", value: "6 x 2.4 x 2.6 м" },
      { label: "Вместимость", value: "до 8 человек" },
      { label: "Автономность", value: "72 часа" },
      { label: "Фильтрация", value: "HEPA + NBC" },
      { label: "Гарантия", value: "15 лет" },
    ],
    benefits: [...DEFAULT_BENEFITS],
    has3DModel: true,
    modelType: "container",
    showOnHomepage: true,
  },
  {
    id: 3,
    slug: "fortress-alpha",
    title: "Крепость Альфа",
    category: "Бункер",
    description: "Полномасштабный подземный комплекс выживания с независимыми системами питания и фильтрации.",
    fullDescription: `Крепость Альфа — это вершина инженерной мысли в области защитных сооружений. Полномасштабный подземный комплекс, способный обеспечить автономное существование на срок до 1 года.

Комплекс включает:
• Жилые модули на 12-20 человек
• Командный центр с системой мониторинга
• Медицинский блок
• Склад провизии и оборудования
• Независимую энергетическую систему
• Систему очистки воды замкнутого цикла

Защита обеспечивается от:
• Ядерного удара на расстоянии от 2 км
• Химического и биологического заражения
• Электромагнитного импульса
• Длительной осады`,
    image: "/underground-bunker-interior.jpg",
    price: "От 85,000₽",
    priceData: { type: "from", currency: "RUB", value: 85000 },
    specificationFile: "/specifications/fortress-alpha.pdf",
    specs: [
      { label: "Глубина", value: "до 15 метров" },
      { label: "Площадь", value: "от 200 м²" },
      { label: "Вместимость", value: "12-20 человек" },
      { label: "Автономность", value: "до 1 года" },
      { label: "Гарантия", value: "25 лет" },
    ],
    benefits: [...DEFAULT_BENEFITS],
    has3DModel: true,
    modelType: "bunker",
    showOnHomepage: true,
  },
]

interface ProductsContextType {
  products: Product[]
  homepageProducts: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void
  setHomepageProducts: (ids: number[]) => void
  getProductBySlug: (slug: string) => Product | undefined
  getProductById: (id: number) => Product | undefined
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

const STORAGE_KEY = "security1_products"

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isInitialized, setIsInitialized] = useState(false)

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Миграция: добавляем priceData и benefits если их нет
        const migratedProducts = parsed.map((p: Product & { numericPrice?: number }) => ({
          ...p,
          priceData: p.priceData || { 
            type: "from" as PriceType, 
            currency: "RUB" as Currency, 
            value: p.numericPrice || 0 
          },
          benefits: p.benefits || [...DEFAULT_BENEFITS],
          price: p.priceData ? formatPrice(p.priceData) : p.price
        }))
        setProducts(migratedProducts)
      } catch (e) {
        console.error("Failed to parse stored products:", e)
        setProducts(initialProducts)
      }
    }
    setIsInitialized(true)
  }, [])

  // Сохранение в localStorage при изменении
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    }
  }, [products, isInitialized])

  const homepageProducts = products.filter((p) => p.showOnHomepage).slice(0, 3)

  const addProduct = (productData: Omit<Product, "id">) => {
    const newId = Math.max(...products.map((p) => p.id), 0) + 1
    const newProduct: Product = {
      ...productData,
      id: newId,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    )
  }

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const setHomepageProducts = (ids: number[]) => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        showOnHomepage: ids.includes(p.id),
      }))
    )
  }

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug)
  }

  const getProductById = (id: number) => {
    return products.find((p) => p.id === id)
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        homepageProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        setHomepageProducts,
        getProductBySlug,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}

