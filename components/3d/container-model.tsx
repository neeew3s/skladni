"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Annotation } from "./annotation"
import { type PanelPositions, defaultPositions } from "@/lib/panel-positions"

interface ContainerModelProps {
  mode: "standard" | "exploded" | "section"
  isOpen: boolean
  onPartHover: (part: string | null) => void
  showAnnotations?: boolean
  hoveredPart?: string | null
  specs?: Record<string, any>
}

export function ContainerModel({
  mode,
  isOpen,
  onPartHover,
  showAnnotations,
  hoveredPart,
  specs,
}: ContainerModelProps) {
  const doorRef = useRef<THREE.Group>(null)
  const angleRef = useRef(0)
  const expansionRef = useRef(0)

  const roofRef = useRef<THREE.Group>(null)
  const leftWallRef = useRef<THREE.Group>(null)
  const rightWallRef = useRef<THREE.Group>(null)
  const frontWallRef = useRef<THREE.Group>(null)
  const foldedPanelsRef = useRef<THREE.Group>(null)

  const [storedPositions, setStoredPositions] = useState<PanelPositions>(defaultPositions)

  useEffect(() => {
    setStoredPositions(defaultPositions)

    // Listen for updates from editor (same tab)
    const handleUpdate = (event: CustomEvent<PanelPositions>) => {
      setStoredPositions(event.detail)
    }

    window.addEventListener("panel-positions-updated", handleUpdate as EventListener)

    // Listen for storage events (cross-tab sync)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "container-panel-positions" && event.newValue) {
        try {
          setStoredPositions(JSON.parse(event.newValue))
        } catch (e) {
          // ignore parse errors
        }
      }
    }
    window.addEventListener("storage", handleStorage)

    // Check localStorage on window focus (fallback)
    const handleFocus = () => {
      setStoredPositions(defaultPositions)
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("panel-positions-updated", handleUpdate as EventListener)
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const panelPositions = defaultPositions

  useFrame((state, delta) => {
    const targetAngle = isOpen ? -Math.PI * 0.5 : 0
    angleRef.current = THREE.MathUtils.lerp(angleRef.current, targetAngle, delta * 4)

    const targetExpansion = mode === "exploded" ? 1 : 0
    expansionRef.current = THREE.MathUtils.lerp(expansionRef.current, targetExpansion, delta * 4)

    if (doorRef.current) doorRef.current.rotation.y = angleRef.current

    const e = expansionRef.current
    if (roofRef.current) roofRef.current.position.y = 1.2 + e * 1.5
    if (leftWallRef.current) leftWallRef.current.position.x = 1.45 + e * 1
    if (rightWallRef.current) rightWallRef.current.position.x = -1.45 - e * 1
    if (frontWallRef.current) frontWallRef.current.position.z = 3.01 + e * 1

    if (foldedPanelsRef.current) {
      const pos = panelPositions.foldedPanelsGroup
      foldedPanelsRef.current.position.set(pos.x, pos.y, pos.z - e * 1)
      foldedPanelsRef.current.rotation.set(pos.rx, pos.ry, pos.rz)
    }
  })

  const getSpecs = (name: string) => specs?.[name] || {}

  const CorrugatedWall = ({ width, height, position, rotation, visible = true, color = "#7a8291" }: any) => {
    const ridgeCount = Math.floor(width * 5)
    const ridgeWidth = width / ridgeCount
    if (!visible) return null
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[width, height, 0.025]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.45} />
        </mesh>
        {Array.from({ length: ridgeCount }).map((_, i) => (
          <mesh key={i} position={[-width / 2 + i * ridgeWidth + ridgeWidth / 2, 0, 0.035]}>
            <boxGeometry args={[ridgeWidth * 0.25, height, 0.035]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.5} />
          </mesh>
        ))}
      </group>
    )
  }

  const ArmoredWindow = ({ position, rotation }: any) => {
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[0.55, 0.7, 0.08]} />
          <meshStandardMaterial color="#5a6270" roughness={0.5} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[0.48, 0.62, 0.04]} />
          <meshStandardMaterial color="#4a5260" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0.07]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.15, 0.07]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.2, 0, 0.08]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
          <meshStandardMaterial color="#2d3440" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    )
  }

  const TieDownAnchor = ({ position }: { position: [number, number, number] }) => {
    return (
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.1, 0.06, 0.1]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 8, 16]} />
          <meshStandardMaterial color="#2d3440" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    )
  }

  const AFrameSupport = ({
    position,
    rotation,
    side,
  }: { position: [number, number, number]; rotation?: [number, number, number]; side: "left" | "right" }) => {
    const mirror = side === "right" ? -1 : 1
    return (
      <group position={position} rotation={rotation || [0, 0, 0]}>
        <mesh position={[-0.35 * mirror, 0.2, 0.15]} rotation={[0.2, 0, 0.25 * mirror]}>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color="#5a6270" roughness={0.5} metalness={0.55} />
        </mesh>
        <mesh position={[0.15 * mirror, 0.2, 0.15]} rotation={[0.2, 0, -0.15 * mirror]}>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color="#5a6270" roughness={0.5} metalness={0.55} />
        </mesh>
        <mesh position={[-0.1 * mirror, 0.1, 0.2]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.06]} />
          <meshStandardMaterial color="#4a5260" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[-0.1 * mirror, 0.75, 0.35]}>
          <boxGeometry args={[0.25, 0.12, 0.1]} />
          <meshStandardMaterial color="#4a5260" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[-0.1 * mirror, -0.5, 0.1]}>
          <boxGeometry args={[0.7, 0.1, 0.25]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.65} />
        </mesh>
      </group>
    )
  }

  const TrapezoidalPanel = ({
    position,
    rotation,
    side,
  }: { position: [number, number, number]; rotation: [number, number, number]; side: "left" | "right" }) => {
    const mirror = side === "right" ? -1 : 1
    return (
      <group position={position} rotation={rotation}>
        <mesh>
          <boxGeometry args={[0.85, 1.0, 0.06]} />
          <meshStandardMaterial color="#6a7280" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0.1 * mirror, -0.55, 0]}>
          <boxGeometry args={[1.0, 0.15, 0.06]} />
          <meshStandardMaterial color="#6a7280" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[-0.45, 0, 0.04]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.08, 1.0, 0.04]} />
          <meshStandardMaterial color="#5a6270" roughness={0.45} metalness={0.55} />
        </mesh>
        <mesh position={[0.45, 0, 0.04]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.08, 1.0, 0.04]} />
          <meshStandardMaterial color="#5a6270" roughness={0.45} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0.52, 0.04]}>
          <boxGeometry args={[0.85, 0.06, 0.04]} />
          <meshStandardMaterial color="#4a5260" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.4, 0.08, 0.1]} />
          <meshStandardMaterial color="#3d4450" roughness={0.35} metalness={0.7} />
        </mesh>
      </group>
    )
  }

  const mainColor = "#7a8291"
  const frameColor = "#4a5260"
  const darkColor = "#3d4450"
  const interiorWallColor = "#5a5f68"
  const interiorFloorColor = "#3a3f48"

  return (
    <group dispose={null}>
      <group position={[0, 0, 0]}>
        <mesh position={[0, -1.13, 0]}>
          <boxGeometry args={[2.8, 0.05, 5.8]} />
          <meshStandardMaterial color={interiorFloorColor} roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.13, 0]}>
          <boxGeometry args={[2.8, 0.05, 5.8]} />
          <meshStandardMaterial color={interiorWallColor} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[1.38, 0, 0]}>
          <boxGeometry args={[0.05, 2.2, 5.8]} />
          <meshStandardMaterial color={interiorWallColor} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[-1.38, 0, 0]}>
          <boxGeometry args={[0.05, 2.2, 5.8]} />
          <meshStandardMaterial color={interiorWallColor} roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, -2.88]}>
          <boxGeometry args={[2.8, 2.2, 0.05]} />
          <meshStandardMaterial color={interiorWallColor} roughness={0.6} metalness={0.3} />
        </mesh>
      </group>

      <group
        onPointerOver={(e) => {
          e.stopPropagation()
          onPartHover("Бронированный корпус")
        }}
      >
        <mesh position={[1.5, 0, 3]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.5, 0, 3]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[1.5, 0, -3]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.5, 0, -3]}>
          <boxGeometry args={[0.12, 2.5, 0.12]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.25, 3]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.25, -3]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[1.5, 1.25, 0]}>
          <boxGeometry args={[0.1, 0.1, 6]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.5, 1.25, 0]}>
          <boxGeometry args={[0.1, 0.1, 6]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, -1.25, 3]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, -1.25, -3]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[1.5, -1.25, 0]}>
          <boxGeometry args={[0.1, 0.1, 6]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[-1.5, -1.25, 0]}>
          <boxGeometry args={[0.1, 0.1, 6]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.7} />
        </mesh>
        {showAnnotations && (
          <Annotation
            title="Бронированный корпус"
            specs={getSpecs("Бронированный корпус")}
            visible={true}
            position={[1.55, 1.25, 0]}
            dx={120}
            dy={-80}
          />
        )}
      </group>

      <group ref={leftWallRef} position={[1.45, 0, 0]}>
        <CorrugatedWall
          width={5.8}
          height={2.4}
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          visible={mode !== "section"}
          color={mainColor}
        />
        <ArmoredWindow position={[0.06, 0.3, 0.8]} rotation={[0, -Math.PI / 2, 0]} />
        <ArmoredWindow position={[0.06, 0.3, -0.5]} rotation={[0, -Math.PI / 2, 0]} />
        <ArmoredWindow position={[0.06, 0.3, -1.8]} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      <group ref={rightWallRef} position={[-1.45, 0, 0]}>
        <CorrugatedWall
          width={5.8}
          height={2.4}
          position={[0, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={mainColor}
        />
        <ArmoredWindow position={[-0.06, 0.3, -0.8]} rotation={[0, Math.PI / 2, 0]} />
        <ArmoredWindow position={[-0.06, 0.3, 0.5]} rotation={[0, Math.PI / 2, 0]} />
        <ArmoredWindow position={[-0.06, 0.3, 1.8]} rotation={[0, Math.PI / 2, 0]} />
      </group>

      <group ref={roofRef} position={[0, 1.2, 0]}>
        <CorrugatedWall
          width={2.9}
          height={5.8}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={mode !== "section"}
          color={mainColor}
        />
      </group>

      <group position={[0, 0, -2.95]}>
        <CorrugatedWall width={2.9} height={2.4} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} color={mainColor} />
      </group>

      <group ref={foldedPanelsRef}>
        <AFrameSupport
          position={[panelPositions.leftAFrame.x, panelPositions.leftAFrame.y, panelPositions.leftAFrame.z]}
          rotation={[panelPositions.leftAFrame.rx, panelPositions.leftAFrame.ry, panelPositions.leftAFrame.rz]}
          side="left"
        />
        <AFrameSupport
          position={[panelPositions.rightAFrame.x, panelPositions.rightAFrame.y, panelPositions.rightAFrame.z]}
          rotation={[panelPositions.rightAFrame.rx, panelPositions.rightAFrame.ry, panelPositions.rightAFrame.rz]}
          side="right"
        />

        <TrapezoidalPanel
          position={[panelPositions.leftPanel.x, panelPositions.leftPanel.y, panelPositions.leftPanel.z]}
          rotation={[panelPositions.leftPanel.rx, panelPositions.leftPanel.ry, panelPositions.leftPanel.rz]}
          side="left"
        />
        <TrapezoidalPanel
          position={[panelPositions.rightPanel.x, panelPositions.rightPanel.y, panelPositions.rightPanel.z]}
          rotation={[panelPositions.rightPanel.rx, panelPositions.rightPanel.ry, panelPositions.rightPanel.rz]}
          side="right"
        />

        <mesh
          position={[panelPositions.leftBracket.x, panelPositions.leftBracket.y, panelPositions.leftBracket.z]}
          rotation={[panelPositions.leftBracket.rx, panelPositions.leftBracket.ry, panelPositions.leftBracket.rz]}
        >
          <boxGeometry args={[0.35, 0.12, 0.2]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh
          position={[panelPositions.rightBracket.x, panelPositions.rightBracket.y, panelPositions.rightBracket.z]}
          rotation={[panelPositions.rightBracket.rx, panelPositions.rightBracket.ry, panelPositions.rightBracket.rz]}
        >
          <boxGeometry args={[0.35, 0.12, 0.2]} />
          <meshStandardMaterial color="#3d4450" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      <group position={[0, -1.2, 0]}>
        <mesh>
          <boxGeometry args={[3, 0.12, 6]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
        </mesh>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, -0.1, -2.7 + i * 0.6]}>
            <boxGeometry args={[2.8, 0.08, 0.06]} />
            <meshStandardMaterial color={darkColor} roughness={0.4} metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[0.9, -0.1, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.8]} />
          <meshStandardMaterial color={darkColor} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[-0.9, -0.1, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.8]} />
          <meshStandardMaterial color={darkColor} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {[-2.2, -1.4, -0.6, 0.2, 1.0, 1.8, 2.6].map((z, i) => (
        <group key={i}>
          <TieDownAnchor position={[1.55, -1.32, z]} />
          <TieDownAnchor position={[-1.55, -1.32, z]} />
        </group>
      ))}
      <TieDownAnchor position={[0.7, -1.32, 3.05]} />
      <TieDownAnchor position={[-0.7, -1.32, 3.05]} />
      <TieDownAnchor position={[0.7, -1.32, -3.05]} />
      <TieDownAnchor position={[-0.7, -1.32, -3.05]} />

      <group ref={frontWallRef} position={[0, 0, 3.01]}>
        <CorrugatedWall width={1.05} height={2.4} position={[-0.975, 0, 0]} rotation={[0, 0, 0]} color={mainColor} />
        <CorrugatedWall width={1.05} height={2.4} position={[0.975, 0, 0]} rotation={[0, 0, 0]} color={mainColor} />

        <mesh position={[0, 1.0375, 0]}>
          <boxGeometry args={[0.9, 0.325, 0.025]} />
          <meshStandardMaterial color={mainColor} roughness={0.55} metalness={0.45} />
        </mesh>

        <mesh position={[0, -1.1375, 0]}>
          <boxGeometry args={[0.9, 0.125, 0.025]} />
          <meshStandardMaterial color={mainColor} roughness={0.55} metalness={0.45} />
        </mesh>

        <group
          ref={doorRef}
          position={[-0.45, -0.1, 0]}
          onPointerOver={(e) => {
            e.stopPropagation()
            onPartHover("Дверной затвор")
          }}
          onPointerOut={() => onPartHover(null)}
        >
          <mesh position={[0.45, 0, 0.03]}>
            <boxGeometry args={[0.9, 1.95, 0.05]} />
            <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.55} />
          </mesh>

          <mesh position={[0.45, 0.45, 0.06]}>
            <boxGeometry args={[0.75, 0.6, 0.03]} />
            <meshStandardMaterial color="#5a6270" roughness={0.45} metalness={0.55} />
          </mesh>

          <mesh position={[0.45, -0.45, 0.06]}>
            <boxGeometry args={[0.75, 0.6, 0.03]} />
            <meshStandardMaterial color="#5a6270" roughness={0.45} metalness={0.55} />
          </mesh>

          <mesh position={[0.8, 0, 0.1]}>
            <boxGeometry args={[0.06, 0.18, 0.04]} />
            <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.8} />
          </mesh>

          <mesh position={[0.8, -0.25, 0.1]}>
            <boxGeometry args={[0.1, 0.12, 0.03]} />
            <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.8} />
          </mesh>

          <mesh position={[0.02, 0.6, 0.06]}>
            <boxGeometry args={[0.08, 0.15, 0.05]} />
            <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0.02, 0, 0.06]}>
            <boxGeometry args={[0.08, 0.15, 0.05]} />
            <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0.02, -0.6, 0.06]}>
            <boxGeometry args={[0.08, 0.15, 0.05]} />
            <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.8} />
          </mesh>

          {showAnnotations && (
            <Annotation
              title="Дверной затвор"
              specs={getSpecs("Дверной затвор")}
              visible={true}
              position={[0.45, 0.5, 0.08]}
              dx={100}
              dy={-60}
            />
          )}
        </group>
      </group>
    </group>
  )
}
