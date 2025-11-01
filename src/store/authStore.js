// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios'; // ✅ Use configured axios

const useAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/admin/register', { // ✅ Use api
            name,
            email,
            password,
          });
          set({
            admin: data.admin,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/admin/login', { // ✅ Use api
            email,
            password,
          });
          set({
            admin: data.admin,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await api.post('/admin/logout'); // ✅ Call logout endpoint
          set({
            admin: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear state even if API call fails
          set({
            admin: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;