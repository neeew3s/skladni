import { DesktopHome } from "@/components/desktop-home"
import { MobileHome } from "@/components/mobile-home"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Desktop Layout - visible on medium screens and up */}
      <div className="hidden md:block">
        <DesktopHome />
      </div>

      {/* Mobile Layout - visible on small screens */}
      <div className="block md:hidden">
        <MobileHome />
      </div>
    </main>
  )
}
