export interface Patient {
  id: string
  patient_id?: string
  first_name: string | null
  last_name: string | null
  age: number | null
  gender: string | null
  medical_history: string | null
  consent_given?: boolean
  created_at?: string
  updated_at?: string
}

export interface PatientAssessment {
  id: number | string
  patient_id: string
  age: number
  systolic_bp: number
  diastolic_bp: number
  fasting_glucose: number
  bmi: number
  smoking: boolean
  family_history: boolean
  comorbidities: number
  risk_score: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH'
  assessment_date: string
}

export interface ModelMetric {
  id: number
  metric_name: string
  metric_value: number
  metric_timestamp: string
  model_version: string | null
}

export interface PatientWithLatestAssessment extends Patient {
  latest_assessment: PatientAssessment | null
}

export interface DashboardStats {
  totalPatients: number
  highRiskToday: number
  avgRiskScoreToday: number
  modelAccuracy: number
}

export interface InviteCode {
  id: string
  code: string
  doctor_id: string
  used: boolean
}

export interface DoctorPatientRelationship {
  id: string
  doctor_id: string
  patient_id: string
}

export interface FamilyMember {
  id: number | string
  patient_id: number | string
  first_name: string | null
  last_name: string | null
  relationship: string | null
  phone: string | null
  family_code: string | null
  family_code_used: boolean
}

// HELLA AI BACKEND INTERFACES
export interface RiskAssessmentResponse {
  risk_level: number      // 0 = LOW, 1 = MODERATE, 2 = HIGH
  risk_score: number      // 0–10 scale (NOT 0–1)
  category: "LOW" | "MODERATE" | "HIGH"   // USE THIS for UI
  probabilities: { low: number; moderate: number; high: number }
  recommendations: string[]
  monitoring_frequency: string
}

export interface ClinicalEntities {
  symptoms: string[]
  medications: string[]
  missed_medications: string[]
  vitals: {
    systolic_bp?: number
    diastolic_bp?: number
    glucose?: number
    bmi?: number
  }
  clinical_note: string
}

export interface HelaRiskQueueItem {
  patient_id: string
  risk_score: number         // 0-10
  predicted_risk_level: number   // 0/1/2
  category: "LOW" | "MODERATE" | "HIGH"
}

export interface HelaHistoryPoint {
  date: string               // ISO timestamp
  systolic_bp: number | null
  diastolic_bp: number | null
  fasting_glucose: number | null
  bmi: number | null
  risk_score: number | null  // 0-10
  category: "LOW" | "MODERATE" | "HIGH" | null
  summary?: string
}

export interface HelaDriftResult {
  trigger_notification: boolean
  nurture_message_darija: string
  short_term_adherence: number   // 3-day rate 0-1
  long_term_adherence: number    // 30-day rate 0-1
  drop_percentage: number        // % drop from long to short term
}

export interface HelaDocterChatResponse {
  answer: string             // French clinical response
  sources: string[]          // referenced history points
  confidence: number         // 0-1
}

export interface HelaChatResponse {
  nour_response: string      // Darija reply for patient
  clinical_entities: ClinicalEntities
  risk_assessment: RiskAssessmentResponse
  recommendations: string[]
}

export interface HelaChatRequest {
  patient_id: string
  patient_symptoms: string
  patient_data: {
    age: number
    systolic_bp: number
    diastolic_bp: number
    fasting_glucose: number
    bmi: number
    smoking: boolean
    family_history: boolean
    comorbidities: number
  }
  include_glossary: boolean
}

export interface GlossaryResult {
  term: string
  darija: string
  french: string
  english: string
  category: string
  similarity: number
}
