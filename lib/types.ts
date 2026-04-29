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
