import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nabdh Health App - Doctor Dashboard',
  description: 'Doctor dashboard for Nabdh Health App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
