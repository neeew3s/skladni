"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Lock, 
  LogOut, 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Home, 
  Save, 
  X, 
  Eye,
  Star,
  StarOff,
  ChevronDown,
  ImageIcon,
  FileText,
  Box,
  Palette,
  PhoneCall
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/file-upload"
import { DesignEditor } from "@/components/design-editor"
import { useDesign } from "@/lib/design-context"
import { useConsultations } from "@/lib/consultations-context"
import { 
  useProducts, 
  Product, 
  ProductSpec, 
  PriceData, 
  Currency, 
  PriceType, 
  DEFAULT_BENEFITS,
  CURRENCY_SYMBOLS,
  formatPrice,
  formatNumber
} from "@/lib/products-context"

// Учетные данные
const ADMIN_LOGIN = "admin_security"
const ADMIN_PASSWORD = "admin12019"
const AUTH_STORAGE_KEY = "security1_admin_auth"

// Категории товаров
const CATEGORIES = ["Жилой", "Модульный", "Бункер", "Промышленный", "Военный"]

// Типы 3D моделей
const MODEL_TYPES = [
  { value: "none", label: "Без 3D модели" },
  { value: "shutters", label: "Ставни" },
  { value: "container", label: "Контейнер" },
  { value: "bunker", label: "Бункер" },
]

interface ProductFormData {
  title: string
  slug: string
  category: string
  description: string
  fullDescription: string
  image: string
  priceData: PriceData
  specificationFile: string
  specs: ProductSpec[]
  benefits: string[]
  has3DModel: boolean
  modelType: string
  showOnHomepage: boolean
}

const emptyProduct: ProductFormData = {
  title: "",
  slug: "",
  category: "Жилой",
  description: "",
  fullDescription: "",
  image: "",
  priceData: { type: "fixed", currency: "RUB", value: 0 },
  specificationFile: "",
  specs: [{ label: "", value: "" }],
  benefits: [...DEFAULT_BENEFITS],
  has3DModel: false,
  modelType: "none",
  showOnHomepage: false,
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState("")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  
  const { 
    products, 
    homepageProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setHomepageProducts 
  } = useProducts()

  const { consultations } = useConsultations()

  const { 
    settings: designSettings, 
    backups: designBackups,
    applySettings: applyDesignSettings, 
    createBackup: createDesignBackup,
    restoreBackup: restoreDesignBackup,
    deleteBackup: deleteDesignBackup
  } = useDesign()

  // Состояния для диалогов
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isHomepageDialogOpen, setIsHomepageDialogOpen] = useState(false)
  const [isDesignEditorOpen, setIsDesignEditorOpen] = useState(false)
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProduct)
  const [selectedHomepageIds, setSelectedHomepageIds] = useState<number[]>([])

  // Проверка авторизации при загрузке
  useEffect(() => {
    const auth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (auth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // Обработка входа
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_STORAGE_KEY, "true")
      setLoginError("")
    } else {
      setLoginError("Неверный логин или пароль")
    }
  }

  // Обработка выхода
  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setLogin("")
    setPassword("")
  }

  // Генерация slug из названия
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
          'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        }
        return map[char] || char
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Обработка изменения заголовка с автогенерацией slug
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  // Добавление спецификации
  const addSpec = () => {
    setFormData({
      ...formData,
      specs: [...formData.specs, { label: "", value: "" }]
    })
  }

  // Удаление спецификации
  const removeSpec = (index: number) => {
    setFormData({
      ...formData,
      specs: formData.specs.filter((_, i) => i !== index)
    })
  }

  // Обновление спецификации
  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...formData.specs]
    newSpecs[index][field] = value
    setFormData({ ...formData, specs: newSpecs })
  }

  // Добавление преимущества
  const addBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ""]
    })
  }

  // Удаление преимущества
  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    })
  }

  // Обновление преимущества
  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits]
    newBenefits[index] = value
    setFormData({ ...formData, benefits: newBenefits })
  }

  // Сброс преимуществ к стандартным
  const resetBenefits = () => {
    setFormData({ ...formData, benefits: [...DEFAULT_BENEFITS] })
  }

  // Открытие диалога добавления
  const openAddDialog = () => {
    setFormData(emptyProduct)
    setIsAddDialogOpen(true)
  }

  // Открытие диалога редактирования
  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      slug: product.slug,
      category: product.category,
      description: product.description,
      fullDescription: product.fullDescription,
      image: product.image,
      priceData: product.priceData || { type: "fixed", currency: "RUB", value: 0 },
      specificationFile: product.specificationFile || "",
      specs: product.specs.length > 0 ? product.specs : [{ label: "", value: "" }],
      benefits: product.benefits?.length > 0 ? product.benefits : [...DEFAULT_BENEFITS],
      has3DModel: product.has3DModel || false,
      modelType: product.modelType || "none",
      showOnHomepage: product.showOnHomepage,
    })
    setIsEditDialogOpen(true)
  }

  // Сохранение нового товара
  const handleAddProduct = () => {
    const cleanedSpecs = formData.specs.filter(s => s.label && s.value)
    const cleanedBenefits = formData.benefits.filter(b => b.trim() !== "")
    addProduct({
      ...formData,
      price: formatPrice(formData.priceData),
      specs: cleanedSpecs,
      benefits: cleanedBenefits,
      has3DModel: formData.modelType !== "none",
    })
    setIsAddDialogOpen(false)
    setFormData(emptyProduct)
  }

  // Сохранение изменений товара
  const handleUpdateProduct = () => {
    if (!editingProduct) return
    const cleanedSpecs = formData.specs.filter(s => s.label && s.value)
    const cleanedBenefits = formData.benefits.filter(b => b.trim() !== "")
    updateProduct(editingProduct.id, {
      ...formData,
      price: formatPrice(formData.priceData),
      specs: cleanedSpecs,
      benefits: cleanedBenefits,
      has3DModel: formData.modelType !== "none",
    })
    setIsEditDialogOpen(false)
    setEditingProduct(null)
    setFormData(emptyProduct)
  }

  // Удаление товара
  const handleDeleteProduct = () => {
    if (deletingProductId !== null) {
      deleteProduct(deletingProductId)
      setIsDeleteDialogOpen(false)
      setDeletingProductId(null)
    }
  }

  // Открытие диалога управления главной страницей
  const openHomepageDialog = () => {
    setSelectedHomepageIds(homepageProducts.map(p => p.id))
    setIsHomepageDialogOpen(true)
  }

  // Сохранение выбора товаров для главной
  const handleSaveHomepageProducts = () => {
    setHomepageProducts(selectedHomepageIds)
    setIsHomepageDialogOpen(false)
  }

  // Переключение товара для главной страницы
  const toggleHomepageProduct = (productId: number) => {
    if (selectedHomepageIds.includes(productId)) {
      setSelectedHomepageIds(selectedHomepageIds.filter(id => id !== productId))
    } else if (selectedHomepageIds.length < 3) {
      setSelectedHomepageIds([...selectedHomepageIds, productId])
    }
  }

  // Быстрое переключение showOnHomepage
  const quickToggleHomepage = (product: Product) => {
    const currentHomepageCount = products.filter(p => p.showOnHomepage).length
    if (!product.showOnHomepage && currentHomepageCount >= 3) {
      return // Максимум 3 товара
    }
    updateProduct(product.id, { showOnHomepage: !product.showOnHomepage })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Форма входа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-zinc-800 bg-zinc-900/90 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-heading text-foreground">АДМИН-ПАНЕЛЬ</CardTitle>
              <CardDescription>Введите учетные данные для входа</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login">Логин</Label>
                  <Input
                    id="login"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Введите логин"
                    className="bg-zinc-800 border-zinc-700"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="bg-zinc-800 border-zinc-700"
                    autoComplete="current-password"
                  />
                </div>
                {loginError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 text-center"
                  >
                    {loginError}
                  </motion.p>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Войти
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ← Вернуться на сайт
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Админ-панель
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Шапка */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-heading font-bold text-foreground">АДМИН-ПАНЕЛЬ</h1>
                <p className="text-xs text-muted-foreground hidden md:block">Управление сайтом</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="outline" size="sm" asChild className="border-zinc-700 px-2 md:px-4">
                <Link href="/">
                  <Home className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">На сайт</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-2 md:px-4">
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-zinc-800/50 border border-zinc-700 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-3">
              <Package className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
              <span className="truncate">Продукция</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-3">
              <Palette className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
              <span className="truncate">Дизайн</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm px-3">
              <PhoneCall className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
              <span className="truncate">Консультации</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Статистика и действия */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Всего товаров</p>
                      <p className="text-3xl font-bold text-foreground">{products.length}</p>
                    </div>
                    <Package className="w-10 h-10 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">На главной</p>
                      <p className="text-3xl font-bold text-foreground">{homepageProducts.length}/3</p>
                    </div>
                    <Star className="w-10 h-10 text-yellow-500/50" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6 flex items-center justify-center h-full">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 text-sm">
                      <Plus className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
                      <span className="whitespace-nowrap">Добавить товар</span>
                    </Button>
                    <Button variant="outline" onClick={openHomepageDialog} className="border-zinc-700 text-sm">
                      <Star className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
                      <span className="whitespace-nowrap">Главная</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список товаров */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Список товаров
                </CardTitle>
                <CardDescription>
                  Управляйте товарами: редактируйте, удаляйте или добавляйте на главную страницу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                      >
                        {/* Превью изображения */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                          <Image
                            src={product.image || "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Информация о товаре */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{product.title}</h3>
                            {product.showOnHomepage && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <Star className="w-3 h-3 mr-1" />
                                На главной
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="border-zinc-600 text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-sm font-mono text-primary">{product.price}</span>
                            {product.has3DModel && (
                              <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                                <Box className="w-3 h-3 mr-1" />
                                3D
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Действия */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => quickToggleHomepage(product)}
                            className={product.showOnHomepage ? "text-yellow-500 hover:text-yellow-400" : "text-muted-foreground hover:text-foreground"}
                            title={product.showOnHomepage ? "Убрать с главной" : "Добавить на главную"}
                          >
                            {product.showOnHomepage ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="text-muted-foreground hover:text-foreground"
                            title="Просмотреть"
                          >
                            <Link href={`/products/${product.slug}`} target="_blank">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Редактировать"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingProductId(product.id)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {products.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Товары не найдены</p>
                      <Button onClick={openAddDialog} variant="link" className="mt-2">
                        Добавить первый товар
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка Консультации */}
          <TabsContent value="consultations" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5" />
                  Заявки на консультацию
                </CardTitle>
                <CardDescription>
                  Все обращения, отправленные пользователями через форму на главной странице
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 && (
                  <p className="text-sm text-muted-foreground">Пока нет ни одной заявки на консультацию.</p>
                )}
                {consultations.length > 0 && (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {consultations.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString("ru-RU")}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>Телефон: <span className="font-mono text-foreground">{item.phone}</span></p>
                            <p>Город: <span className="text-foreground">{item.city}</span></p>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground mb-1">Намерения:</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {item.intent}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка Дизайн */}
          <TabsContent value="design" className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Настройки дизайна
                </CardTitle>
                <CardDescription>
                  Настройте внешний вид сайта: цвета, скругления и другие элементы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Превью текущих настроек */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Основной цвет</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-zinc-600"
                          style={{ backgroundColor: designSettings.colors.primary }}
                        />
                        <span className="text-sm font-mono">{designSettings.colors.primary}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Фон</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-zinc-600"
                          style={{ backgroundColor: designSettings.colors.background }}
                        />
                        <span className="text-sm font-mono">{designSettings.colors.background}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Текст</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-zinc-600"
                          style={{ backgroundColor: designSettings.colors.foreground }}
                        />
                        <span className="text-sm font-mono">{designSettings.colors.foreground}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Скругление</p>
                      <span className="text-sm">{designSettings.borderRadius}px</span>
                    </div>
                  </div>

                  {/* Резервные копии */}
                  {designBackups.length > 0 && (
                    <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">Резервные копии ({designBackups.length}/5)</p>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {designBackups.map((backup) => (
                          <div key={backup.id} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium">{backup.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(backup.createdAt).toLocaleString("ru-RU")}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => restoreDesignBackup(backup.id)}
                                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                >
                                  Восстановить
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteDesignBackup(backup.id)}
                                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {/* Превью цветовой гаммы */}
                            <div className="flex gap-1">
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.primary }}
                                title="Основной цвет"
                              />
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.background }}
                                title="Фон"
                              />
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.foreground }}
                                title="Текст"
                              />
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.accent }}
                                title="Акцент"
                              />
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.card }}
                                title="Карточки"
                              />
                              <div 
                                className="w-6 h-6 rounded border border-zinc-600" 
                                style={{ backgroundColor: backup.settings.colors.muted }}
                                title="Приглушённый фон"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => setIsDesignEditorOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Открыть редактор дизайна
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Редактор дизайна */}
      {isDesignEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-zinc-950">
          <DesignEditor
            initialSettings={designSettings}
            backups={designBackups}
            onApply={(newSettings, shouldCreateBackup, backupName) => {
              // Сначала закрываем редактор
              setIsDesignEditorOpen(false)
              
              // Затем применяем настройки с небольшой задержкой
              setTimeout(() => {
                if (shouldCreateBackup && backupName) {
                  createDesignBackup(backupName)
                }
                applyDesignSettings(newSettings)
              }, 50)
            }}
            onCancel={() => setIsDesignEditorOpen(false)}
            onRestoreBackup={restoreDesignBackup}
            onDeleteBackup={deleteDesignBackup}
          />
        </div>
      )}

      {/* Диалог добавления товара */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Добавить товар
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о новом товаре
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">Название *</Label>
                <Input
                  id="add-title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Название товара"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-slug">URL-адрес (slug)</Label>
                <Input
                  id="add-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-adres"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Цена */}
            <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <Label className="text-base font-semibold">Цена *</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Тип цены</Label>
                  <Select
                    value={formData.priceData.type}
                    onValueChange={(value: PriceType) => setFormData({ 
                      ...formData, 
                      priceData: { ...formData.priceData, type: value } 
                    })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="fixed">Фиксированная</SelectItem>
                      <SelectItem value="from">От (минимальная)</SelectItem>
                      <SelectItem value="range">Диапазон</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Валюта</Label>
                  <Select
                    value={formData.priceData.currency}
                    onValueChange={(value: Currency) => setFormData({ 
                      ...formData, 
                      priceData: { ...formData.priceData, currency: value } 
                    })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="RUB">₽ Рубль</SelectItem>
                      <SelectItem value="USD">$ Доллар</SelectItem>
                      <SelectItem value="EUR">€ Евро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {formData.priceData.type === "range" ? "Цена от" : "Сумма"}
                  </Label>
                  <Input
                    type="text"
                    value={formData.priceData.value ? formatNumber(formData.priceData.value) : ""}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0
                      setFormData({ 
                        ...formData, 
                        priceData: { ...formData.priceData, value: numValue } 
                      })
                    }}
                    placeholder="10,000"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              {formData.priceData.type === "range" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Цена до</Label>
                  <Input
                    type="text"
                    value={formData.priceData.valueTo ? formatNumber(formData.priceData.valueTo) : ""}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0
                      setFormData({ 
                        ...formData, 
                        priceData: { ...formData.priceData, valueTo: numValue } 
                      })
                    }}
                    placeholder="50,000"
                    className="bg-zinc-800 border-zinc-700 max-w-[200px]"
                  />
                </div>
              )}

              {/* Превью цены */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-700/50">
                <span className="text-xs text-muted-foreground">Превью:</span>
                <span className="text-sm font-mono text-primary">
                  {formData.priceData.value > 0 ? formatPrice(formData.priceData) : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Краткое описание *</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание для карточки товара"
                className="bg-zinc-800 border-zinc-700 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-fullDescription">Полное описание</Label>
              <Textarea
                id="add-fullDescription"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="Детальное описание товара для страницы товара"
                className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              />
            </div>

            {/* Медиа */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Изображение превью *
                </Label>
                <FileUpload
                  type="image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Загрузить изображение товара"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Файл спецификации
                </Label>
                <FileUpload
                  type="document"
                  value={formData.specificationFile}
                  onChange={(url) => setFormData({ ...formData, specificationFile: url })}
                  placeholder="Загрузить спецификацию"
                />
              </div>
            </div>

            {/* 3D Модель */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                3D Модель
              </Label>
              <Select
                value={formData.modelType}
                onValueChange={(value) => setFormData({ ...formData, modelType: value, has3DModel: value !== "none" })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Выберите тип модели" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {MODEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Спецификации */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Технические характеристики</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="border-zinc-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={spec.label}
                      onChange={(e) => updateSpec(index, 'label', e.target.value)}
                      placeholder="Параметр"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      placeholder="Значение"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    {formData.specs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="text-red-500 hover:text-red-400 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Преимущества */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Преимущества
                </Label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={resetBenefits} className="text-xs text-muted-foreground hover:text-foreground">
                    Сбросить
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="border-zinc-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Введите преимущество"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefit(index)}
                      className="text-red-500 hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Показ на главной */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <Label htmlFor="add-homepage">Показать на главной странице</Label>
                  <p className="text-xs text-muted-foreground">Товар будет отображаться в разделе "Линейка продукции"</p>
                </div>
              </div>
              <Switch
                id="add-homepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => setFormData({ ...formData, showOnHomepage: checked })}
                disabled={!formData.showOnHomepage && homepageProducts.length >= 3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-zinc-700">
              Отмена
            </Button>
            <Button 
              onClick={handleAddProduct} 
              disabled={!formData.title || !formData.category || formData.priceData.value <= 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Добавить товар
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования товара */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Редактировать товар
            </DialogTitle>
            <DialogDescription>
              Измените информацию о товаре
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Название *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название товара"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">URL-адрес (slug)</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-adres"
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Цена */}
            <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <Label className="text-base font-semibold">Цена *</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Тип цены</Label>
                  <Select
                    value={formData.priceData.type}
                    onValueChange={(value: PriceType) => setFormData({ 
                      ...formData, 
                      priceData: { ...formData.priceData, type: value } 
                    })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="fixed">Фиксированная</SelectItem>
                      <SelectItem value="from">От (минимальная)</SelectItem>
                      <SelectItem value="range">Диапазон</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Валюта</Label>
                  <Select
                    value={formData.priceData.currency}
                    onValueChange={(value: Currency) => setFormData({ 
                      ...formData, 
                      priceData: { ...formData.priceData, currency: value } 
                    })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="RUB">₽ Рубль</SelectItem>
                      <SelectItem value="USD">$ Доллар</SelectItem>
                      <SelectItem value="EUR">€ Евро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {formData.priceData.type === "range" ? "Цена от" : "Сумма"}
                  </Label>
                  <Input
                    type="text"
                    value={formData.priceData.value ? formatNumber(formData.priceData.value) : ""}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0
                      setFormData({ 
                        ...formData, 
                        priceData: { ...formData.priceData, value: numValue } 
                      })
                    }}
                    placeholder="10,000"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              {formData.priceData.type === "range" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Цена до</Label>
                  <Input
                    type="text"
                    value={formData.priceData.valueTo ? formatNumber(formData.priceData.valueTo) : ""}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0
                      setFormData({ 
                        ...formData, 
                        priceData: { ...formData.priceData, valueTo: numValue } 
                      })
                    }}
                    placeholder="50,000"
                    className="bg-zinc-800 border-zinc-700 max-w-[200px]"
                  />
                </div>
              )}

              {/* Превью цены */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-700/50">
                <span className="text-xs text-muted-foreground">Превью:</span>
                <span className="text-sm font-mono text-primary">
                  {formData.priceData.value > 0 ? formatPrice(formData.priceData) : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Краткое описание *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание для карточки товара"
                className="bg-zinc-800 border-zinc-700 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fullDescription">Полное описание</Label>
              <Textarea
                id="edit-fullDescription"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="Детальное описание товара для страницы товара"
                className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              />
            </div>

            {/* Медиа */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Изображение превью *
                </Label>
                <FileUpload
                  type="image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Загрузить изображение товара"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Файл спецификации
                </Label>
                <FileUpload
                  type="document"
                  value={formData.specificationFile}
                  onChange={(url) => setFormData({ ...formData, specificationFile: url })}
                  placeholder="Загрузить спецификацию"
                />
              </div>
            </div>

            {/* 3D Модель */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                3D Модель
              </Label>
              <Select
                value={formData.modelType}
                onValueChange={(value) => setFormData({ ...formData, modelType: value, has3DModel: value !== "none" })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Выберите тип модели" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {MODEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Спецификации */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Технические характеристики</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="border-zinc-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-2">
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={spec.label}
                      onChange={(e) => updateSpec(index, 'label', e.target.value)}
                      placeholder="Параметр"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      placeholder="Значение"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    {formData.specs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="text-red-500 hover:text-red-400 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Преимущества */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Преимущества
                </Label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={resetBenefits} className="text-xs text-muted-foreground hover:text-foreground">
                    Сбросить
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addBenefit} className="border-zinc-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Введите преимущество"
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefit(index)}
                      className="text-red-500 hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Показ на главной */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <Label htmlFor="edit-homepage">Показать на главной странице</Label>
                  <p className="text-xs text-muted-foreground">Товар будет отображаться в разделе "Линейка продукции"</p>
                </div>
              </div>
              <Switch
                id="edit-homepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => setFormData({ ...formData, showOnHomepage: checked })}
                disabled={!formData.showOnHomepage && homepageProducts.length >= 3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-zinc-700">
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateProduct} 
              disabled={!formData.title || !formData.category || formData.priceData.value <= 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Товар будет удален из каталога.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог управления главной страницей */}
      <Dialog open={isHomepageDialogOpen} onOpenChange={setIsHomepageDialogOpen}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Товары на главной странице
            </DialogTitle>
            <DialogDescription>
              Выберите до 3 товаров для отображения в разделе "Линейка продукции"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Выбрано: <span className="text-foreground font-medium">{selectedHomepageIds.length}/3</span>
              </p>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => toggleHomepageProduct(product.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedHomepageIds.includes(product.id)
                      ? "bg-primary/20 border border-primary/50"
                      : "bg-zinc-800/50 border border-transparent hover:border-zinc-600"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  {selectedHomepageIds.includes(product.id) && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHomepageDialogOpen(false)} className="border-zinc-700">
              Отмена
            </Button>
            <Button onClick={handleSaveHomepageProducts} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

