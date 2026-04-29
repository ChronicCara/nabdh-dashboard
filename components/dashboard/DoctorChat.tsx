'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Sparkles, MessageSquare } from 'lucide-react'
import { askDoctorChat } from '../../lib/helaApi'

interface Message {
  role: 'doctor' | 'hela'
  text: string
  confidence?: number
}

interface DoctorChatProps {
  patientId: string | null
  patientName: string
}

export default function DoctorChat({ patientId, patientName }: DoctorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault()
    const text = overrideInput || input
    if (!text.trim() || !patientId || loading) return

    const newMessages: Message[] = [...messages, { role: 'doctor', text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await askDoctorChat(patientId, text)
      if (response) {
        setMessages([...newMessages, { 
          role: 'hela', 
          text: response.answer, 
          confidence: response.confidence 
        }])
      } else {
        setMessages([...newMessages, { 
          role: 'hela', 
          text: "Je suis désolé, je n'ai pas pu analyser l'historique du patient pour le moment." 
        }])
      }
    } catch (err) {
      setMessages([...newMessages, { 
        role: 'hela', 
        text: "Une erreur s'est produite lors de la connexion au serveur clinique." 
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!patientId) {
    return (
      <div className="h-[380px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
        <MessageSquare className="w-8 h-8 text-slate-200 mb-3" />
        <p className="text-sm font-bold text-slate-400">Select a patient to start clinical Q&A</p>
      </div>
    )
  }

  const suggestions = [
    "How has their BP changed this month?",
    "Did they miss any medications recently?",
    "What are their main risk factors?"
  ]

  return (
    <div className="h-[380px] flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h4 className="text-sm font-black text-slate-800 tracking-tight">Ask about {patientName}'s history</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Hela AI &middot; French/English</p>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-500" />
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-indigo-50 rounded-3xl mb-4">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">No clinical messages yet</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(undefined, s)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-2 rounded-2xl text-[11px] font-bold transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-[24px] ${
              msg.role === 'doctor' 
                ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-100' 
                : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              {msg.confidence !== undefined && (
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-200 pt-2">
                  AI Confidence: {(msg.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 px-5 py-4 rounded-[24px] rounded-bl-sm border border-slate-100">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-50 bg-slate-50/30 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask in French or English..."
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex-shrink-0"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  )
}
