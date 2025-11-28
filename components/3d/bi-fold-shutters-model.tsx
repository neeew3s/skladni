"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Annotation } from "./annotation"

const frameMaterial = <meshStandardMaterial color="#222222" roughness={0.8} />
const panelMaterial = <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.6} />
const steelMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
const glassMaterial = <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.9} opacity={0.3} transparent />

interface BiFoldShuttersModelProps {
  mode: "standard" | "exploded" | "section"
  isOpen: boolean
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  specs?: Record<string, any>
}

export function BiFoldShuttersModel({ mode, isOpen, onPartHover, showAnnotations, specs }: BiFoldShuttersModelProps) {
  const topPanelRef = useRef<THREE.Group>(null)
  const bottomPanelRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const expansionRef = useRef(0)
  const frameRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    // Animation target: 0 when closed, PI/2 (90 deg) ish when open
    // Bi-fold motion: Top panel rotates UP (outwards), Bottom panel follows.
    const targetAngle = isOpen ? Math.PI / 2.2 : 0
    angleRef.current = THREE.MathUtils.lerp(angleRef.current, targetAngle, delta * 2)

    const targetExpansion = mode === "exploded" ? 1 : 0
    expansionRef.current = THREE.MathUtils.lerp(expansionRef.current, targetExpansion, delta * 4)

    // Apply rotations
    if (topPanelRef.current) {
      // Top panel rotates around its top edge
      topPanelRef.current.rotation.x = -angleRef.current
    }

    if (bottomPanelRef.current) {
      // Bottom panel rotates relative to top panel to fold
      // When fully open (top panel horizontal), bottom panel should hang or fold flat?
      // Let's make it fold slightly inwards to form a "roof" or awning shape
      bottomPanelRef.current.rotation.x = angleRef.current * 2 // Folds back against the top panel
    }

    // Exploded view expansion
    const e = expansionRef.current
    if (frameRef.current) frameRef.current.position.z = -e * 0.5
    if (topPanelRef.current) topPanelRef.current.position.z = e * 0.5
  })

  const getSpecs = (name: string) => specs?.[name] || {}

  return (
    <group dispose={null}>
      {/* Static Wall/Window Frame */}
      <group ref={frameRef} visible={mode !== "section"}>
        {/* Top Frame */}
        <mesh
          position={[0, 1.05, 0]}
          onPointerOver={(e) => {
            e.stopPropagation()
            onPartHover("Несущая рама")
          }}
          onPointerOut={() => onPartHover(null)}
        >
          <boxGeometry args={[2.2, 0.2, 0.4]} />
          {frameMaterial}
          {showAnnotations && (
            <Annotation
              title="Несущая рама"
              specs={getSpecs("Несущая рама")}
              visible={true}
              position={[0, 0, 0.2]}
              dx={0}
              dy={-80}
            />
          )}
        </mesh>
        {/* Side Frames */}
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[0.1, 2.1, 0.4]} />
          {frameMaterial}
        </mesh>
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[0.1, 2.1, 0.4]} />
          {frameMaterial}
        </mesh>
        {/* Bottom Sill */}
        <mesh position={[0, -1.05, 0]}>
          <boxGeometry args={[2.2, 0.2, 0.4]} />
          {frameMaterial}
        </mesh>
        {/* Glass */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[2, 2]} />
          {glassMaterial}
        </mesh>
      </group>

      {/* Bi-fold Mechanism - Top Pivot */}
      <group position={[0, 0.95, 0.2]}>
        {/* Top Panel Group */}
        <group ref={topPanelRef}>
          {/* The Panel Mesh - Centered relative to the pivot at (0,0,0) which is top of panel */}
          <group position={[0, -0.5, 0]}>
            {/* Panel Geometry */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation()
                onPartHover("Верхняя панель")
              }}
              onPointerOut={() => onPartHover(null)}
            >
              <boxGeometry args={[1.95, 0.95, 0.1]} />
              {panelMaterial}

              {/* Detail on panel */}
              <mesh position={[0, 0, 0.06]}>
                <boxGeometry args={[1.8, 0.8, 0.02]} />
                {steelMaterial}
              </mesh>

              {showAnnotations && (
                <Annotation
                  title="Верхняя панель"
                  specs={getSpecs("Верхняя панель")}
                  visible={true}
                  position={[0.5, 0.2, 0.05]}
                  dx={80}
                  dy={-30}
                />
              )}
            </mesh>

            {/* Hinge to Bottom Panel */}
            <group position={[0, -0.475, 0]}>
              <group ref={bottomPanelRef}>
                {/* Bottom Panel - Centered relative to its top hinge */}
                <group position={[0, -0.475, 0]}>
                  <mesh
                    onPointerOver={(e) => {
                      e.stopPropagation()
                      onPartHover("Нижняя панель")
                    }}
                    onPointerOut={() => onPartHover(null)}
                  >
                    <boxGeometry args={[1.95, 0.95, 0.1]} />
                    {panelMaterial}

                    {/* Detail on panel */}
                    <mesh position={[0, 0, 0.06]}>
                      <boxGeometry args={[1.8, 0.8, 0.02]} />
                      {steelMaterial}
                    </mesh>

                    {showAnnotations && (
                      <Annotation
                        title="Нижняя панель"
                        specs={getSpecs("Нижняя панель")}
                        visible={true}
                        position={[-0.5, -0.2, 0.05]}
                        dx={-80}
                        dy={30}
                      />
                    )}
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Side Tracks/Guides (Static) */}
      <mesh position={[-1.05, 0, 0.2]}>
        <boxGeometry args={[0.05, 1.9, 0.05]} />
        {steelMaterial}
      </mesh>
      <mesh position={[1.05, 0, 0.2]}>
        <boxGeometry args={[0.05, 1.9, 0.05]} />
        {steelMaterial}
      </mesh>
    </group>
  )
}
