"use client"

import type React from "react"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Annotation } from "./annotation"

const frameMaterial = <meshStandardMaterial color="#222222" roughness={0.8} />
const slatMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
const steelMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
const glassMaterial = <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.9} opacity={0.3} transparent />

const Slat = ({
  index,
  side,
  louvreAngleRef,
  onPartHover,
  showAnnotations,
  specs,
}: {
  index: number
  side: "left" | "right"
  louvreAngleRef: React.MutableRefObject<number>
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  specs: Record<string, any>
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = louvreAngleRef.current
    }
  })

  const yPos = 0.6 - index * 0.11

  // Only show Slats annotation on the LEFT shutter to avoid duplicates
  const showSlatAnnotation = index === 6 && showAnnotations && side === "left"

  return (
    <mesh
      ref={meshRef}
      position={[0, yPos, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onPartHover("Ламели")
      }}
      onPointerOut={() => onPartHover(null)}
    >
      <boxGeometry args={[0.82, 0.18, 0.004]} />
      {slatMaterial}

      {showSlatAnnotation && (
        <Annotation title="Ламели" specs={specs} visible={true} position={[0.2, 0, 0.002]} dx={150} dy={100} />
      )}
    </mesh>
  )
}

const ShutterWing = ({
  side,
  louvreAngleRef,
  onPartHover,
  showAnnotations,
  specs,
}: {
  side: "left" | "right"
  louvreAngleRef: React.MutableRefObject<number>
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  specs: Record<string, any>
}) => {
  const title = side === "left" ? "Левая створка" : "Правая створка"
  const wingSpecs = specs?.[title] || {}
  const slatSpecs = specs?.["Ламели"] || {}

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation()
        onPartHover(title)
      }}
      onPointerOut={() => onPartHover(null)}
    >
      {/* Frame - Top Rail */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1, 0.1, 0.06]} />
        {steelMaterial}
      </mesh>
      {/* Frame - Bottom Rail */}
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[1, 0.1, 0.06]} />
        {steelMaterial}
      </mesh>
      {/* Frame - Left Stile */}
      <mesh position={[-0.45, 0, 0]}>
        <boxGeometry args={[0.1, 1.4, 0.06]} />
        {steelMaterial}
      </mesh>
      {/* Frame - Right Stile */}
      <mesh position={[0.45, 0, 0]}>
        <boxGeometry args={[0.1, 1.4, 0.06]} />
        {steelMaterial}
      </mesh>

      {/* Slats */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Slat
          key={i}
          index={i}
          side={side}
          louvreAngleRef={louvreAngleRef}
          onPartHover={onPartHover}
          showAnnotations={showAnnotations}
          specs={slatSpecs}
        />
      ))}

      {showAnnotations && (
        <Annotation
          title={title}
          specs={wingSpecs}
          visible={true}
          position={[side === "left" ? -0.45 : 0.45, 0, 0.03]}
          dx={side === "left" ? -160 : 160}
          dy={side === "left" ? 0 : -40}
        />
      )}
    </group>
  )
}

interface ShuttersModelProps {
  mode: "standard" | "exploded" | "section"
  isOpen: boolean
  areLouvresOpen: boolean
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  hoveredPart?: string | null
  specs?: Record<string, any>
}

export function ShuttersModel({
  mode,
  isOpen,
  areLouvresOpen,
  onPartHover,
  showAnnotations,
  hoveredPart,
  specs,
}: ShuttersModelProps) {
  const leftShutterRef = useRef<THREE.Group>(null)
  const rightShutterRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const louvreAngleRef = useRef(0)
  const expansionRef = useRef(0)

  const frameRef = useRef<THREE.Group>(null)
  const leftGroupRef = useRef<THREE.Group>(null)
  const rightGroupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    // Main shutter angle
    const targetAngle = isOpen ? Math.PI * 0.85 : 0
    angleRef.current = THREE.MathUtils.lerp(angleRef.current, targetAngle, delta * 4)

    // Louvre angle
    const targetLouvreAngle = areLouvresOpen ? -Math.PI / 2 : -Math.PI / 6
    louvreAngleRef.current = THREE.MathUtils.lerp(louvreAngleRef.current, targetLouvreAngle, delta * 4)

    // Expansion for exploded view
    const targetExpansion = mode === "exploded" ? 1 : 0
    expansionRef.current = THREE.MathUtils.lerp(expansionRef.current, targetExpansion, delta * 4)

    // Apply shutter rotation
    if (leftShutterRef.current) leftShutterRef.current.rotation.y = -angleRef.current
    if (rightShutterRef.current) rightShutterRef.current.rotation.y = angleRef.current

    // Apply expansion animation
    const e = expansionRef.current
    if (frameRef.current) frameRef.current.position.z = -e * 0.5
    if (leftGroupRef.current) leftGroupRef.current.position.x = -1 - e * 1
    if (rightGroupRef.current) rightGroupRef.current.position.x = 1 + e * 1
  })

  const getSpecs = (name: string) => specs?.[name] || {}

  return (
    <group dispose={null}>
      <group ref={frameRef} position={[0, 0, 0]} visible={mode !== "section"}>
        {/* Top Wall Part */}
        <mesh
          position={[0, 0.95, 0]}
          onPointerOver={(e) => {
            e.stopPropagation()
            onPartHover("Рама")
          }}
          onPointerOut={() => onPartHover(null)}
        >
          <boxGeometry args={[4, 0.3, 0.5]} />
          {frameMaterial}
          {showAnnotations && (
            <Annotation
              title="Рама"
              specs={getSpecs("Рама")}
              visible={true}
              position={[1.5, 0, 0.25]}
              dx={0}
              dy={-150}
            />
          )}
        </mesh>
        {/* Bottom Wall Part */}
        <mesh position={[0, -0.95, 0]} onPointerOver={() => onPartHover("Стена")}>
          <boxGeometry args={[4, 0.3, 0.5]} />
          {frameMaterial}
        </mesh>
        {/* Left Wall Part */}
        <mesh position={[-1.4, 0, 0]} onPointerOver={() => onPartHover("Стена")}>
          <boxGeometry args={[0.8, 2.4, 0.5]} />
          {frameMaterial}
        </mesh>
        {/* Right Wall Part */}
        <mesh position={[1.4, 0, 0]} onPointerOver={() => onPartHover("Стена")}>
          <boxGeometry args={[0.8, 2.4, 0.5]} />
          {frameMaterial}
        </mesh>

        {/* Window Glass Pane */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[2.0, 1.6, 0.05]} />
          {glassMaterial}
        </mesh>
      </group>

      {/* Left Shutter Group */}
      <group ref={leftGroupRef} position={[-1, 0, 0.3]}>
        <group ref={leftShutterRef} position={[0, 0, 0]}>
          <group position={[0.5, 0, 0]}>
            <ShutterWing
              side="left"
              louvreAngleRef={louvreAngleRef}
              onPartHover={onPartHover}
              showAnnotations={showAnnotations}
              specs={specs || {}}
            />
          </group>
        </group>
      </group>

      {/* Right Shutter Group */}
      <group ref={rightGroupRef} position={[1, 0, 0.3]}>
        <group ref={rightShutterRef} position={[0, 0, 0]}>
          <group position={[-0.5, 0, 0]}>
            <ShutterWing
              side="right"
              louvreAngleRef={louvreAngleRef}
              onPartHover={onPartHover}
              showAnnotations={showAnnotations}
              specs={specs || {}}
            />
          </group>
        </group>
      </group>
    </group>
  )
}
