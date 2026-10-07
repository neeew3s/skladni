import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Condensed } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { ProductsProvider } from "@/lib/products-context"
import { DesignProvider } from "@/lib/design-context"
import { ConsultationsProvider } from "@/lib/consultations-context"
import { ContentProvider } from "@/lib/content-context"
import { ContentEditor } from "@/components/admin/content-editor"
import { ConsultationDialog } from "@/components/consultation-dialog"
import { DEFAULT_DESIGN, generateCssVars } from "@/lib/design-utils"
import "./globals.css"
import fs from "fs/promises"
import path from "path"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FORTRESS | Advanced Armored Systems",
  description: "Premium armored shutters, containers, and residential bunkers.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Load content from file
  let initialContent = {}
  try {
    const filePath = path.join(process.cwd(), "data", "content.json")
    const data = await fs.readFile(filePath, "utf8")
    initialContent = JSON.parse(data)
  } catch (error) {
    // Ignore error if file doesn't exist
  }

  // Load design settings from file
  let initialDesign = undefined
  let cssVars = ""
  try {
    const designFilePath = path.join(process.cwd(), "data", "design.json")
    const designData = await fs.readFile(designFilePath, "utf8")
    const parsedDesign = JSON.parse(designData)
    
    // Merge with default design
    initialDesign = {
        ...DEFAULT_DESIGN,
        ...parsedDesign,
        hero: parsedDesign.hero ? { ...DEFAULT_DESIGN.hero, ...parsedDesign.hero } : DEFAULT_DESIGN.hero
    }
    cssVars = generateCssVars(initialDesign)
  } catch (error) {
    // If file doesn't exist or error, use default design
    cssVars = generateCssVars(DEFAULT_DESIGN)
  }

  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root, .dark { ${cssVars} }` }} />
      </head>
      <body className={`${inter.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <DesignProvider initialSettings={initialDesign}>
          <ProductsProvider>
            <ConsultationsProvider>
              <CartProvider>
                <ContentProvider initialContent={initialContent}>
                  {children}
                  <ContentEditor />
                  <ConsultationDialog />
                </ContentProvider>
              </CartProvider>
            </ConsultationsProvider>
          </ProductsProvider>
        </DesignProvider>
        <Analytics />
      </body>
    </html>
  )
}
