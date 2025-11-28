"use client"

import { Html } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface AnnotationProps {
  title: string
  specs: Record<string, string>
  visible: boolean
  position?: [number, number, number]
  dx?: number
  dy?: number
}

export function Annotation({ title, specs, visible, position = [0, 0, 0], dx = 40, dy = 0 }: AnnotationProps) {
  const isLeft = dx < 0

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const effectiveDx = isMobile ? Math.max(Math.min(dx * 0.4, 60), -60) : Math.max(Math.min(dx, 120), -120)
  const effectiveDy = isMobile ? Math.max(Math.min(dy * 0.4, 40), -40) : Math.max(Math.min(dy, 80), -80)

  return (
    <Html position={position} style={{ pointerEvents: "none" }} zIndexRange={[100, 0]}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Anchor Dot */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full annotation-dot" />

            {/* Connection Line SVG */}
            <svg className="absolute top-0 left-0 overflow-visible" style={{ pointerEvents: "none" }}>
              <line 
                x1="0" 
                y1="0" 
                x2={effectiveDx} 
                y2={effectiveDy} 
                stroke="var(--primary)" 
                strokeWidth="1" 
                opacity="0.8" 
              />
            </svg>

            {/* Data Card - Made card more compact */}
            <div
              className={`absolute bg-[#111111]/90 annotation-border border backdrop-blur-md shadow-xl text-left
                ${isMobile ? "p-1 min-w-[70px] max-w-[90px]" : "p-2 min-w-[100px] max-w-[140px]"}
              `}
              style={{
                transform: `translate(${effectiveDx}px, ${effectiveDy}px) translate(${isLeft ? "-100%" : "0"}, -50%)`,
              }}
            >
              <h4 className="annotation-text font-bold uppercase text-[8px] sm:text-[9px] tracking-wider mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {title}
              </h4>

              <div className="space-y-0.5">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className={`flex flex-col ${isMobile ? "hidden" : ""}`}>
                    <div className="text-[7px] sm:text-[8px] text-white/60 uppercase">{key}</div>
                    <div className="text-[8px] sm:text-[10px] font-mono text-white">{value}</div>
                  </div>
                ))}
                {isMobile && <div className="text-[6px] text-white/40 uppercase">Нажми для инфо</div>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  )
}
