import React from 'react'
import { Search } from 'lucide-react'

type RiskFilter = 'ALL' | 'LOW' | 'MODERATE' | 'HIGH'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  riskFilter: RiskFilter
  onRiskFilterChange: (v: RiskFilter) => void
  totalShown: number
  totalAll: number
}

export default function FilterBar({ 
  searchQuery, 
  onSearchChange, 
  riskFilter, 
  onRiskFilterChange, 
  totalShown, 
  totalAll 
}: FilterBarProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        
        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="border border-slate-200 rounded-[18px] pl-11 pr-4 py-3 w-full sm:w-80 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100/30 p-1.5 rounded-[20px] border border-slate-200/60 shadow-inner">
          {(['ALL', 'LOW', 'MODERATE', 'HIGH'] as RiskFilter[]).map((filter) => {
            const isActive = riskFilter === filter
            return (
              <button
                key={filter}
                onClick={() => onRiskFilterChange(filter)}
                className={`
                  px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all duration-300
                  ${isActive 
                    ? 'bg-white text-primary shadow-sm border border-slate-100 scale-100' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/30'
                  }
                `}
              >
                {filter}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Small text below */}
      <div className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
        Inventory: <span className="text-slate-500">{totalShown} patients shown</span>
      </div>
    </div>
  )
}
