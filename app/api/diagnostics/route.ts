import { NextResponse } from 'next/server'
import { runDiagnostics } from '@/lib/diagnostics/runner'
import { diagnosticsLogger } from '@/lib/diagnostics/logger'

// Always run live — never serve a cached health check.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const url = new URL(request.url)
  const onlyParam = url.searchParams.get('only')
  const maxAttemptsParam = url.searchParams.get('maxAttempts')

  diagnosticsLogger.info('runner', 'http.GET /api/diagnostics', 'request received', {
    meta: { only: onlyParam, maxAttempts: maxAttemptsParam },
  })

  try {
    const report = await runDiagnostics({
      only: onlyParam ? onlyParam.split(',').map((s) => s.trim()) : undefined,
      maxAttempts: maxAttemptsParam ? Number(maxAttemptsParam) : undefined,
    })
    return NextResponse.json(report, {
      status: report.fullyLinked ? 200 : 503,
      headers: {
        'cache-control': 'no-store',
      },
    })
  } catch (err) {
    diagnosticsLogger.error('runner', 'http.GET /api/diagnostics', 'suite crashed', {
      error: { message: err instanceof Error ? err.message : String(err) },
    })
    return NextResponse.json(
      { error: 'Diagnostics suite crashed', message: String(err) },
      { status: 500 }
    )
  }
}
