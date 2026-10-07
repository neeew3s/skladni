import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Lock, Zap } from "lucide-react"
import { EditableText } from "@/components/ui/editable-text"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#121212] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#121212] to-[#000000] opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      </div>

      <div className="container mx-auto px-4 z-10 relative flex flex-col items-center flex-grow">
        
        {/* Main Content Wrapper with Custom Background */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center py-20 lg:py-32">
            {/* Dynamic Background */}
            <div 
                className="absolute inset-0 -z-10 w-screen left-1/2 -translate-x-1/2 transition-all duration-300"
                style={{
                    backgroundImage: "var(--hero-image, none)",
                    backgroundSize: "cover",
                    backgroundPosition: "var(--hero-pos-x, 50%) var(--hero-pos-y, 50%)",
                    backgroundRepeat: "no-repeat",
                    opacity: "var(--hero-opacity, 0.5)",
                    maskImage: "linear-gradient(to right, transparent, black var(--hero-fade-width, 20%), black calc(100% - var(--hero-fade-width, 20%)), transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black var(--hero-fade-width, 20%), black calc(100% - var(--hero-fade-width, 20%)), transparent)"
                }}
            />
            
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <EditableText id="hero-badge" defaultText="ЗАЩИТА ВОЕННОГО КЛАССА" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-white mb-6 leading-normal tracking-tighter pb-2">
          <EditableText id="hero-title-1" defaultText="ЗАЩИТИТЕ СВОЕ" /> <br />
          <EditableText 
            id="hero-title-2" 
            defaultText="ИМУЩЕСТВО" 
            className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 inline-block pb-1"
          />
        </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            <EditableText 
              id="hero-description" 
              defaultText="Передовые бронированные ставни, модульные контейнеры и жилые бункеры, разработанные для современных угроз." 
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[200px]">
              <EditableText id="hero-btn-config" defaultText="Конфигуратор" />
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="min-w-[200px]"
            >
              <Link href="/catalog">
                <EditableText id="hero-btn-catalog" defaultText="Каталог" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl border-t border-white/10 pt-8 pb-10 text-center">
          <div className="flex flex-col items-center gap-2 group">
            <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
              <ShieldCheck className="w-8 h-8 text-primary mb-2" />
            </div>
            <h3 className="text-lg font-bold text-white">
              <EditableText id="feature-1-title" defaultText="Баллистическая защита" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <EditableText id="feature-1-desc" defaultText="Сертифицировано по стандартам защиты NIJ Level IV." />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 group">
            <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
              <Zap className="w-8 h-8 mb-2 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white">
              <EditableText id="feature-2-title" defaultText="ЭМИ Экранирование" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <EditableText id="feature-2-desc" defaultText="Интеграция клетки Фарадея для защиты электроники." />
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 group">
            <div className="md:transition-all md:duration-300 md:group-hover:scale-110 group-hover:drop-shadow-primary">
              <Lock className="w-8 h-8 text-primary mb-2" />
            </div>
            <h3 className="text-lg font-bold text-white">
              <EditableText id="feature-3-title" defaultText="Биометрический доступ" />
            </h3>
            <p className="text-sm text-muted-foreground">
              <EditableText id="feature-3-desc" defaultText="Передовые системы входа со сканированием сетчатки." />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
