"use client"

import type React from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, ContactShadows, PerspectiveCamera } from "@react-three/drei"
import { BunkerModel } from "./bunker-model"
import { BiFoldShuttersModel } from "./bi-fold-shutters-model"
import { ContainerModel } from "./container-model"
import { AccordionShuttersModel } from "./accordion-shutters-model" // Import new model
import { Suspense, useEffect, useRef, useState } from "react"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { Hand } from "lucide-react"

function CameraController({
  modelType,
  controlsRef,
}: {
  modelType: string
  controlsRef: React.RefObject<OrbitControlsImpl>
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current

      // We keep the logic simple here.
      camera.position.set(-4, 3, 8)
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [modelType, camera, controlsRef])

  return null
}

interface SceneViewerProps {
  mode: "standard" | "exploded" | "section"
  modelType: "bunker" | "shutters" | "container"
  shutterVariant?: "bifold" | "accordion"
  isOpen: boolean
  areLouvresOpen?: boolean
  onPartHover: (part: string | null) => void
  showAnnotations: boolean
  hoveredPart: string | null
  specs: Record<string, any>
  isMobile?: boolean // Added prop definition
}

export function SceneViewer({
  mode,
  modelType,
  shutterVariant = "bifold",
  isOpen,
  areLouvresOpen = false,
  onPartHover,
  showAnnotations,
  hoveredPart,
  specs,
  isMobile = false, // Default to false
}: SceneViewerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  const showOverlay = isMobile && !isInteracting
  const controlsEnabled = !isMobile || isInteracting

  const getModelScale = () => {
    if (!isMobile) return 1
    // Shutters: Increase by 2x from previous 0.5 (so 1.0)
    if (modelType === "shutters") return 1
    // Container: Increase by 1.5x from previous 0.5 (so 0.75)
    if (modelType === "container") return 0.75
    // Bunker: Keep as is (0.5)
    return 0.5
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-[#1a1a1a] to-[#000000] relative group">
      {showOverlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-colors touch-pan-y">
          <div
            className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-white/80 text-sm cursor-pointer hover:bg-black/80 transition-colors"
            onClick={() => setIsInteracting(true)}
            onTouchEnd={(e) => {
              e.preventDefault() // Prevent ghost clicks
              setIsInteracting(true)
            }}
          >
            <Hand className="w-4 h-4 animate-pulse" />
            <span>Нажмите для управления 3D</span>
          </div>
        </div>
      )}

      {isMobile && isInteracting && (
        <button
          className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/80 text-xs hover:bg-black/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsInteracting(false)
          }}
        >
          Вернуть прокрутку
        </button>
      )}

      <Canvas shadows dpr={[1, 2]} className={showOverlay ? "pointer-events-none" : ""}>
        <PerspectiveCamera makeDefault position={[-4, 3, 8]} fov={45} />
        <Suspense fallback={null}>
          {/* Bright lighting setup to simulate HDR environment */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={2.0} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-5, 8, -5]} intensity={1.2} />
          <directionalLight position={[0, -5, 5]} intensity={0.5} />
          <pointLight position={[-10, 5, -10]} intensity={0.8} color="#b0c4de" />
          <pointLight position={[10, 5, 10]} intensity={0.8} color="#ffffff" />
          <hemisphereLight intensity={1.0} color="#ffffff" groundColor="#666666" />

          <group position={[0, -0.5, 0]} scale={getModelScale()}>
            {modelType === "bunker" && (
              <BunkerModel
                mode={mode}
                isOpen={isOpen}
                onPartHover={onPartHover}
                showAnnotations={showAnnotations}
                hoveredPart={hoveredPart}
                specs={specs}
              />
            )}
            {modelType === "shutters" && shutterVariant === "bifold" && (
              <BiFoldShuttersModel
                mode={mode}
                isOpen={isOpen}
                onPartHover={onPartHover}
                showAnnotations={showAnnotations}
                specs={specs}
              />
            )}
            {modelType === "shutters" && shutterVariant === "accordion" && (
              <AccordionShuttersModel
                mode={mode}
                isOpen={isOpen}
                onPartHover={onPartHover}
                showAnnotations={showAnnotations}
                hoveredPart={hoveredPart}
                specs={specs}
              />
            )}
            {modelType === "container" && (
              <ContainerModel
                mode={mode}
                isOpen={isOpen}
                onPartHover={onPartHover}
                showAnnotations={showAnnotations}
                hoveredPart={hoveredPart}
                specs={specs}
              />
            )}
          </group>

          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" />

          <OrbitControls
            ref={controlsRef}
            enabled={controlsEnabled}
            enablePan={false}
            autoRotate={false}
            minDistance={4}
            maxDistance={30}
          />
          <CameraController modelType={modelType} controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}
