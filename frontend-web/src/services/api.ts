import axios from 'axios';
import type {
  AuthResponse, LoginRequest, RegisterRequest, User,
  UserProfile, OnboardingStepRequest, OnboardingFinalizeResponse,
  UserJourney, TaskDto, TaskListResponse, TaskStatus,
  PartnerCard, PartnerDetail, PartnerClickResponse, PartnerCategory,
  OfficeDto, VaultDocumentListResponse, VaultDocumentDto,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  getCurrentUser: () => api.get<User>('/users/me'),
  deleteSelf: () => api.delete('/users/me'),
};

// ── Profile + onboarding ────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get<UserProfile>('/users/me/profile'),
  patch: (body: Partial<UserProfile>) => api.patch<UserProfile>('/users/me/profile', body),
};

export const onboardingAPI = {
  saveStep: (n: number, body: OnboardingStepRequest) =>
    api.post<void>(`/users/me/onboarding/step/${n}`, body),
  finalize: () => api.post<OnboardingFinalizeResponse>('/users/me/onboarding/finalize'),
};

// ── Journeys + tasks ────────────────────────────────────────────────────────
export const journeyAPI = {
  list: (status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') =>
    api.get<UserJourney[]>('/journeys', { params: status ? { status } : {} }),
  get: (id: string) => api.get<UserJourney>(`/journeys/${id}`),
};

export const taskAPI = {
  list: (params?: { status?: TaskStatus; journeyId?: string; page?: number; size?: number }) =>
    api.get<TaskListResponse>('/tasks', { params }),
  get: (id: string) => api.get<{ task: TaskDto; journey: UserJourney; requiredDocuments: { type: string; satisfied: boolean }[] }>(`/tasks/${id}`),
  complete: (id: string) => api.patch<TaskDto>(`/tasks/${id}`, { status: 'COMPLETE' }),
  postpone: (id: string, postponedUntil: string) => api.patch<TaskDto>(`/tasks/${id}`, { postponedUntil }),
  skip: (id: string, reason?: string) => api.post<TaskDto>(`/tasks/${id}/skip`, { reason }),
};

// ── Marketplace ─────────────────────────────────────────────────────────────
export const marketplaceAPI = {
  list: (category?: PartnerCategory) =>
    api.get<PartnerCard[]>('/marketplace', { params: category ? { category } : {} }),
  detail: (slug: string) => api.get<PartnerDetail>(`/partners/${slug}`),
  click: (slug: string, productCode?: string) =>
    api.post<PartnerClickResponse>(`/partners/${slug}/click`, null, { params: productCode ? { productCode } : {} }),
};

// ── Offices ─────────────────────────────────────────────────────────────────
export const officeAPI = {
  list: () => api.get<OfficeDto[]>('/offices'),
  nearest: (params?: { city?: string; lat?: number; lon?: number; limit?: number }) =>
    api.get<OfficeDto[]>('/offices/nearest', { params }),
  getById: (id: string) => api.get<OfficeDto>(`/offices/${id}`),
};

// ── Vault documents ─────────────────────────────────────────────────────────
export const vaultAPI = {
  list: (type?: string) =>
    api.get<VaultDocumentListResponse>('/documents', { params: type ? { type } : {} }),
  upload: (file: File, type?: string, title?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (type) form.append('type', type);
    if (title) form.append('title', title);
    return api.post<VaultDocumentDto>('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete<void>(`/documents/${id}`),
  attachToTask: (taskId: string, documentId: string) =>
    api.post(`/tasks/${taskId}/documents`, { documentId }),
};

export default api;
