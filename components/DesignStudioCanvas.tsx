"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ElementPosition {
  id: string
  label: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  visible: boolean
}

interface DesignStudioCanvasProps {
  children: React.ReactNode
  elements: ElementPosition[]
  onUpdate: (elements: ElementPosition[]) => void
  containerWidth: number
  containerHeight: number
  showGuides?: boolean
  isEditing?: boolean
}

export default function DesignStudioCanvas({ 
  children, 
  elements, 
  onUpdate, 
  containerWidth, 
  containerHeight,
  showGuides = true,
  isEditing = true
}: DesignStudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showSnapX, setShowSnapX] = useState(false)
  const [showSnapY, setShowSnapY] = useState(false)

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    if (!isEditing) return
    e.preventDefault()
    setActiveElement(id)
    setIsDragging(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !activeElement || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    let x = ((e.clientX - rect.left) / rect.width) * 100
    let y = ((e.clientY - rect.top) / rect.height) * 100

    // Constrain to bounds
    x = Math.max(0, Math.min(100, x))
    y = Math.max(0, Math.min(100, y))

    // Snap to Center (if within 2% margin)
    const snapThreshold = 2
    let snappedX = x
    let snappedY = y

    if (Math.abs(x - 50) < snapThreshold) {
      snappedX = 50
      setShowSnapX(true)
    } else {
      setShowSnapX(false)
    }

    if (Math.abs(y - 50) < snapThreshold) {
      snappedY = 50
      setShowSnapY(true)
    } else {
      setShowSnapY(false)
    }

    const updatedElements = elements.map(el => 
      el.id === activeElement ? { ...el, x: snappedX, y: snappedY } : el
    )
    onUpdate(updatedElements)
  }, [activeElement, elements, isDragging, onUpdate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setActiveElement(null)
    setShowSnapX(false)
    setShowSnapY(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp, isDragging])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative select-none",
        isEditing ? "cursor-crosshair" : "cursor-default"
      )}
      style={{ width: "100%", height: "100%" }}
    >
      {/* The Actual Content (ChoiceCard, Product Listing etc) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {children}
      </div>

      {/* Snap Guides */}
      {showGuides && showSnapX && (
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500/50 z-50 pointer-events-none" />
      )}
      {showGuides && showSnapY && (
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 z-50 pointer-events-none" />
      )}

      {/* Design Overlay (Draggable Handles) */}
      <div className="absolute inset-0 z-10">
        {elements.map((el) => el.visible && (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(el.id, e)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl transition-all select-none",
              activeElement === el.id ? "bg-blue-600/20 border-2 border-blue-600 z-30" : "bg-white/10 border border-white/20 hover:border-white/50 z-20",
              isEditing ? "cursor-move" : "pointer-events-none opacity-0"
            )}
            style={{ 
              left: `${el.x}%`, 
              top: `${el.y}%`,
            }}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap drop-shadow-md">
              {el.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
