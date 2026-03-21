import { create } from 'zustand';
import { User, AuthResponse } from '@/types';
import { api, tokenStorage } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (!tokenStorage.get()) {
      set({ isInitialized: true });
      return;
    }
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ user, isInitialized: true });
    } catch {
      tokenStorage.clear();
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post<AuthResponse>('/api/auth/login', { email, password });
      tokenStorage.set(data.accessToken);
      tokenStorage.setRefresh(data.refreshToken);
      set({ user: data.user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (form) => {
    set({ isLoading: true });
    try {
      const data = await api.post<AuthResponse>('/api/auth/register', form);
      tokenStorage.set(data.accessToken);
      tokenStorage.setRefresh(data.refreshToken);
      set({ user: data.user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    const rt = tokenStorage.getRefresh();
    if (rt) await api.post('/api/auth/logout', { refreshToken: rt }).catch(() => {});
    tokenStorage.clear();
    set({ user: null });
  },
}));