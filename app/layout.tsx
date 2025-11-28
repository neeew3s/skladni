import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Condensed } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { ProductsProvider } from "@/lib/products-context"
import { DesignProvider } from "@/lib/design-context"
import { ConsultationsProvider } from "@/lib/consultations-context"
import "./globals.css"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${robotoCondensed.variable} font-sans antialiased`}>
        <DesignProvider>
          <ProductsProvider>
            <ConsultationsProvider>
              <CartProvider>{children}</CartProvider>
            </ConsultationsProvider>
          </ProductsProvider>
        </DesignProvider>
        <Analytics />
      </body>
    </html>
  )
}
