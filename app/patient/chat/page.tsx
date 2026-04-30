'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, Brain, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'hela'
  content: string
  timestamp: Date
  clinical_summary?: string
}

export default function PatientChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'hela',
      content: 'Salam Fatima! Ana Hela, l-moussa3ida d-dyaltek l-clinical. Kifach ne9der n-3awnek l-youm?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      // Simulate Algerian AI response
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const helaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'hela',
        content: "3la 7sab had l-m3loumat li 3titini, rahou l-glace (sugar) dyalek mreguel dorka. Bessah had l-se3la li rahi fik lazm nchoufouha mli7. Wach raki t'7assi b d-di9 f s-sder?",
        timestamp: new Date(),
        clinical_summary: "Patient reports persistent cough; blood sugar stable at 0.98 g/L. No acute distress but monitoring for respiratory symptoms is advised."
      }
      
      setMessages(prev => [...prev, helaMessage])
    } catch (err) {
      console.error(err)
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              m.role === 'hela' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
            }`}>
              {m.role === 'hela' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
              <div className={`p-5 rounded-[24px] text-[15px] font-bold leading-relaxed shadow-sm ${
                m.role === 'hela' 
                  ? 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none' 
                  : 'bg-primary text-white rounded-tr-none'
              }`}>
                {m.content}
              </div>
              
              {m.clinical_summary && (
                <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
                  <div className="mt-0.5"><Sparkles className="w-4 h-4 text-emerald-500" /></div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Clinical Summary</p>
                    <p className="text-[11px] font-bold text-emerald-800/70 leading-tight italic">{m.clinical_summary}</p>
                  </div>
                </div>
              )}
              
              <p className={`text-[9px] font-black text-slate-300 uppercase tracking-widest ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Brain className="w-5 h-5" />
            </div>
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px] rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hela is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-6 border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[28px] p-2 pr-4 shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Hela about your health in Algerian Darija..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-bold text-slate-800 placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
