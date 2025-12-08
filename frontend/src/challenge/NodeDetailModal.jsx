import { X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useApi } from "../utils/api.js"

export function NodeDetailModal({ topic, node, detail: initialDetail, isLoading, onClose }) {
  const { makeRequest } = useApi()
  const [detail, setDetail] = useState(initialDetail)
  const [question, setQuestion] = useState("")
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const chatEndRef = useRef(null)
  
  // Sync loading state with prop
  const loading = isLoading

  const [followupLoading, setFollowupLoading] = useState(false)

  const formatResponse = (resp) => {
    if (!resp) return "No response."
    if (typeof resp === "string") return resp
    // Prefer known fields; fallback to pretty JSON
    const answer =
      resp.answer ||
      resp.response ||
      resp.text ||
      resp.content ||
      resp.summary
    if (answer) return answer
    try {
      return JSON.stringify(resp, null, 2)
    } catch (e) {
      return String(resp)
    }
  }
  
  const sendFollowup = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    const trimmed = question.trim()
    setFollowupLoading(true)
    setError(null)
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: trimmed }
    ])
    setQuestion("")
    console.log("#############Question inside NodeDetailModal###################:", trimmed)
    try {
      const resp = await makeRequest("generate-node-followup", {
        method: "POST",
        body: JSON.stringify({ topic, node_title: node.title, followup: trimmed })
      })
      console.log("#############QuestionResponse inside NodeDetailModal###################:", resp)
      const answerText = resp?.answer ? String(resp.answer) : formatResponse(resp)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: answerText }
      ])
    } catch (err) {
      setError(err.message || "Failed to ask question")
    } finally {
      setFollowupLoading(false)
    }
  }
  
  // Update detail when initialDetail prop changes
  useEffect(() => {
    setDetail(initialDetail)
    // Do not preload chat messages; start empty until user asks a follow-up
    setMessages([])
  }, [initialDetail])

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl px-8 py-6">
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {node?.title}
          </h2>
          <button 
            onClick={onClose} 
            className="rounded-xl hover:bg-white/10 p-2 transition-all hover:scale-110"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-100px)] px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-purple-400"></div>
            </div>
          ) : detail ? (
            <div className="space-y-8 text-white">
              {/* Definition */}
              {detail.definition && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="mb-3 text-xl font-semibold text-purple-300">Definition</h3>
                  <p className="text-white/90 leading-relaxed text-lg">{detail.definition}</p>
                </div>
              )}

              {/* Why Important */}
              {detail.why_important && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="mb-3 text-xl font-semibold text-blue-300">Why It Matters</h3>
                  <p className="text-white/90 leading-relaxed text-lg">{detail.why_important}</p>
                </div>
              )}

              {/* Examples */}
              {detail.examples && detail.examples.length > 0 && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="mb-4 text-xl font-semibold text-green-300">Examples</h3>
                  <ul className="space-y-3">
                    {detail.examples.map((ex, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 inline-block h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></span>
                        <span className="text-white/90 text-lg leading-relaxed">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interview Questions */}
              {detail.interview_questions && detail.interview_questions.length > 0 && (
                <div className="glassmorphism rounded-2xl p-6 border border-white/10">
                  <h3 className="mb-4 text-xl font-semibold text-yellow-300">Interview Questions</h3>
                  <div className="space-y-4">
                    {detail.interview_questions.map((item, idx) => (
                      <div key={idx} className="rounded-xl bg-white/5 p-5 border border-white/10">
                        <p className="mb-3 font-semibold text-lg text-yellow-200">Q: {item.q}</p>
                        <p className="text-white/90 text-lg leading-relaxed">A: {item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat history for follow-ups */}
              <div className="glassmorphism rounded-2xl p-4 border border-white/10 bg-white/5">
                <h3 className="mb-3 text-lg font-semibold text-white">Follow-up chat</h3>
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {messages.length === 0 && (
                    <p className="text-sm text-white/60">Ask a question to start the chat.</p>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-3xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                          msg.role === "user"
                            ? "bg-purple-600/70 text-white shadow-lg"
                            : "bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                {/* Follow-up input */}
                <form onSubmit={sendFollowup} className="mt-4 flex gap-3">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={`Ask about ${node.title}...`}
                    className="flex-1 rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button 
                    type="submit" 
                    disabled={followupLoading}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {followupLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      "Send"
                    )}
                  </button>
                </form>
                {error && (
                  <p className="mt-3 text-sm text-rose-400 bg-rose-500/20 rounded-lg px-3 py-2 border border-rose-500/30">
                    {error}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-white/70 text-lg">No details available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
