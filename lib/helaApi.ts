import { HelaApiService } from './api/HelaApiService'
import { 
  HelaRiskQueueItem, 
  HelaHistoryPoint, 
  HelaDriftResult, 
  HelaDocterChatResponse, 
  GlossaryResult 
} from './types'

export async function getRiskQueue(): Promise<HelaRiskQueueItem[]> {
  const result = await HelaApiService.getRiskQueue()
  return result.ok ? result.val : []
}

export async function getPatientHistory(
  patientId: string, 
  days: number = 30
): Promise<HelaHistoryPoint[]> {
  const result = await HelaApiService.getPatientHistory(patientId, days)
  if (!result.ok) return []
  const data = result.val
  // Ensure sorted by date ASC for charts
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function checkPatientDrift(
  patientId: string
): Promise<HelaDriftResult | null> {
  const result = await HelaApiService.checkDrift(patientId)
  return result.ok ? result.val : null
}

export async function askDoctorChat(
  patientId: string,
  question: string,
  includeRawHistory: boolean = false
): Promise<HelaDocterChatResponse | null> {
  const result = await HelaApiService.askDoctorChat(patientId, question, includeRawHistory)
  return result.ok ? result.val : null
}

export async function generatePDFReport(
  patientId: string,
  patientName: string,
  adherenceDays: number = 30
): Promise<Blob | null> {
  // Keeping this one with fetch for now as it returns a Blob, 
  // or I could add it to HelaApiService if needed.
  // For now, let's keep it consistent with the others if possible.
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_HELA_API_URL || "https://web-production-fadce.up.railway.app/api/v1"
    const url = `${BASE_URL}/reports/generate?patient_id=${patientId}&patient_name=${encodeURIComponent(patientName)}&adherence_days=${adherenceDays}`
    
    const key = process.env.NEXT_PUBLIC_HELA_API_KEY || ""
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Internal-Key": key
      }
    })

    if (!response.ok) return null
    return await response.blob()
  } catch (error) {
    console.error("Unexpected error generating PDF:", error)
    return null
  }
}

export async function searchGlossary(
  query: string,
  language: string = "darija",
  limit: number = 10
): Promise<GlossaryResult[]> {
  const result = await HelaApiService.glossarySearch(query, language, limit)
  return result.ok ? result.val : []
}

export async function checkHealth(): Promise<boolean> {
  const result = await HelaApiService.healthCheck()
  if (!result.ok) return false
  const data = result.val
  return data?.status === "healthy" || data?.status === "ok"
}
