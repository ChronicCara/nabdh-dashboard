import { supabase } from './supabase'
import { DashboardStats, PatientWithLatestAssessment, PatientAssessment, InviteCode, FamilyMember } from './types'

export async function getDashboardStats(doctorId: string): Promise<DashboardStats> {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Get doctor's patient IDs first
    const { data: relationships } = await supabase
      .from('doctor_patient_relationships')
      .select('patient_id')
      .eq('doctor_id', doctorId)
      .eq('access_level', 'ACTIVE')
    
    const patientIds = (relationships || []).map(r => r.patient_id)

    // totalPatients
    const totalPatients = patientIds.length
    
    // highRiskToday
    let highRiskToday = 0
    if (patientIds.length > 0) {
      const { count } = await supabase
        .from('patient_assessments')
        .select('*', { count: 'exact', head: true })
        .in('patient_id', patientIds)
        .eq('risk_level', 'HIGH')
        .gte('assessment_date', todayStr)
      highRiskToday = count || 0
    }

    // avgRiskScoreToday
    let avgRiskScoreToday = 0
    if (patientIds.length > 0) {
      const { data: assessmentsToday } = await supabase
        .from('patient_assessments')
        .select('risk_score')
        .in('patient_id', patientIds)
        .gte('assessment_date', todayStr)
      
      if (assessmentsToday && assessmentsToday.length > 0) {
        const sum = assessmentsToday.reduce((acc, curr) => acc + curr.risk_score, 0)
        avgRiskScoreToday = sum / assessmentsToday.length
      }
    }

    // modelAccuracy
    const { data: accuracyData } = await supabase
      .from('model_metrics')
      .select('metric_value')
      .eq('metric_name', 'accuracy')
      .order('metric_timestamp', { ascending: false })
      .limit(1)
      .single()

    return {
      totalPatients: totalPatients,
      highRiskToday: highRiskToday,
      avgRiskScoreToday,
      modelAccuracy: accuracyData?.metric_value || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalPatients: 0,
      highRiskToday: 0,
      avgRiskScoreToday: 0,
      modelAccuracy: 0
    }
  }
}

export async function getAllPatientsWithLatestAssessment(doctorId: string): Promise<PatientWithLatestAssessment[]> {
  try {
    const { data: relationships, error: relError } = await supabase
      .from('doctor_patient_relationships')
      .select('patient_id, access_level')
      .eq('doctor_id', doctorId)
    
    if (relError || !relationships || relationships.length === 0) return []
    
    const patientIds = relationships.map(r => r.patient_id)
    const accessLevels = relationships.reduce((acc, curr) => {
      acc[curr.patient_id] = curr.access_level
      return acc
    }, {} as Record<number, string>)

    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .in('id', patientIds)
    
    if (error || !patients) return []

    const patientsWithAssessments = await Promise.all(
      patients.map(async (patient) => {
        const { data: assessment } = await supabase
          .from('patient_assessments')
          .select('*')
          .eq('patient_id', patient.id)
          .order('assessment_date', { ascending: false })
          .limit(1)
          .single()
        
        return {
          ...patient,
          latest_assessment: (assessment as PatientAssessment) || null,
          access_level: accessLevels[patient.id] as any
        }
      })
    )

    return patientsWithAssessments
  } catch (error) {
    console.error('Error fetching patients with assessments:', error)
    return []
  }
}

export async function getPatientAssessmentHistory(
  patientId: number, 
  limit: number = 10
): Promise<PatientAssessment[]> {
  try {
    const { data, error } = await supabase.rpc('get_patient_assessments', {
      p_patient_id: patientId,
      limit_results: limit
    })
    
    if (error || !data) return []

    // Return ordered by assessment_date ASC (oldest -> newest for charts)
    return (data as PatientAssessment[]).sort(
      (a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
    )
  } catch (error) {
    console.error('Error fetching patient assessment history:', error)
    return []
  }
}

export async function getRiskDistributionToday(): Promise<{ risk_level: string; count: number }[]> {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const { data, error } = await supabase
      .from('patient_assessments')
      .select('risk_level')
      .gte('assessment_date', todayStr)
    
    if (error || !data) return []

    const counts: Record<string, number> = {
      'LOW': 0,
      'MODERATE': 0,
      'HIGH': 0
    }

    data.forEach(item => {
      if (item.risk_level in counts) {
        counts[item.risk_level]++
      } else {
        counts[item.risk_level] = 1
      }
    })

    return [
      { risk_level: 'LOW', count: counts['LOW'] },
      { risk_level: 'MODERATE', count: counts['MODERATE'] },
      { risk_level: 'HIGH', count: counts['HIGH'] }
    ]
  } catch (error) {
    console.error('Error fetching risk distribution:', error)
    return []
  }
}

export async function generatePatientInviteCode(
  doctorId: string,
  doctorName: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('generate_invite_code', {
      p_doctor_id: doctorId,
      p_doctor_name: doctorName
    })

    if (error) {
      console.error('Supabase RPC Error:', error.message, error.details, error.hint)
      return null
    }

    return data as string
  } catch (error) {
    console.error('Unexpected Error:', error)
    return null
  }
}

export async function getActiveInviteCodes(
  doctorId: string
): Promise<InviteCode[]> {
  try {
    const { data, error } = await supabase
      .from('doctor_invite_codes')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as InviteCode[]
  } catch (error) {
    console.error('Error fetching active invite codes:', error)
    return []
  }
}

export async function getPatientFamilyMembers(
  patientId: number
): Promise<FamilyMember[]> {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('patient_id', patientId)

    if (error || !data) return []
    return data as FamilyMember[]
  } catch (error) {
    console.error('Error fetching family members:', error)
    return []
  }
}

export async function getNewPatientsSince(
  doctorId: string,
  since: string
): Promise<PatientWithLatestAssessment[]> {
  try {
    const { data: relationships, error: relError } = await supabase
      .from('doctor_patient_relationships')
      .select('patient_id')
      .eq('doctor_id', doctorId)
      .eq('access_level', 'ACTIVE')
      .gte('treatment_start', since)

    if (relError || !relationships || relationships.length === 0) return []

    const patientIds = relationships.map(r => r.patient_id)

    const { data: patients, error: pError } = await supabase
      .from('patients')
      .select('*')
      .in('id', patientIds)

    if (pError || !patients) return []

    const patientsWithAssessments = await Promise.all(
      patients.map(async (patient) => {
        const { data: assessment } = await supabase
          .from('patient_assessments')
          .select('*')
          .eq('patient_id', patient.id)
          .order('assessment_date', { ascending: false })
          .limit(1)
          .single()

        return {
          ...patient,
          latest_assessment: (assessment as PatientAssessment) || null
        }
      })
    )

    return patientsWithAssessments
  } catch (error) {
    console.error('Error fetching new patients:', error)
    return []
  }
}

export async function usePatientInviteCode(
  code: string,
  patientId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.rpc('use_invite_code', {
      p_code: code,
      p_patient_id: patientId
    })

    if (error) {
      console.error('Error using invite code:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Invite code used successfully' }
  } catch (error) {
    console.error('Error using invite code:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

