import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User,
  ImmigrationOffice,
  VisaApplication 
} from '../types';

const API_URL = 'http://localhost:8080/api/v1';

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
    api.get<ImmigrationOffice[]>('/offices', { params }),
  
  getById: (id: string) => 
    api.get<ImmigrationOffice>(`/offices/${id}`),
};

// Visa Applications
export const visaAPI = {
  getMe: () =>
    api.get<VisaApplication[]>('/applications/me'),

  create: (data: { visaType: string; notes?: string; officeId?: number }) =>
    api.post<VisaApplication>('/applications', data),

  updateStatus: (id: string, status: string) =>
    api.put<VisaApplication>(`/applications/${id}/status`, { status }),
};

export default api;