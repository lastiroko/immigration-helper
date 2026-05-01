import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type {
  AuthResponse, User, UserProfile, OnboardingStepRequest, OnboardingFinalizeResponse,
  TaskDto, TaskListResponse, TaskStatus, PartnerCard, PartnerCategory,
} from './types';

const BASE = (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined)
  ?? 'https://immigration-helper-production.up.railway.app/api/v1';

const TOKEN_KEY = 'helfa.accessToken';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const client: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (email: string, password: string, name: string) =>
    client.post<AuthResponse>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }),
  me: () => client.get<User>('/users/me'),
};

export const profileApi = {
  get: () => client.get<UserProfile>('/users/me/profile'),
};

export const onboardingApi = {
  saveStep: (n: number, body: OnboardingStepRequest) =>
    client.post<void>(`/users/me/onboarding/step/${n}`, body),
  finalize: () => client.post<OnboardingFinalizeResponse>('/users/me/onboarding/finalize'),
};

export const taskApi = {
  list: (params?: { status?: TaskStatus; size?: number }) =>
    client.get<TaskListResponse>('/tasks', { params }),
  get: (id: string) => client.get(`/tasks/${id}`),
  complete: (id: string) => client.patch<TaskDto>(`/tasks/${id}`, { status: 'COMPLETE' }),
  skip: (id: string) => client.post<TaskDto>(`/tasks/${id}/skip`, { reason: null }),
};

export const marketplaceApi = {
  list: (category?: PartnerCategory) =>
    client.get<PartnerCard[]>('/marketplace', { params: category ? { category } : {} }),
  click: (slug: string) =>
    client.post<{ clickId: string; redirectUrl: string }>(`/partners/${slug}/click`),
};

export default client;
