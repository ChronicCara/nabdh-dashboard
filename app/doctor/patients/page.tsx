'use client'
export const dynamic = 'force-dynamic'


import React, { useState, useEffect, useMemo } from 'react'
import { PatientWithLatestAssessment, PatientAssessment } from '../../../lib/types'
import { getAllPatientsWithLatestAssessment, getPatientAssessmentHistory } from '../../../lib/queries'

import dynamic from 'next/dynamic'
import FilterBar from '../../../components/dashboard/FilterBar'
import PatientTable from '../../../components/dashboard/PatientTable'

const PatientDrawer = dynamic(() => import('../../../components/dashboard/PatientDrawer'), { 
  ssr: false,
  loading: () => <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 animate-pulse" />
})

// Quick inline error banner
function ErrorBanner({ message, onDismiss }: { message: string, onDismiss: () => void }) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-start justify-between">
      <span className="block sm:inline">{message}</span>
      <button onClick={onDismiss} className="ml-4 flex-shrink-0">
        <svg className="w-5 h-5 text-red-500 hover:text-red-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default function PatientsDirectoryPage() {
  const [patients, setPatients] = useState<PatientWithLatestAssessment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLatestAssessment | null>(null)
  const [assessmentHistory, setAssessmentHistory] = useState<PatientAssessment[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MODERATE' | 'HIGH'>('ALL')
  
  const [loading, setLoading] = useState(true)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const DOCTOR_ID = "00000000-0000-0000-0000-000000000000"

  useEffect(() => {
    let isMounted = true
    const fetchPatients = async () => {
      try {
        const res = await getAllPatientsWithLatestAssessment(DOCTOR_ID)
        if (isMounted) {
          setPatients(res)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError('Failed to load patients. Please try again.')
          setLoading(false)
        }
      }
    }
    fetchPatients()
    return () => { isMounted = false }
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        (p.first_name && p.first_name.toLowerCase().includes(q)) || 
        (p.last_name && p.last_name.toLowerCase().includes(q))
      
      if (!matchesSearch && q !== '') return false

      if (riskFilter !== 'ALL') {
        if (p.latest_assessment?.risk_level !== riskFilter) return false
      }
      return true
    })
  }, [patients, searchQuery, riskFilter])

  const handlePatientClick = async (patient: PatientWithLatestAssessment) => {
    setSelectedPatient(patient)
    setDrawerLoading(true)
    
    try {
      const history = await getPatientAssessmentHistory(patient.id)
      setAssessmentHistory(history)
    } catch (err) {
      console.error('Error fetching history:', err)
      setError(`Failed to load history for ${patient.first_name}`)
    } finally {
      setDrawerLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patients Directory</h2>
          <p className="text-slate-500 mt-1">Manage and view all patient records.</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <FilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          riskFilter={riskFilter}
          onRiskFilterChange={setRiskFilter}
          totalShown={filteredPatients.length}
          totalAll={patients.length}
        />
        
        <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden">
          <PatientTable 
            patients={filteredPatients}
            loading={loading}
            onPatientClick={handlePatientClick}
            selectedPatientId={selectedPatient?.id ?? null}
          />
        </div>
      </div>

      <PatientDrawer 
        patient={selectedPatient}
        assessmentHistory={assessmentHistory}
        loadingHistory={drawerLoading}
        onClose={() => setSelectedPatient(null)}
      />
    </>
  )
}
