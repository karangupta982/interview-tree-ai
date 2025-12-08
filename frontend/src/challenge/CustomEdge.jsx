import React, { useState } from "react"
import { BaseEdge, getBezierPath } from "reactflow"
import { X } from "lucide-react"

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [isButtonHovering, setIsButtonHovering] = useState(false)
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2
  
  // Show button if hovering edge OR button itself
  const showButton = isHovering || isButtonHovering

  return (
    <>
      {/* Main Edge Line - Visible and responsive */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: showButton ? "rgba(168, 85, 247, 0.8)" : "rgba(255, 255, 255, 0.4)",
          strokeWidth: showButton ? 3 : 2,
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          // Don't hide if button is being hovered
          if (!isButtonHovering) {
            setIsHovering(false)
          }
        }}
      />
      
      {/* Invisible hover zone for better detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="30"
        style={{ 
          cursor: "pointer",
          pointerEvents: "stroke"
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          // Don't hide if button is being hovered
          if (!isButtonHovering) {
            setIsHovering(false)
          }
        }}
      />

      {/* Delete button on hover - Using foreignObject */}
      {showButton && (
        <foreignObject
          x={midX - 16}
          y={midY - 16}
          width="32"
          height="32"
          style={{
            overflow: "visible",
            pointerEvents: "auto",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))",
              pointerEvents: "auto",
            }}
            onMouseEnter={() => {
              setIsButtonHovering(true)
              setIsHovering(true)
            }}
            onMouseLeave={() => {
              setIsButtonHovering(false)
              setIsHovering(false)
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                const deleteEvent = new CustomEvent("deleteEdge", { detail: { edgeId: id } })
                window.dispatchEvent(deleteEvent)
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white/70 flex items-center justify-center shadow-lg hover:from-red-400 hover:to-red-500 hover:scale-125 transition-all duration-150 cursor-pointer text-white"
              style={{ pointerEvents: "all" }}
              title="Remove this branch"
            >
              <X size={16} />
            </button>
          </div>
        </foreignObject>
      )}
    </>
  )
}

