'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Loader2, KeyRound, Copy, Check, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react'
import { generatePatientInviteCode, getActiveInviteCodes } from '../../lib/queries'

interface InviteCodeModalProps {
  isOpen: boolean
  doctorId: string
  doctorName: string
  onClose: () => void
}

export default function InviteCodeModal({ isOpen, doctorId, doctorName, onClose }: InviteCodeModalProps) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeCodesCount, setActiveCodesCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const codeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isOpen) {
      setGeneratedCode(null)
      setCopied(false)
      setLoading(false)
      setError(null)
      getActiveInviteCodes(doctorId).then(codes => {
        setActiveCodesCount(codes.length)
      })
    }
  }, [isOpen, doctorId])

  const handleGenerate = async () => {
    setLoading(true)
    setCopied(false)
    setError(null)
    try {
      const code = await generatePatientInviteCode(doctorId, doctorName)
      if (code) {
        setGeneratedCode(code)
        setActiveCodesCount(prev => prev + 1)
      } else {
        setError('Database connection error. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedCode) return
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
    } catch {
      setCopied(true)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative overflow-hidden p-10 border border-slate-50" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors">
            <X className="w-5 h-5" />
          </button>

          {!generatedCode ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="p-6 bg-sky-50 rounded-[32px] text-sky-500 shadow-inner">
                  <KeyRound className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Create Invite</h2>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                Generate a secure, single-use code to link a new patient to your care group.
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-2xl font-bold">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-[24px] font-black shadow-lg shadow-sky-100 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                {loading ? 'GENERATING...' : 'GENERATE CODE'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="p-6 bg-emerald-50 rounded-[32px] text-emerald-500">
                  <ShieldCheck className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Code Generated</h2>
              <p className="text-sm text-slate-400 font-medium mb-8">Valid for 48 hours &middot; Single use only</p>
              
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 mb-8">
                <span ref={codeRef} className="font-mono text-4xl font-black tracking-[0.2em] text-slate-800 select-all">
                  {generatedCode}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex-[1.5] py-4 rounded-[24px] font-black text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'COPIED' : 'COPY CODE'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-[24px] font-black text-sm shadow-lg shadow-sky-100 transition-all duration-300"
                >
                  <RefreshCw className={`w-5 h-5 mx-auto ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {activeCodesCount > 0 && !generatedCode && (
            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                {activeCodesCount} Unused Codes Active
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
