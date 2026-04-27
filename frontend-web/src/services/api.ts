import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ImmigrationOffice,
  VisaApplication,
  StatusHistoryEntry,
  ApplicationDocument,
  DocumentType
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  
  getCurrentUser: () => 
    api.get<User>('/users/me'),
};

// Offices
export const officeAPI = {
  search: (params?: { city?: string; type?: string }) =>
    api.get<ImmigrationOffice[]>('/offices/nearest', { params }),
  
  getById: (id: string) => 
    api.get<ImmigrationOffice>(`/offices/${id}`),
};

// Visa Applications
export const visaAPI = {
  getMe: () =>
    api.get<VisaApplication[]>('/applications/me'),

  getById: (id: string) =>
    api.get<VisaApplication>(`/applications/${id}`),

  getHistory: (id: string) =>
    api.get<StatusHistoryEntry[]>(`/applications/${id}/history`),

  create: (data: { visaType: string; notes?: string; officeId?: number }) =>
    api.post<VisaApplication>('/applications', data),

  updateStatus: (id: string, status: string) =>
    api.put<VisaApplication>(`/applications/${id}/status`, { status }),
};

// Application Documents
export const documentAPI = {
  list: (applicationId: string) =>
    api.get<ApplicationDocument[]>(`/applications/${applicationId}/documents`),

  upload: (applicationId: string, documentType: DocumentType, file: File) => {
    const form = new FormData();
    form.append('documentType', documentType);
    form.append('file', file);
    return api.post<ApplicationDocument>(
      `/applications/${applicationId}/documents`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  download: (applicationId: string, documentId: string) =>
    api.get<Blob>(
      `/applications/${applicationId}/documents/${documentId}/download`,
      { responseType: 'blob' }
    ),

  delete: (applicationId: string, documentId: string) =>
    api.delete<void>(`/applications/${applicationId}/documents/${documentId}`),
};

export default api;