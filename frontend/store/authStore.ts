import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          
          // Save token
          localStorage.setItem('access_token', response.access_token);
          
          console.log('✅ Login successful, token saved');
          console.log('👤 User role:', response.user.role);
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return response.user;
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ Login failed:', error);
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          localStorage.setItem('access_token', response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
        console.log('👋 Logged out');
      },

      updateProfile: async (data) => {
        try {
          const updatedUser = await authAPI.updateProfile(data);
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      checkAuth: async () => {
        const token = get().token;
        console.log('🔍 checkAuth - token exists:', !!token);
        
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        
        try {
          const user = await authAPI.getProfile();
          console.log('✅ Auth check passed, user:', user.email);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.log('❌ Auth check failed');
          localStorage.removeItem('access_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
