import DiagnosticsPageClient from '@/components/pages/DiagnosticsPageClient'

export const metadata = {
  title: 'Integration Diagnostics | NABDH Health',
  description: 'Monitor and verify integration health across all connected services',
}

export default function DiagnosticsPage() {
  return <DiagnosticsPageClient />
}
