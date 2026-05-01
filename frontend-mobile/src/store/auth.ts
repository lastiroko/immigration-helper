import { create } from 'zustand';
import { authApi, clearToken, setToken, getToken } from '../api/client';
import type { User } from '../api/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  bootstrap: async () => {
    const token = await getToken();
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const r = await authApi.me();
      set({ user: r.data, loading: false });
    } catch {
      await clearToken();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const r = await authApi.login(email, password);
    await setToken(r.data.accessToken);
    set({
      user: {
        id: r.data.userId, email: r.data.email,
        name: r.data.name, subscriptionTier: r.data.subscriptionTier,
      },
    });
  },

  register: async (email, password, name) => {
    const r = await authApi.register(email, password, name);
    await setToken(r.data.accessToken);
    set({
      user: {
        id: r.data.userId, email: r.data.email,
        name: r.data.name, subscriptionTier: r.data.subscriptionTier,
      },
    });
  },

  logout: async () => {
    await clearToken();
    set({ user: null });
  },
}));
