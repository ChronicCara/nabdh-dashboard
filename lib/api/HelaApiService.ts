import api from './axiosInstance';
import {
  HelaChatRequest,
  HelaChatResponse,
  HelaDriftResult,
  GlossaryResult,
  HelaRiskQueueItem,
  HelaHistoryPoint,
  HelaDocterChatResponse,
  HelaOnboardRequest,
  HelaOnboardResponse,
  Patient
} from '../types';
import { ApiError } from './types';
import { Result, Ok, Err } from 'ts-results';

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, string>;
}

export class HelaApiService {
  /** POST /ai/chat */
  static async chat(
    payload: HelaChatRequest
  ): Promise<Result<HelaChatResponse, ApiError>> {
    try {
      const { data } = await api.post<HelaChatResponse>('/ai/chat', payload);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patients/{id}/check-drift */
  static async checkDrift(
    patientId: string
  ): Promise<Result<HelaDriftResult, ApiError>> {
    try {
      const { data } = await api.get<HelaDriftResult>(
        `/patients/${patientId}/check-drift`
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patients/{id}/profile */
  static async getPatientProfile(
    patientId: string
  ): Promise<Result<Patient, ApiError>> {
    try {
      const { data } = await api.get<Patient>(`/patients/${patientId}/profile`);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patients/{id}/history */
  static async getPatientHistory(
    patientId: string,
    days: number = 30
  ): Promise<Result<HelaHistoryPoint[], ApiError>> {
    try {
      const { data } = await api.get<HelaHistoryPoint[]>(
        `/patients/${patientId}/history?days=${days}`
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /doctor/risk-queue */
  static async getRiskQueue(): Promise<Result<HelaRiskQueueItem[], ApiError>> {
    try {
      const { data } = await api.get<HelaRiskQueueItem[]>('/doctor/risk-queue');
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** POST /doctor/chat */
  static async askDoctorChat(
    patientId: string,
    question: string,
    includeRawHistory: boolean = false
  ): Promise<Result<HelaDocterChatResponse, ApiError>> {
    try {
      const { data } = await api.post<HelaDocterChatResponse>('/doctor/chat', {
        patient_id: patientId,
        question: question,
        include_raw_history: includeRawHistory
      });
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /system/glossary */
  static async glossarySearch(
    query: string,
    language: string = "darija",
    limit: number = 10
  ): Promise<Result<GlossaryResult[], ApiError>> {
    try {
      const { data } = await api.get<GlossaryResult[]>('/system/glossary', {
        params: { query, language, limit }
      });
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /system/health */
  static async healthCheck(): Promise<Result<HealthResponse, ApiError>> {
    try {
      const { data } = await api.get<HealthResponse>('/system/health');
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** POST /doctor/onboard */
  static async onboardPatient(
    payload: HelaOnboardRequest
  ): Promise<Result<HelaOnboardResponse, ApiError>> {
    try {
      console.log("HEALA: Onboarding patient at /doctor/onboard", payload);
      const { data } = await api.post<HelaOnboardResponse>(
        '/doctor/onboard',
        payload
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** POST /patients/check-in */
  static async checkIn(
    payload: any
  ): Promise<Result<any, ApiError>> {
    try {
      const { data } = await api.post<any>('/patients/check-in', payload);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patients/{id}/prescriptions */
  static async getPrescriptions(
    patientId: string
  ): Promise<Result<any[], ApiError>> {
    try {
      const { data } = await api.get<any[]>(`/patients/${patientId}/prescriptions`);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }
}
