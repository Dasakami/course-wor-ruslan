import { create } from 'zustand';
import { api } from '../lib/api';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<AuthResponse>('/api/auth/register', data);

      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await api.get<User>('/api/auth/users/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      await get().refreshToken();
    }
  },

  refreshToken: async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      get().logout();
      return;
    }

    try {
      const response = await api.post<{ access_token: string }>('/api/auth/refresh', {
        refresh_token,
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const userRes = await api.get<User>('/api/auth/users/me');
      set({ user: userRes.data, isAuthenticated: true, isLoading: false });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));
