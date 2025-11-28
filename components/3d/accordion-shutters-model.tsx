"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Annotation } from "./annotation"

const frameMaterial = <meshStandardMaterial color="#222222" roughness={0.8} />
const panelMaterial = <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.5} />
const hingeMaterial = <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.8} />

interface AccordionShuttersModelProps {
  mode: "standard" | "exploded" | "section"
  isOpen: boolean
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  specs?: Record<string, any>
}

export function AccordionShuttersModel({
  mode,
  isOpen,
  onPartHover,
  showAnnotations,
  specs,
}: AccordionShuttersModelProps) {
  // Left Side References
  const leftPanel1Ref = useRef<THREE.Group>(null)
  const leftPanel2Ref = useRef<THREE.Group>(null)

  // Right Side References
  const rightPanel1Ref = useRef<THREE.Group>(null)
  const rightPanel2Ref = useRef<THREE.Group>(null)

  const angleRef = useRef(0)
  const expansionRef = useRef(0)
  const frameRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    // Target angle for folding: approx 75 degrees (1.3 radians)
    const targetAngle = isOpen ? 1.3 : 0
    angleRef.current = THREE.MathUtils.lerp(angleRef.current, targetAngle, delta * 3)

    const targetExpansion = mode === "exploded" ? 1 : 0
    expansionRef.current = THREE.MathUtils.lerp(expansionRef.current, targetExpansion, delta * 3)

    const angle = angleRef.current

    // --- Left Side Animation (Anchored at x = -1.0) ---
    if (leftPanel1Ref.current) {
      leftPanel1Ref.current.rotation.y = angle // Rotate Out (+Z)
    }
    // Panel 2 zig-zags back relative to Panel 1
    if (leftPanel2Ref.current) {
      leftPanel2Ref.current.rotation.y = -2 * angle
    }

    // --- Right Side Animation (Anchored at x = 1.0) ---
    if (rightPanel1Ref.current) {
      rightPanel1Ref.current.rotation.y = -angle // Rotate Out (+Z) symmetrically
    }
    // Panel 2 zig-zags back relative to Panel 1
    if (rightPanel2Ref.current) {
      rightPanel2Ref.current.rotation.y = 2 * angle
    }

    // Exploded View
    if (frameRef.current) frameRef.current.position.z = -expansionRef.current * 0.5
  })

  const getSpecs = (name: string) => specs?.[name] || {}

  // Panel Dimensions
  // Total Opening = 2.0. Two sides -> 1.0 each.
  // Each side has 2 panels -> 0.5 width each.
  const panelWidth = 0.5
  const panelHeight = 2.0

  return (
    <group dispose={null}>
      {/* Static Frame */}
      <group ref={frameRef} visible={mode !== "section"}>
        {/* Top Rail */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[2.2, 0.1, 0.2]} />
          {frameMaterial}
        </mesh>
        {/* Bottom Rail */}
        <mesh position={[0, -1.05, 0]}>
          <boxGeometry args={[2.2, 0.1, 0.2]} />
          {frameMaterial}
        </mesh>
        {/* Left Post */}
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[0.1, 2.2, 0.2]} />
          {frameMaterial}
        </mesh>
        {/* Right Post */}
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[0.1, 2.2, 0.2]} />
          {frameMaterial}
        </mesh>

        {showAnnotations && (
          <Annotation
            title="Направляющий рельс"
            specs={getSpecs("Направляющий рельс")}
            visible={true}
            position={[-0.5, 1.1, 0.1]}
            dx={40}
            dy={-60}
          />
        )}
      </group>

      {/* --- Left Accordion Group (Starts at x = -1.0) --- */}
      <group position={[-1.0, 0, 0]}>
        {/* Left Panel 1 */}
        <group ref={leftPanel1Ref}>
          {/* Offset geometry so pivot is at left edge (0) */}
          <group position={[panelWidth / 2, 0, 0]}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation()
                onPartHover("Складная секция")
              }}
              onPointerOut={() => onPartHover(null)}
            >
              <boxGeometry args={[panelWidth - 0.02, panelHeight, 0.05]} />
              {panelMaterial}
              {/* Decorative grooves */}
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[panelWidth - 0.05, panelHeight - 0.1]} />
                <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
              </mesh>

              {showAnnotations && (
                <Annotation
                  title="Складная секция"
                  specs={getSpecs("Складная секция")}
                  visible={true}
                  position={[0, 0, 0.05]}
                  dx={-120}
                  dy={-40}
                />
              )}
            </mesh>

            {/* Hinge to Left Panel 2 */}
            <group position={[panelWidth / 2, 0, 0]}>
              <mesh position={[0, 0, 0.03]}>
                <cylinderGeometry args={[0.02, 0.02, panelHeight, 8]} />
                {hingeMaterial}
              </mesh>

              <group ref={leftPanel2Ref}>
                {/* Left Panel 2 */}
                <group position={[panelWidth / 2, 0, 0]}>
                  <mesh
                    onPointerOver={(e) => {
                      e.stopPropagation()
                      onPartHover("Складная секция")
                    }}
                  >
                    <boxGeometry args={[panelWidth - 0.02, panelHeight, 0.05]} />
                    {panelMaterial}
                    <mesh position={[0, 0, 0.03]}>
                      <planeGeometry args={[panelWidth - 0.05, panelHeight - 0.1]} />
                      <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
                    </mesh>

                    {/* Locking Mechanism Annotation at the meeting edge */}
                    {showAnnotations && (
                      <Annotation
                        title="Запорный механизм"
                        specs={getSpecs("Запорный механизм")}
                        visible={true}
                        position={[panelWidth / 2 - 0.05, -0.1, 0.05]}
                        dx={100}
                        dy={60}
                      />
                    )}
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* --- Right Accordion Group (Starts at x = 1.0) --- */}
      <group position={[1.0, 0, 0]}>
        {/* Right Panel 1 */}
        <group ref={rightPanel1Ref}>
          {/* Offset geometry so pivot is at right edge (0 relative to group, goes -x) */}
          <group position={[-panelWidth / 2, 0, 0]}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation()
                onPartHover("Складная секция")
              }}
              onPointerOut={() => onPartHover(null)}
            >
              <boxGeometry args={[panelWidth - 0.02, panelHeight, 0.05]} />
              {panelMaterial}
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[panelWidth - 0.05, panelHeight - 0.1]} />
                <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
              </mesh>
            </mesh>

            {/* Hinge to Right Panel 2 */}
            <group position={[-panelWidth / 2, 0, 0]}>
              <mesh position={[0, 0, 0.03]}>
                <cylinderGeometry args={[0.02, 0.02, panelHeight, 8]} />
                {hingeMaterial}
              </mesh>

              <group ref={rightPanel2Ref}>
                {/* Right Panel 2 */}
                <group position={[-panelWidth / 2, 0, 0]}>
                  <mesh
                    onPointerOver={(e) => {
                      e.stopPropagation()
                      onPartHover("Складная секция")
                    }}
                  >
                    <boxGeometry args={[panelWidth - 0.02, panelHeight, 0.05]} />
                    {panelMaterial}
                    <mesh position={[0, 0, 0.03]}>
                      <planeGeometry args={[panelWidth - 0.05, panelHeight - 0.1]} />
                      <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
                    </mesh>
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
