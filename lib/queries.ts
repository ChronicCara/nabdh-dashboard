import { supabase } from './supabase'
import { DashboardStats, PatientWithLatestAssessment, PatientAssessment, InviteCode, FamilyMember } from './types'

export async function getDashboardStats(doctorId: string): Promise<DashboardStats> {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // Get doctor's patient IDs (no access_level filter - new schema)
    const { data: relationships } = await supabase
      .from('doctor_patient_relationships')
      .select('patient_id')
      .eq('doctor_id', doctorId)
    
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
    // New schema: no access_level column
    const { data: relationships, error: relError } = await supabase
      .from('doctor_patient_relationships')
      .select('patient_id')
      .eq('doctor_id', doctorId)
    
    if (relError || !relationships || relationships.length === 0) return []
    
    const patientIds = relationships.map(r => r.patient_id)

    // New schema: patient data comes from profiles table
    const { data: patients, error } = await supabase
      .from('profiles')
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
          latest_assessment: (assessment as PatientAssessment) || null
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
  patientId: string | number, 
  limit: number = 10
): Promise<PatientAssessment[]> {
  try {
    // Try the RPC first, fall back to direct query
    const { data, error } = await supabase.rpc('get_patient_assessments', {
      p_patient_id: patientId,
      limit_results: limit
    })
    
    if (error || !data) {
      // Fallback: direct query if RPC doesn't exist
      const { data: directData, error: directError } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('assessment_date', { ascending: false })
        .limit(limit)

      if (directError || !directData) return []

      return (directData as PatientAssessment[]).sort(
        (a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
      )
    }

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
    // Try RPC first
    const { data, error } = await supabase.rpc('generate_invite_code', {
      p_doctor_id: doctorId,
      p_doctor_name: doctorName
    })

    if (error) {
      // Fallback: insert directly into doctor_invite_codes
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
                   Math.random().toString(36).substring(2, 6).toUpperCase()
      
      const { error: insertError } = await supabase
        .from('doctor_invite_codes')
        .insert({
          doctor_id: doctorId,
          code: code,
          used: false
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return null
      }
      return code
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
    // New schema: no expires_at or created_at columns
    const { data, error } = await supabase
      .from('doctor_invite_codes')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('used', false)

    if (error || !data) return []
    return data as InviteCode[]
  } catch (error) {
    console.error('Error fetching active invite codes:', error)
    return []
  }
}

export async function getPatientFamilyMembers(
  patientId: string | number
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

export async function usePatientInviteCode(
  code: string,
  patientId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Try RPC first
    const { data, error } = await supabase.rpc('use_invite_code', {
      p_code: code,
      p_patient_id: patientId
    })

    if (error) {
      // Fallback: mark code as used directly
      const { error: updateError } = await supabase
        .from('doctor_invite_codes')
        .update({ used: true })
        .eq('code', code)
        .eq('used', false)

      if (updateError) {
        return { success: false, message: updateError.message }
      }
      return { success: true, message: 'Invite code used successfully' }
    }

    return { success: true, message: 'Invite code used successfully' }
  } catch (error) {
    console.error('Error using invite code:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}
