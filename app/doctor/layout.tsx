import React from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopNav from '../../components/layout/TopNav'

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Subtle sky aurora to anchor the glassmorphism aesthetic */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 40% at 0% 0%, rgba(14, 165, 233, 0.10) 0%, transparent 60%), radial-gradient(50% 35% at 100% 0%, rgba(224, 242, 254, 0.6) 0%, transparent 60%)',
        }}
      />

      <Sidebar />

      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <TopNav doctorName="Dr. Benali" />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
