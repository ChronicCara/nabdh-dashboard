export interface Patient {
  id: number
  patient_id: string
  first_name: string | null
  last_name: string | null
  age: number | null
  gender: string | null
  medical_history: string | null
  consent_given?: boolean
  created_at: string
  updated_at: string
}

export interface PatientAssessment {
  id: number
  patient_id: number
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
  access_level?: 'ACTIVE' | 'ARCHIVE_READ_ONLY'
}

export interface DashboardStats {
  totalPatients: number
  highRiskToday: number
  avgRiskScoreToday: number
  modelAccuracy: number
}

export interface InviteCode {
  id: number
  code: string
  doctor_id: string
  used: boolean
  used_by_patient_id: number | null
  created_at: string
  expires_at: string
}

export interface DoctorPatientRelationship {
  id: number
  doctor_id: string
  patient_id: number
  access_level: 'ACTIVE' | 'ARCHIVE_READ_ONLY'
  treatment_start: string
  treatment_end: string | null
}

export interface FamilyMember {
  id: number
  patient_id: number
  first_name: string | null
  last_name: string | null
  relationship: string | null
  phone: string | null
  family_code: string | null
  family_code_used: boolean
}
