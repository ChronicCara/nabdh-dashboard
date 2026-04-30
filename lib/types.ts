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
  predicted_risk_level: 0 | 1 | 2   // 0=Low, 1=Mod, 2=High
  symptoms: string           // latest note
  category?: "LOW" | "MODERATE" | "HIGH" // Keep for UI compatibility if needed
}

export interface HelaHistoryPoint {
  date: string               // ISO timestamp
  systolic: number | null
  diastolic: number | null
  glucose: number | null
  risk: "LOW" | "MODERATE" | "HIGH" | null
  summary?: string
}

export interface HelaDriftResult {
  long_term_adherence: number    // 30-day rate 0-1
  short_term_adherence: number   // 3-day rate 0-1
  adherence_drop: number         // % drop or absolute drop
  trigger_notification: boolean
  nurture_message_darija?: string
}

export interface HelaDocterChatResponse {
  answer: string             // French clinical response
  history_analyzed: number   // count of records analyzed
  sources?: string[]         
  confidence?: number        
}

export interface HelaOnboardRequest {
  profile: {
    id?: string // for import path
    name?: string
    age?: number
    gender?: string
    phone?: string
    email?: string
    address?: string
    family_contact_name?: string
    family_contact_phone?: string
    medical_history_summary?: string
    family_access_granted?: boolean
  }
  initial_vitals?: {
    systolic_bp: number
    diastolic_bp: number
    fasting_glucose: number
    bmi: number
  }
  is_import: boolean
  verification_otp?: string
}

export interface HelaOnboardResponse {
  patient_id: string
  otp?: string
  ai_analysis: {
    clinical_summary: string
    welcome_message_darija: string
    suggested_focus?: string
  }
  initial_risk?: "LOW" | "MODERATE" | "HIGH"
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

export interface MedicalGlossaryItem {
  id: number
  darija_term: string
  french_term: string | null
  english_term: string | null
  category: string
  severity: number | null
  description: string | null
  related_terms: string[] | null
  created_at?: string
}

export interface GlossaryResult extends MedicalGlossaryItem {
  similarity?: number
}

// PATIENT COMPANION TYPES
export interface HelaCheckInRequest {
  patient_id: string
  vitals: {
    systolic_bp?: number
    diastolic_bp?: number
    fasting_glucose?: number
    weight_kg?: number
  }
}

export interface HelaCheckInResponse {
  success: boolean
  encouragement_darija: string
  clinical_summary?: string
  risk_status?: "LOW" | "MODERATE" | "HIGH"
}

export interface Medication {
  id: string
  name: string
  dosage: string
  instructions_darija: string
  image_url: string
  taken_today: boolean
  frequency: string
}
