import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response.data.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          return false;
        }

        try {
          const response = await api.get('/auth/me');
          set({
            user: response.data.data,
            token,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
