import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Lock, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#121212] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#121212] to-[#000000] opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            ЗАЩИТА ВОЕННОГО КЛАССА
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white mb-6 leading-tight tracking-tighter">
            ЗАЩИТИТЕ СВОЕ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">{"имущество"}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Передовые бронированные ставни, модульные контейнеры и жилые бункеры, разработанные для современных угроз.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[200px]">
              Конфигуратор
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 min-w-[200px] bg-transparent"
            >
              <Link href="/catalog">Каталог</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full border-t border-white/10 pt-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
              </div>
              <h3 className="text-lg font-bold text-white">Баллистическая защита</h3>
              <p className="text-sm text-muted-foreground">Сертифицировано по стандартам защиты NIJ Level IV.</p>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
                <Zap className="w-8 h-8 mb-2 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white">ЭМИ Экранирование</h3>
              <p className="text-sm text-muted-foreground">Интеграция клетки Фарадея для защиты электроники.</p>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
                <Lock className="w-8 h-8 text-primary mb-2" />
              </div>
              <h3 className="text-lg font-bold text-white">Биометрический доступ</h3>
              <p className="text-sm text-muted-foreground">Передовые системы входа со сканированием сетчатки.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
