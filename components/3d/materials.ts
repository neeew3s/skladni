import * as THREE from "three"

export const concreteMaterial = new THREE.MeshStandardMaterial({
  color: "#333333", // darkened for more realistic concrete
  roughness: 0.9, // increased roughness
  metalness: 0.1,
})

export const steelMaterial = new THREE.MeshStandardMaterial({
  color: "#1a1a1a", // much darker gunmetal
  roughness: 0.4, // made smoother
  metalness: 0.6, // made less metallic to avoid mirror finish
})

export const accentMaterial = new THREE.MeshStandardMaterial({
  color: "#ff6b00",
  roughness: 0.3,
  metalness: 0.8,
  emissive: "#ff6b00",
  emissiveIntensity: 0.1, // reduced bloom
})

export const darkAccentMaterial = new THREE.MeshStandardMaterial({
  color: "#0a0a0a", // almost black
  roughness: 0.7,
  metalness: 0.5,
})

export const weatheredSteelMaterial = new THREE.MeshStandardMaterial({
  color: "#2d2d2d",
  roughness: 0.8,
  metalness: 0.4,
})

export const glassMaterial = new THREE.MeshStandardMaterial({
  color: "#aaddff",
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.3,
})
