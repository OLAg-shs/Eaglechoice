"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ElementPosition {
  id: string
  label: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  visible: boolean
  renderHandle?: (el: ElementPosition) => React.ReactNode
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
        "relative select-none rounded-[2.5rem]",
        isEditing ? "cursor-crosshair overflow-visible" : "cursor-default"
      )}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Grid Pattern Background for Editing */}
      {isEditing && (
        <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ 
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />
      )}

      {/* The Actual Content (ChoiceCard, Product Listing etc) */}
      <div className={cn(
        "absolute inset-0 z-0 pointer-events-none transition-all duration-300",
        isEditing ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
      )}>
        {children}
      </div>

      {/* Snap Guides */}
      {showGuides && showSnapX && (
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-blue-500/50 z-50 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
      )}
      {showGuides && showSnapY && (
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/50 z-50 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
      )}

      {/* Design Overlay (Draggable Handles) */}
      <div className="absolute inset-0 z-10">
        {elements.map((el) => el.visible && (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(el.id, e)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 transition-shadow select-none",
              activeElement === el.id ? "z-30 scale-105" : "z-20 hover:scale-[1.02]",
              isEditing ? "cursor-move" : "pointer-events-none opacity-0"
            )}
            style={{ 
              left: `${el.x}%`, 
              top: `${el.y}%`,
            }}
          >
            {/* Real UI Preview or Generic Label */}
            <div className={cn(
              "rounded-xl ring-2 transition-all",
              activeElement === el.id ? "ring-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "ring-transparent hover:ring-white/30"
            )}>
              {el.renderHandle ? el.renderHandle(el) : (
                <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap drop-shadow-md">
                   {el.label}
                </div>
              )}
            </div>
            
            {/* Context Position HUD */}
            {activeElement === el.id && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full pointer-events-none">
                {Math.round(el.x)}%, {Math.round(el.y)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
