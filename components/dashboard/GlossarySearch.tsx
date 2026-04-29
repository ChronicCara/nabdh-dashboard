'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, BookOpen, Languages } from 'lucide-react'
import { searchGlossary } from '../../lib/queries'
import { GlossaryResult } from '../../lib/types'

export default function GlossarySearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlossaryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'darija' | 'french' | 'english'>('darija')

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchGlossary(q)
      setResults(data as GlossaryResult[])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const placeholders = {
    darija: "ابحث عن مصطلح...",
    french: "Rechercher un terme...",
    english: "Search a term..."
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Medical Glossary</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Clinical Terminology Helper</p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex p-1.5 bg-slate-50 rounded-[20px] mb-8 border border-slate-100/50">
        {(['darija', 'french', 'english'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              language === lang ? 'bg-white text-primary shadow-sm border border-slate-100 scale-100' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {lang === 'darija' ? 'Darija' : lang === 'french' ? 'French' : 'English'}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-10 group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {loading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[language]}
          className={`w-full bg-slate-50/50 border border-slate-200 rounded-[24px] py-4 pl-14 pr-6 text-sm font-black focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all ${
            language === 'darija' ? 'text-right font-arabic text-lg' : ''
          }`}
          dir={language === 'darija' ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
        {loading && results.length === 0 ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-[32px] animate-pulse" />
          ))
        ) : results.length > 0 ? (
          results.map((res, idx) => (
            <div key={idx} className="group bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-primary/20 rounded-[32px] p-6 transition-all duration-300">
              <div className="flex items-start justify-between gap-6 mb-3">
                <p className="text-2xl font-black text-slate-900 text-right font-arabic" dir="rtl">
                  {res.darija_term}
                </p>
                {res.severity && (
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${res.severity > 3 ? 'bg-rose-500 shadow-sm shadow-rose-200' : 'bg-emerald-500 shadow-sm shadow-emerald-200'}`} />
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider overflow-hidden">
                <span className="truncate">{res.french_term}</span>
                <div className="w-1 h-1 rounded-full bg-slate-200 flex-shrink-0" />
                <span className="truncate">{res.english_term}</span>
              </div>
              
              {res.description && (
                <p className="mt-4 text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {res.description}
                </p>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary/10">
                  {res.category}
                </span>
                {res.related_terms && res.related_terms.length > 0 && (
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    +{res.related_terms.length} related
                  </span>
                )}
              </div>
            </div>
          ))
        ) : query ? (
          <div className="text-center py-10">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No terms found</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Languages className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-loose">
              Search the clinical<br />medical dictionary
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
