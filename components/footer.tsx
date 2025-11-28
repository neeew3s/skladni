import Link from "next/link"
import { X } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full py-6 bg-[#0a0a0a] border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© 2025 FORTRESS. Все права защищены.</p>

        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <span>Developed by</span>
          <Link
            href="https://github.com/volk307791-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline transition-colors"
          >
            New3s
          </Link>
          <X className="w-3 h-3 text-muted-foreground" />
          <Link
            href="https://github.com/niodyouwoh?"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline transition-colors"
          >
            niodyouwoh
          </Link>
        </div>
      </div>
    </footer>
  )
}
