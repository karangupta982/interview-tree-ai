import React, { useState, useEffect, useCallback, useRef } from "react"
import { useApi } from "../utils/api.js"
import { NodeDetailModal } from "./NodeDetailModal.jsx"
import { Zap, ArrowRight, TrendingUp, ArrowLeft, Download, X } from "lucide-react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow"
import CustomNode from "./CustomNode.jsx"
import CustomEdge from "./CustomEdge.jsx"
import "reactflow/dist/style.css"

// Define nodeTypes and edgeTypes outside component to prevent recreation on every render
const nodeTypes = { customNode: CustomNode }
const edgeTypes = {
  default: CustomEdge,
}

export function TopicExplorer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [nodesData, setNodesData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [topic, setTopic] = useState("")
  const [maxSubtopics, setMaxSubtopics] = useState(6)
  const [quota, setQuota] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeDetail, setNodeDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const { makeRequest } = useApi()
  const reactFlowInstance = useRef(null)

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([])
  const hasLoadedFromUrl = useRef(false)
  const hasFetchedQuota = useRef(false)
  const expandedNodesRef = useRef(new Set()) // Track which nodes have been expanded

  // Listen for edge delete events
  useEffect(() => {
    const handleDeleteEdge = (event) => {
      const { edgeId } = event.detail
      
      setRfEdges((eds) => {
        const edge = eds.find((e) => e.id === edgeId)
        if (!edge) return eds

        // Remove target node and all its descendants
        const removeNodeAndDescendants = (nodeId, currentEdges) => {
          const nodesToRemove = [nodeId]
          const edgesToRemove = []

          // Find all children recursively
          const findChildren = (parentId) => {
            currentEdges.forEach((e) => {
              if (e.source === parentId) {
                nodesToRemove.push(e.target)
                edgesToRemove.push(e.id)
                findChildren(e.target)
              }
            })
          }

          findChildren(nodeId)
          return { nodesToRemove, edgesToRemove }
        }

        const { nodesToRemove, edgesToRemove } = removeNodeAndDescendants(edge.target, eds)
        
        // Remove from expanded nodes tracking
        nodesToRemove.forEach(nodeId => {
          expandedNodesRef.current.delete(nodeId)
        })
        // Also remove the source node from expanded tracking so it can be expanded again
        expandedNodesRef.current.delete(edge.source)
        
        // Update nodes
        setRfNodes((nds) => nds.filter((n) => !nodesToRemove.includes(n.id)))
        
        // Remove the edge and all descendant edges
        return eds.filter((e) => e.id !== edgeId && !edgesToRemove.includes(e.id))
      })
    }

    window.addEventListener("deleteEdge", handleDeleteEdge)
    return () => window.removeEventListener("deleteEdge", handleDeleteEdge)
  }, [])

  // Fetch quota on mount - only once
  useEffect(() => {
    if (hasFetchedQuota.current) return
    
    const fetchQuotaData = async () => {
      try {
        hasFetchedQuota.current = true
        const data = await makeRequest("quota")
        console.log("#############Quota data###################:", data)
        setQuota(data)
      } catch (err) {
        console.error("Quota error:", err)
        hasFetchedQuota.current = false // Reset on error so it can retry
      }
    }
    fetchQuotaData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Handle URL params separately to avoid dependency issues
  useEffect(() => {
    const topicFromUrl = searchParams.get('topic')
    if (topicFromUrl && !nodesData && !hasLoadedFromUrl.current) {
      hasLoadedFromUrl.current = true
      setTopic(topicFromUrl)
      
      // Use the generateTopicNodes function but only trigger once
      const timer = setTimeout(() => {
        generateTopicNodes(null, topicFromUrl)
      }, 200)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])


  const handleNodeClick = useCallback(async (node) => {
    const nodeTitle = typeof node === 'string' ? node : (node.title || node.id || 'Unknown')
    setSelectedNode({ ...node, title: nodeTitle })
    setNodeDetail(null)
    setDetailLoading(true)

    try {
      const topicToUse = nodesData?.topic || topic || nodeTitle
      const detail = await makeRequest("generate-node-detail", {
        method: "POST",
        body: JSON.stringify({ topic: topicToUse, node_title: nodeTitle })
      })
      console.log("#############Node detail###################:", detail)
      setNodeDetail(detail)
    } catch (err) {
      setError(err.message || "Failed to fetch node details")
    } finally {
      setDetailLoading(false)
    }
  }, [nodesData, topic, makeRequest])

  const appendNodesAndEdges = useCallback((parentId, newNodes) => {
    if (!newNodes || newNodes.length === 0) return
    
    // Check if parent already has children to prevent duplicate expansion
    if (expandedNodesRef.current.has(parentId)) {
      return
    }
    
    // Mark as expanded
    expandedNodesRef.current.add(parentId)
    
    // Get parent node position to calculate child positions
    setRfNodes((nds) => {
      const parentNode = nds.find(n => n.id === parentId)
      if (!parentNode) return nds
      
      const timestamp = Date.now()
      const parentX = parentNode.position.x
      const parentY = parentNode.position.y
      
      const mapped = newNodes.map((n, idx) => {
        const nodeId = `${n.id}-${timestamp}-${idx}`
        return {
          id: nodeId,
          type: "customNode",
          position: { x: parentX + 400, y: parentY - 100 + idx * 120 },
          data: {
            title: n.title,
            childrenCount: 0, // No children initially
            onCenter: () => handleNodeClick(n),
            onExpand: async () => {
              try {
                setIsLoading(true)
                const res = await makeRequest("generate-challenge", {
                  method: "POST",
                  body: JSON.stringify({ topic: n.title, max_subtopics: 6 })
                })
                appendNodesAndEdges(nodeId, res.nodes || [])
              } catch (err) {
                setError(err.message || "Failed to expand node")
              } finally {
                setIsLoading(false)
              }
            }
          }
        }
      })

      const newEdges = mapped.map((m) => ({ 
        id: `e-${parentId}-${m.id}`, 
        source: parentId, 
        target: m.id,
        type: 'default',
        animated: false,
        style: { stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2 }
      }))
      
      // Update parent node's childrenCount
      const updatedParent = {
        ...parentNode,
        data: {
          ...parentNode.data,
          childrenCount: mapped.length
        }
      }
      
      setRfEdges((eds) => [...eds, ...newEdges])
      
      return [...nds.filter(n => n.id !== parentId), updatedParent, ...mapped]
    })
  }, [makeRequest, handleNodeClick])

  const generateTopicNodes = useCallback(async (e, topicOverride = null) => {
    e && e.preventDefault()
    const topicToUse = topicOverride || topic
    if (!topicToUse.trim()) return setError("Please enter a topic")
    
    setIsLoading(true)
    setError(null)
    setNodesData(null)

    try {
      const data = await makeRequest("generate-challenge", {
        method: "POST",
        body: JSON.stringify({ topic: topicToUse, max_subtopics: maxSubtopics })
      })
      console.log("#############Nodes data###################:", data)
      setNodesData(data)
      // Build React Flow nodes/edges
      const rootId = `root-${Date.now()}`
      const rootNode = {
        id: rootId,
        type: "customNode",
        position: { x: 100, y: 300 },
        data: {
          title: data.topic,
          childrenCount: data.nodes ? data.nodes.length : 0,
          onCenter: () => handleNodeClick({ id: rootId, title: data.topic }),
          onExpand: async () => {
            // expand root (fetch same as clicking arrow)
            try {
              setIsLoading(true)
              const res = await makeRequest("generate-challenge", {
                method: "POST",
                body: JSON.stringify({ topic: data.topic, max_subtopics: 6 })
              })
              // append nodes
              appendNodesAndEdges(rootId, res.nodes || [])
            } catch (err) {
              setError(err.message || "Failed to expand node")
            } finally {
              setIsLoading(false)
            }
          }
        }
      }

      const timestamp = Date.now()
      const childNodes = (data.nodes || []).map((n, idx) => {
        const nodeId = `${n.id}-${timestamp}-${idx}`
        return {
          id: nodeId,
          type: "customNode",
          position: { x: 500, y: 50 + idx * 120 },
          data: {
            title: n.title,
            childrenCount: 0, // No children initially
            onCenter: () => handleNodeClick(n),
            onExpand: async () => {
              try {
                setIsLoading(true)
                const res = await makeRequest("generate-challenge", {
                  method: "POST",
                  body: JSON.stringify({ topic: n.title, max_subtopics: 6 })
                })
                appendNodesAndEdges(nodeId, res.nodes || [])
              } catch (err) {
                setError(err.message || "Failed to expand node")
              } finally {
                setIsLoading(false)
              }
            }
          }
        }
      })

      const edges = (childNodes || []).map((cn) => ({ 
        id: `e-${rootId}-${cn.id}`, 
        source: rootId, 
        target: cn.id,
        type: 'default',
        animated: false,
        style: { stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2 }
      }))

      setRfNodes([rootNode, ...childNodes])
      setRfEdges(edges)
      // Reset expanded nodes tracking when generating new topic
      expandedNodesRef.current.clear()
      // Quota is already fetched on mount, no need to fetch again
    } catch (err) {
      setError(err.message || "Failed to generate topic nodes.")
    } finally {
      setIsLoading(false)
    }
  }, [topic, maxSubtopics, makeRequest, handleNodeClick, appendNodesAndEdges])


  const getNextResetTime = () => {
    if (!quota?.last_reset_date) return null
    const resetDate = new Date(quota.last_reset_date)
    resetDate.setHours(resetDate.getHours() + 24)
    return resetDate
  }

  const downloadGraph = async () => {
    try {
      // Get the React Flow viewport
      const reactFlowWrapper = document.querySelector('.react-flow')
      if (!reactFlowWrapper) {
        alert('Graph not found. Please generate a topic first.')
        return
      }

      // Try to use html2canvas if available
      const html2canvas = (await import('html2canvas')).default
      
      // Wait a bit for React Flow to fully render
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get the container that holds the React Flow
      const container = document.querySelector('#react-flow-container') || reactFlowWrapper.parentElement
      if (!container) {
        alert('Could not find graph container.')
        return
      }

      // Capture the entire container including background
      const canvas = await html2canvas(container, {
        backgroundColor: '#0e1217',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: false,
        width: container.scrollWidth || window.innerWidth,
        height: container.scrollHeight || window.innerHeight,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate image. Please try again.')
          return
        }
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${topic || nodesData?.topic || 'graph'}-${Date.now()}.png`
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 0.95)
    } catch (err) {
      console.error('Download failed:', err)
      alert(`Download failed: ${err.message}. Please try again.`)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0e1217]">
      {/* Background Glow Elements */}
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/30 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[180px]" />
      
      {/* Input Section - Floating at top */}
      {!nodesData && (
        <div className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Button to go back to home */}
      <button
        onClick={() => navigate('/')}
        className="glassmorphism flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2 text-white hover:bg-white/10 transition-all mb-4"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

            {/* Quota Display */}
            <div className="mb-6 flex items-center justify-between rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3">
            
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-purple-300" />
                <span className="text-sm font-medium text-white">
                  <span className="text-purple-300 font-semibold">{quota?.quota_remaining ?? "Loading"}</span> explorations remaining today
                </span>
              </div>
              {quota?.quota_remaining === 0 && (
                <span className="text-xs text-gray-400">Reset: {getNextResetTime()?.toLocaleTimeString()}</span>
              )}
            </div>

            {/* Form */}
            <form onSubmit={generateTopicNodes} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  What topic would you like to explore?
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., React Hooks, Docker, Machine Learning..."
                    disabled={isLoading || quota?.quota_remaining === 0}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-white/5"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || quota?.quota_remaining === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        Explore
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 text-white">
                  <span className="font-medium">Subtopics:</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={maxSubtopics}
                    onChange={(e) => setMaxSubtopics(Number(e.target.value))}
                    disabled={isLoading}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl px-2 py-1.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </label>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-500/20 backdrop-blur-xl border border-red-500/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back Button and Download Button */}
      {nodesData && (
        <div className="absolute top-4 left-4 z-30 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="glassmorphism flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-2 text-white shadow-lg hover:bg-white/15 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          {/* <button
            onClick={downloadGraph}
            className="glassmorphism flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-2 text-white shadow-lg hover:bg-white/15 transition-all"
          >
            <Download size={18} />
            Download
          </button> */}
        </div>
      )}

      {/* React Flow Section - Full Screen Background */}
      {nodesData && (
        <div id="react-flow-container" className="absolute inset-0 z-10">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ 
              type: 'default',
              style: { stroke: 'rgba(255, 255, 255, 0.5)', strokeWidth: 2 }
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
            className="bg-transparent"
          >
            <Background gap={16} color="#3b3b3b" variant="dots" />
            <Controls className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg" />
          </ReactFlow>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && nodesData && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glassmorphism rounded-2xl px-8 py-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white"></div>
              <span className="text-white font-medium">Generating subtopics...</span>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal
          topic={nodesData?.topic || topic}
          node={selectedNode}
          detail={nodeDetail}
          isLoading={detailLoading}
          onClose={() => {
            setSelectedNode(null)
            setNodeDetail(null)
          }}
        />
      )}
    </div>
  )
}
