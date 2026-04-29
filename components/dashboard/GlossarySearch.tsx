'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, BookOpen, Languages } from 'lucide-react'
import { searchGlossary } from '../../lib/helaApi'
import { GlossaryResult } from '../../lib/types'

export default function GlossarySearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlossaryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'darija' | 'french' | 'english'>('darija')

  const handleSearch = useCallback(async (q: string, lang: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchGlossary(q, lang)
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query, language)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, language, handleSearch])

  const placeholders = {
    darija: "ابحث عن مصطلح...",
    french: "Rechercher un terme...",
    english: "Search a term..."
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-sky-50 rounded-2xl">
          <BookOpen className="w-6 h-6 text-sky-500" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Glossary Search</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">150+ Algerian medical terms</p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex p-1 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
        {(['darija', 'french', 'english'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
              language === lang ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {lang === 'darija' ? 'Darija' : lang === 'french' ? 'Français' : 'English'}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {loading ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" /> : <Search className="w-5 h-5 text-slate-400" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[language]}
          className={`w-full bg-white border-2 border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-sky-500/30 transition-all ${
            language === 'darija' ? 'text-right font-arabic text-lg' : ''
          }`}
          dir={language === 'darija' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {loading && results.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-[28px] animate-pulse" />
          ))
        ) : results.length > 0 ? (
          results.map((res, idx) => (
            <div key={idx} className="group bg-slate-50 hover:bg-sky-50/50 border border-slate-100 hover:border-sky-100 rounded-[28px] p-5 transition-all cursor-default">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-xl font-black text-slate-800 text-right font-arabic" dir="rtl">
                  {res.darija}
                </p>
                <span className="flex-shrink-0 bg-white px-2.5 py-1 rounded-full text-[9px] font-black text-sky-500 uppercase tracking-widest shadow-sm border border-slate-50">
                  {(res.similarity * 100).toFixed(0)}% Match
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tight overflow-hidden">
                <span className="truncate">{res.french}</span>
                <span>&middot;</span>
                <span className="truncate">{res.english}</span>
              </div>
              <div className="mt-3 inline-block px-2 py-0.5 bg-white rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-50">
                {res.category}
              </div>
            </div>
          ))
        ) : query ? (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-slate-400">No terms found matching "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Languages className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-loose">
              Type to search the<br />Darija medical dictionary
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
