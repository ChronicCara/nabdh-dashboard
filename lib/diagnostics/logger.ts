/**
 * Structured logger with an in-memory ring buffer.
 *
 * Goals:
 *   - Capture every connection attempt, failure, and recovery in a uniform shape.
 *   - Mirror entries to the console (with a "[v0]" prefix) so they show up in
 *     server logs and the browser devtools.
 *   - Expose the buffer to the diagnostics UI without keeping unbounded memory.
 *
 * The logger is a module-level singleton. On the server each Node worker has
 * its own buffer; on the client the buffer lives for the lifetime of the tab.
 * That matches what we want: live, recent context for whoever is looking at
 * the diagnostics dashboard.
 */

import type { LogEntry, LogLevel, IntegrationName } from './types'

const MAX_ENTRIES = 500

class DiagnosticsLogger {
  private buffer: LogEntry[] = []
  private listeners = new Set<(entry: LogEntry) => void>()

  log(entry: Omit<LogEntry, 'timestamp'>) {
    const full: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    }

    this.buffer.push(full)
    if (this.buffer.length > MAX_ENTRIES) {
      this.buffer.splice(0, this.buffer.length - MAX_ENTRIES)
    }

    // Mirror to console with a stable prefix so the v0 debug panel picks it up.
    const prefix = `[v0][${full.service}]`
    const tail =
      full.durationMs !== undefined ? ` (${full.durationMs}ms)` : ''
    const head = `${prefix} ${full.operation} → ${full.message}${tail}`

    switch (full.level) {
      case 'error':
        console.error(head, full.meta ?? '', full.error ?? '')
        break
      case 'warn':
        console.warn(head, full.meta ?? '')
        break
      case 'debug':
        console.debug(head, full.meta ?? '')
        break
      default:
        console.log(head, full.meta ?? '')
    }

    for (const listener of this.listeners) {
      try {
        listener(full)
      } catch {
        // listeners must not break logging
      }
    }
  }

  debug(
    service: LogEntry['service'],
    operation: string,
    message: string,
    extra: Partial<LogEntry> = {}
  ) {
    this.log({ level: 'debug', service, operation, message, ...extra })
  }

  info(
    service: LogEntry['service'],
    operation: string,
    message: string,
    extra: Partial<LogEntry> = {}
  ) {
    this.log({ level: 'info', service, operation, message, ...extra })
  }

  warn(
    service: LogEntry['service'],
    operation: string,
    message: string,
    extra: Partial<LogEntry> = {}
  ) {
    this.log({ level: 'warn', service, operation, message, ...extra })
  }

  error(
    service: LogEntry['service'],
    operation: string,
    message: string,
    extra: Partial<LogEntry> = {}
  ) {
    this.log({ level: 'error', service, operation, message, ...extra })
  }

  /**
   * Wraps an async operation with timing + structured logging.
   * Logs one entry per attempt and one final entry on success/failure.
   *
   * Returns the resolved value or re-throws so callers can react.
   */
  async withTimer<T>(
    service: IntegrationName | 'runner' | 'http',
    operation: string,
    fn: () => Promise<T>,
    meta: Record<string, unknown> = {}
  ): Promise<{ value: T; durationMs: number }> {
    const started = Date.now()
    this.debug(service, operation, 'started', { meta })
    try {
      const value = await fn()
      const durationMs = Date.now() - started
      this.info(service, operation, 'ok', { durationMs, meta })
      return { value, durationMs }
    } catch (err) {
      const durationMs = Date.now() - started
      const e = serializeError(err)
      this.error(service, operation, e.message, {
        durationMs,
        meta,
        error: e,
      })
      throw err
    }
  }

  getEntries(filter?: { level?: LogLevel; service?: string }): LogEntry[] {
    if (!filter) return [...this.buffer]
    return this.buffer.filter((e) => {
      if (filter.level && e.level !== filter.level) return false
      if (filter.service && e.service !== filter.service) return false
      return true
    })
  }

  clear() {
    this.buffer = []
  }

  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export function serializeError(err: unknown): NonNullable<LogEntry['error']> {
  if (err && typeof err === 'object') {
    const anyErr = err as {
      name?: string
      message?: string
      type?: string
      status?: number
    }
    return {
      name: anyErr.name,
      message:
        typeof anyErr.message === 'string' && anyErr.message.length > 0
          ? anyErr.message
          : JSON.stringify(err),
      type: anyErr.type,
    }
  }
  return { message: String(err) }
}

// Singleton — share one buffer per process / per browser tab.
declare global {
  // eslint-disable-next-line no-var
  var __nabdhDiagnosticsLogger: DiagnosticsLogger | undefined
}

export const diagnosticsLogger: DiagnosticsLogger =
  globalThis.__nabdhDiagnosticsLogger ??
  (globalThis.__nabdhDiagnosticsLogger = new DiagnosticsLogger())
