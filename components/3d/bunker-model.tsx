"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Annotation } from "./annotation"

interface BunkerModelProps {
  mode: "standard" | "exploded" | "section"
  isOpen: boolean
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  hoveredPart?: string | null
  specs?: Record<string, any>
}

export function BunkerModel({ mode, isOpen, onPartHover, showAnnotations, hoveredPart, specs }: BunkerModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const doorRef = useRef<THREE.Group>(null)

  // Animation state values
  const expansionRef = useRef(0)
  const doorAngleRef = useRef(0)

  useFrame((state, delta) => {
    const targetExpansion = mode === "exploded" ? 1 : 0
    expansionRef.current = THREE.MathUtils.lerp(expansionRef.current, targetExpansion, delta * 4)

    const targetDoorAngle = isOpen ? -Math.PI * 0.6 : 0
    doorAngleRef.current = THREE.MathUtils.lerp(doorAngleRef.current, targetDoorAngle, delta * 4)

    // Apply animations directly to refs if they exist
    if (doorRef.current) {
      doorRef.current.rotation.y = doorAngleRef.current
    }
  })

  const concreteMaterial = <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
  const steelMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
  const interiorMaterial = <meshStandardMaterial color="#151515" roughness={0.9} side={THREE.DoubleSide} />

  const roofRef = useRef<THREE.Mesh>(null)
  const wallRef = useRef<THREE.Group>(null)
  const ventRef = useRef<THREE.Group>(null)
  const doorGroupRef = useRef<THREE.Group>(null) // Wrapper for door position animation

  useFrame(() => {
    const e = expansionRef.current
    if (roofRef.current) roofRef.current.position.y = 3.2 + e * 1.5
    if (wallRef.current) wallRef.current.position.y = 1.5 + e * 0.5
    if (ventRef.current) ventRef.current.position.y = 3.4 + e * 2
    if (doorGroupRef.current) {
      doorGroupRef.current.position.z = 3 + e * 1
    }
  })

  const annotations = {
    "Взрывозащитная дверь IV": [1.5, 0, 0.5], // Relative to door group
    "Система фильтрации NBC": [0.5, 0.4, 0.5], // Relative to vent
    "Усиленная крыша": [2, 3.4, 2], // World pos
    Фундамент: [2, -0.2, 2], // World pos
    "Экранирование ядра": [-2, 1.5, -2], // World pos
  }

  // Helper to get specs safely
  const getSpecs = (name: string) => specs?.[name] || {}

  return (
    <group ref={groupRef} dispose={null} position={[0, -1, 0]}>
      {/* Base / Foundation */}
      <mesh
        position={[0, -0.2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPartHover("Фундамент")
        }}
        onPointerOut={() => onPartHover(null)}
      >
        <boxGeometry args={[6, 0.4, 6]} />
        {concreteMaterial}
        {showAnnotations && (
          <Annotation
            title="Фундамент"
            specs={getSpecs("Фундамент")}
            visible={true}
            position={[3, -0.2, 2]}
            dx={100}
            dy={120}
          />
        )}
      </mesh>

      {/* Walls with structural details */}
      <group ref={wallRef} position={[0, 1.5, 0]}>
        {/* Left Wall Structure */}
        <group position={[-2.8, 0, 0]} visible={mode !== "section"}>
          <mesh>
            <boxGeometry args={[0.4, 3, 6]} />
            {concreteMaterial}
          </mesh>
        </group>

        {/* Right Wall */}
        <group position={[2.8, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.4, 3, 6]} />
            {concreteMaterial}
          </mesh>
        </group>

        {/* Back Wall */}
        <mesh position={[0, 0, -2.8]}>
          <boxGeometry args={[5.2, 3, 0.4]} />
          {concreteMaterial}
        </mesh>

        {/* Doorway Structure (Left, Right, Top) */}
        <group position={[0, 0, 2.8]} visible={mode !== "section"}>
          {/* Left Jamb */}
          <mesh position={[-1.8, 0, 0]}>
            <boxGeometry args={[1.6, 3, 0.4]} />
            {concreteMaterial}
          </mesh>
          {/* Right Jamb */}
          <mesh position={[1.8, 0, 0]}>
            <boxGeometry args={[1.6, 3, 0.4]} />
            {concreteMaterial}
          </mesh>
          {/* Header / Lintel (Above door) */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[2, 0.5, 0.4]} />
            {concreteMaterial}
          </mesh>
          {/* Threshold / Floor part under door */}
          <mesh position={[0, -1.4, 0]}>
            <boxGeometry args={[2, 0.2, 0.4]} />
            {concreteMaterial}
          </mesh>
        </group>
      </group>

      <group
        position={[0, 1.5, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPartHover("Экранирование ядра")
        }}
        onPointerOut={() => onPartHover(null)}
      >
        {/* Interior Floor */}
        <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 5]} />
          {interiorMaterial}
        </mesh>
        {/* Interior Ceiling */}
        <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 5]} />
          {interiorMaterial}
        </mesh>
        {/* Interior Back Wall */}
        <mesh position={[0, 0, -2.45]}>
          <planeGeometry args={[5, 2.9]} />
          {interiorMaterial}
        </mesh>
        {/* Interior Left Wall */}
        <mesh position={[-2.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5, 2.9]} />
          {interiorMaterial}
        </mesh>
        {/* Interior Right Wall */}
        <mesh position={[2.45, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5, 2.9]} />
          {interiorMaterial}
        </mesh>
        {/* Note: No front wall on interior to match the doorway hole */}
        {showAnnotations && ( // Removed hoveredPart check
          <Annotation
            title="Экранирование ядра"
            specs={getSpecs("Экранирование ядра")}
            visible={true}
            position={[-2.45, 0, 0]}
            dx={-120} // Move to left
            dy={0}
          />
        )}
      </group>

      {/* Roof / Ceiling */}
      <mesh
        ref={roofRef}
        position={[0, 3.2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPartHover("Усиленная крыша")
        }}
        onPointerOut={() => onPartHover(null)}
      >
        <boxGeometry args={[6.4, 0.4, 6.4]} />
        {concreteMaterial}
        {showAnnotations && ( // Removed hoveredPart check
          <Annotation
            title="Усиленная крыша"
            specs={getSpecs("Усиленная крыша")}
            visible={true}
            position={[0, 0.2, 3.2]}
            dx={0}
            dy={-150} // Move Up
          />
        )}
      </mesh>

      {/* Blast Door */}
      <group ref={doorGroupRef} position={[0, 1.5, 3]}>
        <group
          ref={doorRef}
          position={[-1, 0, 0]} // Pivot point
          onPointerOver={(e) => {
            e.stopPropagation()
            onPartHover("Взрывозащитная дверь IV")
          }}
          onPointerOut={() => onPartHover(null)}
        >
          {/* Door Body - shifting back to center relative to pivot */}
          <group position={[1, 0, 0]}>
            <mesh>
              <boxGeometry args={[2.05, 2.65, 0.3]} />
              {steelMaterial}
            </mesh>
            {/* Handle */}
            <mesh position={[0.8, 0, 0.2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.4]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#ff6b00" />
            </mesh>
            {showAnnotations && ( // Removed hoveredPart check
              <Annotation
                title="Взрывозащитная дверь IV"
                specs={getSpecs("Взрывозащитная дверь IV")}
                visible={true}
                position={[1, 0, 0.15]}
                dx={150} // Reduced form 180 to keep on screen
                dy={30} // Added small offset to separate from others
              />
            )}
          </group>
        </group>
      </group>

      {/* Ventilation System */}
      <group
        ref={ventRef}
        position={[1.5, 3.4, 1.5]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPartHover("Система фильтрации NBC")
        }}
        onPointerOut={() => onPartHover(null)}
      >
        <mesh>
          <boxGeometry args={[1, 0.8, 1]} />
          {steelMaterial}
        </mesh>
        {showAnnotations && ( // Removed hoveredPart check
          <Annotation
            title="Система фильтрации NBC"
            specs={getSpecs("Система фильтрации NBC")}
            visible={true}
            position={[0.5, 0.4, 0]}
            dx={60} // Reduced from 120 to prevent cutoff
            dy={-110} // Reduced vertical distance
          />
        )}
      </group>
    </group>
  )
}
