import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Urbanist, JetBrains_Mono } from 'next/font/google'

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-urbanist',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HEALA AI — Clinical Command Center',
  description:
    'Worklio-style clinical management platform with AI-prioritized risk queue, vitals trends, and Darija nurture messaging.',
}

export const viewport: Viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${jetbrainsMono.variable}`}
      style={{ backgroundColor: 'hsl(210 40% 98%)' }}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
