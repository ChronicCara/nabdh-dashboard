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
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 w-full sm:w-72 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-slate-700 placeholder:text-slate-400"
            placeholder="Search by patient name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['ALL', 'LOW', 'MODERATE', 'HIGH'] as RiskFilter[]).map((filter) => {
            const isActive = riskFilter === filter
            return (
              <button
                key={filter}
                onClick={() => onRiskFilterChange(filter)}
                className={`
                  px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
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
      <div className="mt-3 text-xs font-medium text-slate-400">
        Showing <span className="text-slate-700">{totalShown}</span> of <span className="text-slate-700">{totalAll}</span> patients
      </div>
    </div>
  )
}
