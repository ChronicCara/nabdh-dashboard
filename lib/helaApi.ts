import { 
  HelaRiskQueueItem, 
  HelaHistoryPoint, 
  HelaDriftResult, 
  HelaDocterChatResponse, 
  GlossaryResult 
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_HELA_API_URL || 
                 process.env.HELA_API_URL || 
                 "https://web-production-fadce.up.railway.app/api/v1"

const getHeaders = () => {
  const key = process.env.HELA_API_KEY ?? 
              process.env.NEXT_PUBLIC_HELA_API_KEY ?? ""
  return {
    "Content-Type": "application/json",
    "X-Internal-Key": key
  }
}

async function helaFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  // Normalize path to prevent double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const url = `${BASE_URL}${cleanPath}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options?.headers
      }
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`Hela API Error [${response.status}]: ${url}`)
      console.error("Server response body:", body)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Hela Fetch Failure: ${path}`, error)
    return null
  }
}

export async function getRiskQueue(): Promise<HelaRiskQueueItem[]> {
  const data = await helaFetch<HelaRiskQueueItem[]>("/patients/risk-queue")
  return data ?? []
}

export async function getPatientHistory(
  patientId: string, 
  days: number = 30
): Promise<HelaHistoryPoint[]> {
  const data = await helaFetch<HelaHistoryPoint[]>(`/patient/${patientId}/history?days=${days}`)
  if (!data) return []
  // Ensure sorted by date ASC for charts
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function checkPatientDrift(
  patientId: string
): Promise<HelaDriftResult | null> {
  return await helaFetch<HelaDriftResult>(`/patient/${patientId}/check-drift`)
}

export async function askDoctorChat(
  patientId: string,
  question: string,
  includeRawHistory: boolean = false
): Promise<HelaDocterChatResponse | null> {
  return await helaFetch<HelaDocterChatResponse>("/doctor/chat", {
    method: "POST",
    body: JSON.stringify({
      patient_id: patientId,
      question: question,
      include_raw_history: includeRawHistory
    })
  })
}

export async function generatePDFReport(
  patientId: string,
  patientName: string,
  adherenceDays: number = 30
): Promise<Blob | null> {
  try {
    const url = `${BASE_URL}/reports/generate?patient_id=${patientId}&patient_name=${encodeURIComponent(patientName)}&adherence_days=${adherenceDays}`
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders()
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`PDF Generation Error [${response.status}]: ${url}`)
      console.error("Server response body:", body)
      return null
    }

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
  const data = await helaFetch<GlossaryResult[]>("/glossary/search", {
    method: "POST",
    body: JSON.stringify({ query, limit, language })
  })
  return data ?? []
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      headers: getHeaders()
    })
    
    if (!response.ok) {
      const body = await response.text()
      console.error(`Health Check Error [${response.status}]`)
      console.error("Server response body:", body)
      return false
    }

    const data = await response.json()
    // Hela backend returns {"status":"healthy"}
    return data?.status === "healthy" || data?.status === "ok"
  } catch (error) {
    return false
  }
}
