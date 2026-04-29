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
  /** POST /chat */
  static async chat(
    payload: HelaChatRequest
  ): Promise<Result<HelaChatResponse, ApiError>> {
    try {
      const { data } = await api.post<HelaChatResponse>('/chat', payload);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patient/{id}/check-drift */
  static async checkDrift(
    patientId: string
  ): Promise<Result<HelaDriftResult, ApiError>> {
    try {
      const { data } = await api.get<HelaDriftResult>(
        `/patient/${patientId}/check-drift`
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patient/{id}/profile */
  static async getPatientProfile(
    patientId: string
  ): Promise<Result<Patient, ApiError>> {
    try {
      const { data } = await api.get<Patient>(`/patient/${patientId}/profile`);
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patient/{id}/history */
  static async getPatientHistory(
    patientId: string,
    days: number = 30
  ): Promise<Result<HelaHistoryPoint[], ApiError>> {
    try {
      const { data } = await api.get<HelaHistoryPoint[]>(
        `/patient/${patientId}/history?days=${days}`
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /patients/risk-queue */
  static async getRiskQueue(): Promise<Result<HelaRiskQueueItem[], ApiError>> {
    try {
      const { data } = await api.get<HelaRiskQueueItem[]>('/patients/risk-queue');
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

  /** POST /glossary/search */
  static async glossarySearch(
    query: string,
    language: string = "darija",
    limit: number = 10
  ): Promise<Result<GlossaryResult[], ApiError>> {
    try {
      const { data } = await api.post<GlossaryResult[]>('/glossary/search', {
        query,
        language,
        limit
      });
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** GET /health */
  static async healthCheck(): Promise<Result<HealthResponse, ApiError>> {
    try {
      const { data } = await api.get<HealthResponse>('/health');
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }

  /** POST /patients/onboard */
  static async onboardPatient(
    payload: HelaOnboardRequest
  ): Promise<Result<HelaOnboardResponse, ApiError>> {
    try {
      const { data } = await api.post<HelaOnboardResponse>(
        '/patients/onboard',
        payload
      );
      return Ok(data);
    } catch (e) {
      return Err(e as ApiError);
    }
  }
}
