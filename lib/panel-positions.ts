export interface PanelPositions {
  foldedPanelsGroup: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  leftAFrame: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  rightAFrame: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  leftPanel: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  rightPanel: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  leftBracket: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
  rightBracket: { x: number; y: number; z: number; rx: number; ry: number; rz: number }
}

export const defaultPositions: PanelPositions = {
  foldedPanelsGroup: { x: 0, y: -0.78, z: -2.97, rx: 0.2007, ry: Math.PI, rz: 0 },
  leftAFrame: { x: -0.75, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
  rightAFrame: { x: 0.75, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
  leftPanel: { x: -0.75, y: 0.15, z: 0.45, rx: 0.5, ry: 0, rz: -0.1 },
  rightPanel: { x: 0.75, y: 0.15, z: 0.45, rx: 0.5, ry: 0, rz: 0.1 },
  leftBracket: { x: -0.75, y: -0.55, z: 0.15, rx: 0, ry: 0, rz: 0 },
  rightBracket: { x: 0.75, y: -0.55, z: 0.15, rx: 0, ry: 0, rz: 0 },
}

const STORAGE_KEY = "container-panel-positions"

export function savePositions(positions: PanelPositions): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("panel-positions-updated", { detail: positions }))
  }
}

export function loadPositions(): PanelPositions {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return defaultPositions
      }
    }
  }
  return defaultPositions
}

export function clearPositions(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent("panel-positions-updated", { detail: defaultPositions }))
  }
}
