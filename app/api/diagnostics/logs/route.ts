import { NextResponse } from 'next/server'
import { diagnosticsLogger } from '@/lib/diagnostics/logger'
import type { LogLevel } from '@/lib/diagnostics/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const VALID_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error']

export async function GET(request: Request) {
  const url = new URL(request.url)
  const level = url.searchParams.get('level')
  const service = url.searchParams.get('service')
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 500)

  const filter: { level?: LogLevel; service?: string } = {}
  if (level && VALID_LEVELS.includes(level as LogLevel)) {
    filter.level = level as LogLevel
  }
  if (service) filter.service = service

  const entries = diagnosticsLogger.getEntries(filter)
  return NextResponse.json(
    { entries: entries.slice(-limit) },
    { headers: { 'cache-control': 'no-store' } }
  )
}

export async function DELETE() {
  diagnosticsLogger.clear()
  return NextResponse.json({ cleared: true })
}
