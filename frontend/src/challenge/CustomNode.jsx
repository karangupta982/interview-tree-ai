import React, { useState } from "react"
import { Handle, Position } from "reactflow"
import { ArrowRight, ZoomIn } from "lucide-react"

export default function CustomNode({ data, isConnectable }) {
  const [isHovering, setIsHovering] = useState(false)

  const onEnter = () => {
    // debug: confirm hover events fire
    // eslint-disable-next-line no-console
    console.log("CustomNode: mouse enter ->", data?.title || data?.id)
    setIsHovering(true)
  }

  const onLeave = () => {
    // eslint-disable-next-line no-console
    console.log("CustomNode: mouse leave ->", data?.title || data?.id)
    setIsHovering(false)
  }

  return (
    <div
      className="relative w-64"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ zIndex: 9999 }}
    >
      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ zIndex: 10000 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ zIndex: 10000 }}
      />

      {/* Main Node Card */}
      <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-xl border border-white/20 hover:border-white/40 transition-all duration-300 min-h-[100px] flex flex-col justify-center select-none">
        <h3 className="font-semibold text-white text-sm line-clamp-3 pr-8">{data.title}</h3>
        {data.childrenCount != null && (
          <p className="mt-2 text-xs text-gray-300">{data.childrenCount} subtopic{data.childrenCount !== 1 ? "s" : ""}</p>
        )}

        {/* Center DOT - Click to open modal */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // eslint-disable-next-line no-console
            console.log("CustomNode: center clicked ->", data?.title || data?.id)
            data.onCenter && data.onCenter(data)
          }}
          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-150 ${
            isHovering ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          title="View details"
          style={{ zIndex: 10001 }}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg border-2 border-white/60 flex items-center justify-center hover:from-purple-400 hover:to-purple-500 hover:scale-110 transition-all duration-200 backdrop-blur-sm">
            <ZoomIn size={20} className="text-white" />
          </div>
        </div>

        {/* Right ARROW - Click to expand */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // eslint-disable-next-line no-console
            console.log("CustomNode: expand clicked ->", data?.title || data?.id)
            data.onExpand && data.onExpand(data)
          }}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-[60%] transition-opacity duration-150 ${
            isHovering ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          title="Expand subtopics"
          style={{ zIndex: 10001 }}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white/60 flex items-center justify-center hover:from-blue-400 hover:to-blue-500 hover:scale-110 transition-all duration-200 backdrop-blur-sm cursor-pointer">
            <ArrowRight size={20} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
