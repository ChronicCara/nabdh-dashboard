import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopNav from '../../components/layout/TopNav'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <TopNav doctorName="Dr. Benali" />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
